import { gql } from '@apollo/client'

export default gql`
  query SearchInternal($internal: InternalSearchQuery!) {
    getInternalSearchResults(input: $internal) {
      id
      company_id
      source
      companyDetails {
        ... on InternalCompanyDetails {
          companyTypes
          primaryCategories
        }
        companyId
        companyName
        url
        countryName
        countryCode
        external_id
        source
        priority
      }
      priority
    }
  }
`
