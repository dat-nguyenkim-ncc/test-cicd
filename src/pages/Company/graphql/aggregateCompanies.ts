import { gql } from '@apollo/client'

export default gql`
  mutation AggregateCompanies($input: AggregateCompanyInput!, $isMapping: Boolean) {
    aggregateCompanies(input: $input, isMapping: $isMapping) {
      response
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
