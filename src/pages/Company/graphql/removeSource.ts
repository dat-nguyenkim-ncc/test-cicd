import { gql } from '@apollo/client'

export default gql`
  mutation RemoveSource($input: RemoveSourceInput!) {
    removeSource(input: $input) {
      companyId
    }
  }
`
