import { gql } from '@apollo/client'
import { EnumExpandStatus } from '../../../types/enums'

export default gql`
  mutation($input: UpdateStatusInput1!) {
    updateStatusAcquisitionRound(input: $input)
  }
`

export type UpdateStatusInput1 = {
  id: string
  status: EnumExpandStatus
  reason: string
}
