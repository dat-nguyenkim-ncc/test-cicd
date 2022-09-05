import { gql } from '@apollo/client'

export default gql`
  query getTaxonomy($category: InternalDbCompanyTypes!) {
    getTaxonomy(category: $category) {
      taxonomy
    }
  }
`
