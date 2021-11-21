import { observer } from 'mobx-react-lite'
import { Destroy } from './tcpApi'

export interface DestroyButtonProps {
  destroy: Destroy
}

const DestroyButton = observer<DestroyButtonProps>(({ destroy }) => {
  const destroying = destroy.isExecuting

  return (
    <>
      <button
        onClick={() => destroy.execute()}
        disabled={destroying}
      >
        {destroying ? 'Destroying' : 'Destroy'}
      </button>
    </>
  )
})

export default DestroyButton
