import { observer } from 'mobx-react-lite'
import { getApi } from './tcpApi'
import never from 'never'
import Connection from './Connection'

const Connections = observer(() => {
  const { connections } = getApi.result ?? never()

  return (
    <>
      <h1>Connections</h1>
      <ul>
        {[...connections].map(
          ([id, connection]) => <Connection key={id} {...{ id, connection }} />)}
      </ul>
    </>
  )
})

export default Connections
