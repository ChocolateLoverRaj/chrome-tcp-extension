import { observer } from 'mobx-react-lite'
import ConnectedConnection from './ConnectedConnection'
import ConnectErrorButton from './ConnectErrorButton'
import { ConnectionInfo } from './tcpApi'

export interface ConnectionProps {
  id: number
  connection: ConnectionInfo
}
const Connection = observer<ConnectionProps>(({ id, connection }) => {
  const connected = connection.promise.wasSuccessful
  const { isError } = connection.promise

  return (
    <li>
      {connection.host}:{connection.port}
      {' '}
      {connected
        ? 'Connected'
        : !isError
            ? 'Connecting'
            : connection.promise.error}
      {connected && <ConnectedConnection connection={connection.promise.result} />}
      {isError && <> - <ConnectErrorButton {...{ id }} /></>}
    </li>
  )
})

export default Connection
