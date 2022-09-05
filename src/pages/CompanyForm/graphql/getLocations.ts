import { gql } from '@apollo/client'
import { Fragments } from '.'

export const getRegion = gql`
  query getRegion {
    getRegion {
      label
      value
    }
  }
`

export const getCountry = gql`
  query getCountry($region: String) {
    getCountry(region: $region) {
      label
      value
      regionValue
    }
  }
`

export const GET_COMPANY_LOCATIONS = gql`
  query($companyId: Int!) {
    getCompanyLocations(companyId: $companyId) {
      ...CompanyLocation
    }
  }

  ${Fragments.companyLocation}
`
