import { gql } from '@apollo/client'

export default gql`
  mutation MapCompanyDimensions($input: MapCompanyDimensionsInput!) {
    mapCompanyDimensions(input: $input) {
      companyId
      dimensions {
        dimensionId
        isPrimary
      }
      categoryId
      tags
    }
  }
`
