import { observer } from 'mobx-react-lite'
import { getApi } from './tcpApi'
import never from 'never'
import { action } from 'mobx'

export interface ConnectErrorButtonProps {
  id: number
}

const ConnectErrorButton = observer<ConnectErrorButtonProps>(({ id }) => {
  const { connections } = getApi.result ?? never()

  return <button onClick={action(() => connections.delete(id))}>Clear Error</button>
})

export default ConnectErrorButton
