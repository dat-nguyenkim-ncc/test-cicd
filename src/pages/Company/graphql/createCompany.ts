import { gql } from '@apollo/client'

export default gql`
  mutation CreateCompany($input: [CreateCompanyInput!]!) {
    createCompany(input: $input) {
      companyId
    }
  }
`
