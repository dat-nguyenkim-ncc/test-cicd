import { gql } from '@apollo/client'

export default gql`
  mutation deleteInvestor($investorId: String!) {
    deleteInvestor(investorId: $investorId)
  }
`
