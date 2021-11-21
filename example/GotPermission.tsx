import { FC } from 'react'
import Connect from './Connect'
import Connections from './Connections'

const GotPermission: FC = () => (
  <>
    <Connections />
    <Connect />
  </>)

export default GotPermission
