import { action } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Write } from './tcpApi'

export interface SentMessageProps {
  write: Write
}

const SentMessages = observer<SentMessageProps>(({ write }) => {
  const messages = useLocalObservable(() => [] as string[])

  useEffect(() => {
    const hook = action(({ args: [data] }: Write): void => {
      console.log(data)
      messages.push(new TextDecoder().decode(data))
    })
    write.registerHookSuccess(hook)
    return () => write.unregisterHook(hook)
  }, [])

  return (
    <>
      <h3>Sent Messages</h3>
      <textarea readOnly value={messages.join('\n')} />
    </>
  )
})

export default SentMessages
