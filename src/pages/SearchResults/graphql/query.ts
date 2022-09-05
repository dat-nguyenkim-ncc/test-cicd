import { gql } from '@apollo/client'

export default gql`
  query SearchCompanies($external: ExternalSearchQuery!, $internal: InternalSearchQuery!) {
    getExternalSearchResults(input: $external) {
      id
      source
      companyDetails {
        companyId
        companyName
        url
        countryName
        countryCode
      }
    }
    getInternalSearchResults(input: $internal) {
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
    }
  }
`

export const SearchInternal = gql`
  query SearchCompanies($internal: InternalSearchQuery!, $isMerge: Boolean) {
    getInternalSearchResults(input: $internal, isMerge: $isMerge) {
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
    }
  }
`
export const SearchExternal = gql`
  query SearchCompanies($external: ExternalSearchQuery!) {
    getExternalSearchResults(input: $external) {
      id
      source
      companyDetails {
        companyId
        companyName
        url
        countryName
        countryCode
      }
    }
  }
`
