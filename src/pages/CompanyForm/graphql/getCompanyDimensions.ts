import { gql } from '@apollo/client'
import Fragments from './fragments'

export default gql`
  query getCompanyDimensions($companyId: Int!, $sources: [String]) {
    getCompanyDimensions(companyId: $companyId, sources: $sources) {
      categories {
        id
        name
        isPrimary
      }
      mapping {
        ...Taxonomy
        parent {
          ...Taxonomy
        }
      }
      extra {
        ...Taxonomy
      }
      tags {
        id
        rowId
        label
        source
        fctStatusId
        selfDeclared
        parent {
          id
          label
        }
      }
      fintechType {
        id
        rowId
        label
        source
        fctStatusId
        selfDeclared
      }
      fintechTypeCRsCount
      tagCRsCount
    }
  }
  ${Fragments.taxonomy}
`

export const NoParent = gql`
  query getCompanyDimensions($companyId: Int!, $sources: [String]) {
    getCompanyDimensions(companyId: $companyId, sources: $sources) {
      categories {
        id
        name
        isPrimary
      }
      mapping {
        ...Taxonomy
        parent {
          ...Taxonomy
        }
      }
      extra {
        ...Taxonomy
      }
      tags {
        id
        rowId
        label
        source
        fctStatusId
        selfDeclared
      }
      fintechType {
        id
        rowId
        label
        source
        fctStatusId
        selfDeclared
      }
    }
  }
  ${Fragments.taxonomy}
`
