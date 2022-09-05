import { gql } from '@apollo/client'

export default gql`
  query getCompanyIds($input: BulkEditCheckCompaniesInput) {
    getCompanyIds(input: $input) {
      companyIds
      hasDuplicated
      hasOut
    }
  }
`
