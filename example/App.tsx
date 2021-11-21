import { observer } from 'mobx-react-lite'
import GotPermission from './GotPermission'
import RequestPermission from './RequestPermission'
import { getApi } from './tcpApi'

const App = observer(() => (
  <>
    <RequestPermission />
    {
      getApi.wasSuccessful &&
      getApi.result.checkPermission.wasSuccessful &&
      getApi.result.checkPermission.result &&
        <GotPermission />
    }
  </>))

export default App
