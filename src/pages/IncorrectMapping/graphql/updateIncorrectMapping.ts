import { gql } from '@apollo/client'

export default gql`
  mutation($companyId: Int!) {
    updateIncorrectMapping(companyId: $companyId)
  }
`
