import { ObservableMap, runInAction } from 'mobx'
import { ObservablePromise } from 'mobx-observable-promise'
import Emitter from 'single-event-emitter'
import {
  Code as ReceivedMessageCode,
  Message as ReceivedMessageData
} from '../common/ContentScriptToWindow'
import {
  Code as SentMessageCode,
  Message as SentMessageData
} from '../common/WindowToContentScript'

export type Destroy = ObservablePromise<() => Promise<void>>

export type MessageEmitter = Emitter<[Uint8Array]>

export type Write = ObservablePromise<(data: Uint8Array) => Promise<void>>

export interface Connection {
  messageEmitter: MessageEmitter
  closeEmitter: Emitter<[]>
  write: Write
  destroy: Destroy
}

export type Connect = (host: string, port: number) => void

export type CheckPermission = () => Promise<boolean>

export interface ConnectionInfo {
  host: string
  port: number
  promise: ObservablePromise<() => Promise<Connection>>
}

export type Connections = Map<number, ConnectionInfo>

export interface TcpApi {
  checkPermission: ObservablePromise<CheckPermission>
  connect: Connect
  connections: Connections
}

export const getApi = new ObservablePromise(async (): Promise<TcpApi> => {
  const extensionPort = await new Promise<MessagePort>(resolve => {
    const listener = ({ data, ports }: MessageEvent<unknown>): void => {
      if (data === 'tcp') {
        resolve(ports[0])
        removeEventListener('message', listener)
      }
    }
    addEventListener('message', listener)
  })
  extensionPort.start()
  let connectionId = -1
  const connections: Connections = new ObservableMap()
  const api: TcpApi = {
    connections: connections,
    checkPermission: new ObservablePromise(async () => {
      return await new Promise<boolean>(resolve => {
        const listener = ({ data: [code] }: MessageEvent<ReceivedMessageData>): void => {
          if (code === ReceivedMessageCode.TRUE) {
            extensionPort.removeEventListener('message', listener)
            resolve(true)
          } else if (code === ReceivedMessageCode.FALSE) {
            extensionPort.removeEventListener('message', listener)
            resolve(false)
          }
        }
        extensionPort.addEventListener('message', listener)
        const message: SentMessageData = [SentMessageCode.REQUEST_PERMISSION]
        extensionPort.postMessage(message)
      })
    }),
    connect: async (host, port) => {
      const currentConnectionId = ++connectionId
      // eslint-disable-next-line no-extra-parens
      const promise = new ObservablePromise<() => Promise<Connection>>(async () => {
        await new Promise<void>((resolve, reject) => {
          const listener = ({ data: [code, ...data] }: MessageEvent<ReceivedMessageData>): void => {
            console.log(code, data)
            if (
              code === ReceivedMessageCode.CONNECTED ||
              code === ReceivedMessageCode.CONNECT_ERROR) {
              const [id, ...data2] = data as Exclude<typeof data, []>
              if (id === currentConnectionId) {
                extensionPort.removeEventListener('message', listener)
                if (code === ReceivedMessageCode.CONNECTED) {
                  resolve()
                } else {
                  const [error] = data2
                  reject(error)
                }
              }
            }
          }
          extensionPort.addEventListener('message', listener)
          const message: SentMessageData = [SentMessageCode.CONNECT, host, port]
          extensionPort.postMessage(message)
        })
        const closeEmitter = new Emitter()
        const closeListener = ({ data: [code, ...data] }: MessageEvent<ReceivedMessageData>): void => {
          if (code === ReceivedMessageCode.CLOSED) {
            const [id] = data as [number]
            if (id === currentConnectionId) {
              extensionPort.removeEventListener('message', closeListener)
              runInAction(() => {
                connections.delete(currentConnectionId)
              })
              closeEmitter.emit()
            }
          }
        }
        extensionPort.addEventListener('message', closeListener)
        const messageEmitter: MessageEmitter = new Emitter()
        const messageListener = ({ data: [code, ...data] }: MessageEvent<ReceivedMessageData>): void => {
          if (code === ReceivedMessageCode.DATA) {
            const [id, base64Data] = data as [number, string]
            if (id === currentConnectionId) {
              messageEmitter.emit(Uint8Array.from(window.atob(base64Data), c => c.charCodeAt(0)))
            }
          }
        }
        extensionPort.addEventListener('message', messageListener)
        return {
          closeEmitter,
          messageEmitter,
          write: new ObservablePromise(async (data) => {
            await new Promise<void>(resolve => {
              const listener = ({ data: [code, ...data] }: MessageEvent<ReceivedMessageData>): void => {
                if (code === ReceivedMessageCode.WROTE) {
                  const [id] = data as [number]
                  if (id === currentConnectionId) {
                    extensionPort.removeEventListener('message', listener)
                    resolve()
                  }
                }
              }
              extensionPort.addEventListener('message', listener)
              const message: SentMessageData =
                [SentMessageCode.WRITE, currentConnectionId, window.btoa(new TextDecoder().decode(data))]
              extensionPort.postMessage(message)
            })
          }),
          destroy: new ObservablePromise(async () => {
            await new Promise<void>(resolve => {
              closeEmitter.once(resolve)
              const message: SentMessageData = [SentMessageCode.DESTROY, currentConnectionId]
              extensionPort.postMessage(message)
            })
            runInAction(() => {
              connections.delete(currentConnectionId)
            })
          })
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      promise.execute().catch()
      connections.set(currentConnectionId, {
        host,
        port,
        promise
      })
    }
  }
  return api
})
