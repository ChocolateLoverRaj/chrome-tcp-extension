import { observer } from 'mobx-react-lite'
import { getApi } from './tcpApi'
import never from 'never'
import Form from '@rjsf/core'
import { useState } from 'react'

interface FormData {
  host: string
  port: number
}

const Connect = observer(() => {
  const api = getApi.result ?? never()
  const [data, setData] = useState<FormData>({ host: 'localhost', port: 8080 })

  return (
    <>
      <h1>Connect</h1>
      <Form
        formData={data}
        onChange={({ formData }) => setData(formData)}
        onSubmit={({ formData }) => {
          const { host, port } = formData
          api.connect(host, port)
        }}
        schema={{
          type: 'object',
          properties: {
            host: {
              type: 'string'
            },
            port: {
              type: 'number',
              minimum: 0,
              exclusiveMaximum: 65536
            }
          },
          required: ['host', 'port']
        }}
      >
        <button type='submit'>Connect</button>
      </Form>
    </>
  )
})

export default Connect
