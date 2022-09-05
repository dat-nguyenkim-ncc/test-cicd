import { gql } from '@apollo/client'

export default gql`
  mutation deduplicateCompany($companyId: String!, $status: EnumExpandStatus) {
    deduplicateCompany(companyId: $companyId, status: $status) {
      data
    }
  }
`
