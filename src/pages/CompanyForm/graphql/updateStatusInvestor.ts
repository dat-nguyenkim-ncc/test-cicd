import { gql } from '@apollo/client'

export default gql`
  mutation updateStatusInvestor($isFunding: Boolean, $funding_id: String!, $id: String!, $status: String!) {
    updateStatusInvestor(isFunding: $isFunding, funding_id: $funding_id, id: $id, status: $status)
  }
`
