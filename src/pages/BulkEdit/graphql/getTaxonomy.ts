import { gql } from '@apollo/client'

export default gql`
  query GetTaxonomyData {
    getCompanyFilterData {
      sector {
        ...FDimension
      }
      cluster {
        ...FDimension
      }
      valueChain {
        ...FDimension
      }
      risk {
        ...FDimension
      }
    }
  }

  fragment FDimension on GetDimensionsItem {
    id
    name
    children
    isRoot
    canBeFinal
    interrelationships
    parentId
    category
    dimension
    level
  }
`
