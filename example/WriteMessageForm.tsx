import { observer } from 'mobx-react-lite'
import { FormEventHandler, useEffect, useState } from 'react'
import { Write } from './tcpApi'

export interface WriteMessageFormProps {
  write: Write
}

const WriteMessageForm = observer<WriteMessageFormProps>(({ write }) => {
  const [message, setMessage] = useState('')

  const writing = write.isExecuting

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault()
    console.log('Writing', new TextEncoder().encode(message))
    write.execute(new TextEncoder().encode(message))
  }

  useEffect(() => {
    const hook = (): void => {
      setMessage('')
    }
    write.registerHookSuccess(hook)
    return () => write.unregisterHook(hook)
  }, [])

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Send Message
        <input
          disabled={writing}
          value={message}
          onChange={({ target: { value } }) => setMessage(value)}
        />
      </label>
      <button type='submit' disabled={writing}>
        {writing ? 'Sending' : 'Send'}
      </button>
    </form>
  )
})

export default WriteMessageForm
