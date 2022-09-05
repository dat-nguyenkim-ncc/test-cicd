import { gql } from '@apollo/client'
import { Dimension, DimensionCompanyMapping } from '..'

export type Input = {
  targetCluster: number
  movingClusters: number[]
}

export type Result = {
  invalid: boolean
  mappings: DimensionCompanyMapping[] | null
  targetSectorsInterrelated: Dimension[] | null
  movingSectorsInterrelated: Dimension[] | null
}

export default gql`
  query CheckClustersMovable($input: CheckClustersMovableInput) {
    checkClustersMovable(input: $input) {
      invalid
      mappings {
        dimensionId
        companyId
        isPrimary
      }
      targetSectorsInterrelated {
        ...FDimension1
      }
      movingSectorsInterrelated {
        ...FDimension1
      }
    }
  }

  fragment FDimension1 on Dimension {
    id
    name
    level
    category
    canBeFinal
    dimension
  }
`
