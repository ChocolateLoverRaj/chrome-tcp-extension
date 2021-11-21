import { observer } from 'mobx-react-lite'
import DestroyButton from './DestroyButton'
import ReceivedMessages from './ReceivedMessages'
import SentMessages from './SentMessages'
import { Connection } from './tcpApi'
import WriteMessageForm from './WriteMessageForm'

export interface ConnectedConnectionProps {
  connection: Connection
}

const ConnectedConnection = observer<ConnectedConnectionProps>(({ connection }) => {
  return (
    <>
      {' '}- <DestroyButton destroy={connection.destroy} />
      <ReceivedMessages messageEmitter={connection.messageEmitter} />
      <SentMessages write={connection.write} />
      <WriteMessageForm write={connection.write} />
    </>
  )
})

export default ConnectedConnection
