import { observer } from 'mobx-react-lite'
import { getApi } from './tcpApi'

const RequestPermission = observer(() => {
  if (!getApi.wasExecuted) getApi.execute()

  return (
    <>
      <h1>Request Permission</h1>
      {getApi.wasSuccessful
        ? getApi.result.checkPermission.wasExecuted
          ? getApi.result.checkPermission.result
            ? 'Permission granted'
            : 'Permission denied'
          : getApi.result.checkPermission.isExecuting
            ? 'Requesting permission'
            : (
              <button
                onClick={() => getApi.result.checkPermission.execute()}
              >
                Request permission
              </button>)
        : 'Extension not connected'}
    </>
  )
})

export default RequestPermission
