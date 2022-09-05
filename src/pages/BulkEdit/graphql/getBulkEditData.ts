import { gql } from '@apollo/client'

export default gql`
  query GetBulkEditData($input: BulkEditCheckCompaniesInput) {
    getBulkEditData(input: $input) {
      data
    }
  }
`
