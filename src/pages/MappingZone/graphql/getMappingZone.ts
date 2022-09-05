import { gql } from '@apollo/client'

export default gql`
  query GetMappingZone($input: MappingZoneInput) {
    getMappingZone(input: $input) {
      total
      companies {
        id
        company_id
        source
        companyDetails {
          ... on InternalCompanyDetails {
            companyTypes
            primaryCategories
            expandStatusId
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
        amount
      }
    }
  }
`
