import nativeMessage = require('chrome-native-messaging')
import { connect, Socket } from 'net'
import RapidStream = require('rapid-stream')
import {
  Code as CodeFromBackground,
  Message as MessageFromBackground
} from '../common/BackgroundToNative'
import {
  Code as CodeToBackground,
  Message as MessageToBackground
} from '../common/NativeToBackground'
import write = require('stream-write')

const connections = new Map<string, Socket>()

process.stdin
  .pipe(new nativeMessage.Input())
  .pipe(RapidStream(Infinity, function ([code, ...data]: MessageFromBackground, _encoding, next) {
    if (code === CodeFromBackground.CONNECT) {
      const [id, host, port] = data as [string, string, number]
      const errorHandler = (err: Error): void => {
        connections.delete(id)
        const message: MessageToBackground = [id, CodeToBackground.CONNECT_ERROR, err.message]
        next(undefined, message)
      }
      const socket = connect(port, host, () => {
        const message: MessageToBackground = [id, CodeToBackground.CONNECTED]
        next(undefined, message)
        socket.off('error', errorHandler)
        const onClose = (): void => {
          connections.delete(id)
          const message: MessageToBackground = [id, 2]
          next(undefined, message)
        }
        socket.on('close', onClose).on('data', data => {
          const message: MessageToBackground = [id, CodeToBackground.MESSAGE, data.toString('base64')]
          next(undefined, message)
        }).on('error', e => {
          if ((e as any).code === 'ECONNRESET') onClose()
          else process.stderr.write('Error: ' + e.message)
        })
      }).on('error', errorHandler)
      connections.set(id, socket)
    } else if (code === CodeFromBackground.DESTROY) {
      const [id] = data
      ;(connections.get(id) as Socket).destroy()
      connections.delete(id)
    } else {
      const [id, base64Data] = data as [string, string]
      const socket = connections.get(id) as Socket
      write(socket, Buffer.from(base64Data, 'base64')).then(() => {
        const message: MessageToBackground = [id, CodeToBackground.WROTE]
        next(undefined, message)
      }, err => {
        const message: MessageToBackground = [id, CodeToBackground.WRITE_ERROR, err.message]
        next(undefined, message)
      })
    }
  }))
  .pipe(new nativeMessage.Output())
  .pipe(process.stdout)

process.on('exit', () => {
  process.stderr.write('Node.js native process exiting')
})
