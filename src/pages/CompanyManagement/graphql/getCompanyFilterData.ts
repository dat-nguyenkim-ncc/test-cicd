import { gql } from '@apollo/client'

export default gql`
  query GetCompanyFilterData {
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
      geography {
        region {
          name
        }
        region1 {
          name
          parent
        }
        region2 {
          name
          parent
          parent1
        }
        countries {
          name
          parent
          parent1
          parent2
        }
      }
      tagGroups {
        id
        label
        children {
          label
          id
        }
      }
      roundTypes {
        id
        name
        children {
          id
          name
        }
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
