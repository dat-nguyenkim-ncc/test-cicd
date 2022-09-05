import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($searchPhrase: String!) {
    technologyProviderSearch(searchPhrase: $searchPhrase) {
      ...TechnologyProviderSearch
    }
  }
  ${Fragments.technologyProviderSearch}
`
