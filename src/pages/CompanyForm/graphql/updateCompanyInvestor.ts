import { gql } from '@apollo/client'

export default gql`
  mutation updateCompanyInvestor($funding_id: String!, $id: String!, $lead_investor: Int!) {
    updateCompanyInvestor(funding_id: $funding_id, id: $id, lead_investor: $lead_investor)
  }
`
