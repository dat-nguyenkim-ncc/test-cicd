import { gql } from '@apollo/client'

export default gql`
  query GetTotalCompanyManagement($input: CompanyManagementInput) {
    getTotalCompanyManagement(input: $input) {
      total
    }
  }
`
