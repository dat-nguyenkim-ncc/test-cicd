import { gql } from '@apollo/client'
import { Fragments } from '../../CompanyForm/graphql'

export default gql`
  query GetInternalCompaniesByIds($input: [GetInternalCompanyById]!) {
    getInternalCompaniesByIds(input: $input) {
      companies {
        id
        companyName
        ... on InternalCompanyResult {
          business {
            header
            body
          }
        }
        ... on InternalCompanyResult {
          people {
            numberOfPeople
          }
        }
        overview {
          ...Overview
          companyLocation {
            id
            address
            postalCode
            location {
              city
              country
            }
            isHeadQuarter
          }
        }
        financials {
          ...Financials
        }
      }
    }
  }
  ${Fragments.financials}
  ${Fragments.overview}
`
