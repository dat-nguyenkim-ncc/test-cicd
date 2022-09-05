import { gql } from '@apollo/client'
import { Fragments } from '../../CompanyForm/graphql'

export default gql`
  query GetInternalCompanyById($id: Int!, $isBcgAux: Boolean) {
    getInternalCompanyById(id: $id, isBcgAux: $isBcgAux) {
      id
      source
      companyName
      ... on InternalCompanyResult {
        business {
          id
          header
          body
        }

        acquisitions {
          ...Acquisition
          investors {
            ...Investor
          }
        }

        ipos {
          ...Ipos
        }
      }
      overview {
        ...Overview
        aliases {
          alias_id
          company_alias
          expand_status_id
          selfDeclared
          source
        }
        companyLocation {
          id
          address
          postalCode
          location {
            city
            country
            region
          }
          isHeadQuarter
          selfDeclared
          expandStatus
          source
        }
        attachments {
          name
          description
          type
          url_attachment
          expandStatus
          selfDeclared
          date_created
        }
      }
      financials {
        ...Financials
      }
      technology {
        ...CompanyTechnology
      }
      technologyProvider {
        ...CompanyTechnologyProvider
      }
      technologyCertification {
        ...CompanyTechnologyCertification
      }
    }
  }
  ${Fragments.investor}
  ${Fragments.acquisition}
  ${Fragments.financials}
  ${Fragments.overview}
  ${Fragments.ipos}
  ${Fragments.companyTechnology}
  ${Fragments.companyTechnologyProvider}
  ${Fragments.companyTechnologyCertification}
`
