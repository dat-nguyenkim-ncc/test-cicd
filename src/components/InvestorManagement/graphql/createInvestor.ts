import { gql } from '@apollo/client'

export default gql`
  mutation createInvestor($investor: InvestorInput!) {
    createInvestor(investor: $investor)
  }
`
