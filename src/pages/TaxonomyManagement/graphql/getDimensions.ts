import { gql } from '@apollo/client'
import { EnumDimensionCategories } from '../../../types/enums'

export type GetDimensionsInput = {
  input: { category: EnumDimensionCategories; dimension: number; level: number }
}

export const GET_DIMENSIONS = gql`
  query GetDimensions($input: GetDimensionsInput!) {
    getDimensions(input: $input) {
      items {
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
        description
      }
    }
  }
`
