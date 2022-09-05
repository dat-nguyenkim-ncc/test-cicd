import { gql } from '@apollo/client'

export default gql`
  mutation CreateCompanyManual($input: CreateCompanyManualInput!) {
    createCompanyManual(input: $input) {
      companyId
    }
  }
`
