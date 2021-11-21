import {
  Message as MessageFromWindow,
  Code as CodeFromWindow
} from '../common/WindowToContentScript'
import {
  Code as CodeToWindow,
  Message as MessageToWindow
} from '../common/ContentScriptToWindow'
import {
  Code as CodeToBackground,
  Message as MessageToBackground
} from '../common/ContentScriptToBackground'
import {
  Code as CodeFromBackground,
  Message as MessageFromBackground
} from '../common/BackgroundToContentScript'

const channel = new MessageChannel()

enum State { UNSET, REQUESTING, GRANTED, DENIED }
let state = State.UNSET
let connectionId = -1

chrome.runtime.onConnect.addListener(backgroundPort => {
  backgroundPort.onMessage.addListener(([code, ...data]: MessageFromBackground) => {
    if (code === CodeFromBackground.TRUE || code === CodeFromBackground.FALSE) {
      const wasWaiting = state === State.REQUESTING
      state = code === CodeFromBackground.TRUE ? 2 : 3
      if (wasWaiting) sendPermission()
    } else if (code === CodeFromBackground.CONNECTED) {
      console.log('Connected')
      const [connectionId] = data as [number]
      const message: MessageToWindow = [CodeToWindow.CONNECTED, connectionId]
      channel.port1.postMessage(message)
    } else if (code === CodeFromBackground.CONNECT_ERROR) {
      const [connectionId, error] = data as [number, string]
      const message: MessageToWindow = [CodeToWindow.CONNECT_ERROR, connectionId, error]
      channel.port1.postMessage(message)
    } else if (code === CodeFromBackground.CLOSE) {
      const [connectionId] = data as [number]
      console.log('Close', connectionId)
      const message: MessageToWindow = [CodeToWindow.CLOSED, connectionId]
      channel.port1.postMessage(message)
    } else if (code === CodeFromBackground.WROTE) {
      const [connectionId] = data as [number]
      const message: MessageToWindow = [CodeToWindow.WROTE, connectionId]
      channel.port1.postMessage(message)
    } else if (code === CodeFromBackground.WRITE_ERROR) {
      const [connectionId, error] = data as [number, string]
      const message: MessageToWindow = [CodeToWindow.WRITE_ERROR, connectionId, error]
      channel.port1.postMessage(message)
    } else if (code === CodeFromBackground.DATA) {
      const [connectionId, base64Data] = data as [number, string]
      const message: MessageToWindow = [CodeToWindow.DATA, connectionId, base64Data]
      channel.port1.postMessage(message)
    }
  })
  channel.port1.onmessage = ({ data }: MessageEvent<MessageFromWindow>) => {
    if (!(data instanceof Array)) return
    const [code, ...moreData] = data
    if (code === CodeFromWindow.REQUEST_PERMISSION) {
      if (state === State.UNSET) {
        const message: MessageToBackground = [CodeToBackground.REQUEST_PERMISSION]
        backgroundPort.postMessage(message)
        state = State.REQUESTING
      } else if (state !== State.REQUESTING) {
        sendPermission()
      }
    } else if (code === CodeFromWindow.CONNECT) {
      const [host, port] = moreData as [string, number]
      if (typeof host !== 'string' || !Number.isInteger(port) || port < 0 || port > 65536) return
      const message: MessageToBackground = [CodeToBackground.CONNECT, ++connectionId, host, port]
      backgroundPort.postMessage(message)
    } else if (code === CodeFromWindow.DESTROY) {
      const [id] = moreData as [number]
      if (id <= connectionId) {
        const message: MessageToBackground = [CodeToBackground.DESTROY, id]
        backgroundPort.postMessage(message)
      } else console.warn(`Cannot destroy connection ${id} because it doesn't exist`)
    } else if (code === CodeFromWindow.WRITE) {
      const [id, data] = moreData as [number, string]
      if (id <= connectionId) {
        if (typeof data === 'string') {
          const message: MessageToBackground = [CodeToBackground.WRITE, id, data]
          backgroundPort.postMessage(message)
        } else console.warn('Invalid data - expected type string, but got:', data)
      } else console.warn(`Cannot write to connection ${id} because it doesn't exist`)
    }
  }
  window.postMessage('tcp', '*', [channel.port2])
})

function sendPermission (): void {
  channel.port1.postMessage([state === State.GRANTED ? 0 : 1])
}
