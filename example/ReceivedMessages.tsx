import { action } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect } from 'react'
import { MessageEmitter } from './tcpApi'

export interface ReceivedMessagesProps {
  messageEmitter: MessageEmitter
}
const ReceivedMessages = observer<ReceivedMessagesProps>(({ messageEmitter }) => {
  const messages = useLocalObservable(() => [] as string[])
  useEffect(() => {
    const listener = action((message: Uint8Array): void => {
      messages.push(new TextDecoder().decode(message))
    })
    messageEmitter.on(listener)
    return () => {
      messageEmitter.off(listener)
    }
  }, [])

  return (
    <>
      <h3>Received Messages</h3>
      <textarea readOnly value={messages.join('\n')} />
    </>
  )
})

export default ReceivedMessages
