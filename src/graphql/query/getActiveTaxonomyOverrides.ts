import { gql } from '@apollo/client'

export const GET_ACTIVE_TAXONOMY_OVERRIDES = gql`
  query GetActiveTaxonomyOverrides($companyId: Int!, $users: [String!]) {
    getActiveTaxonomyOverrides(companyId: $companyId) {
      items {
        rowId
        dataOverrideId
        isPrimary
        type
        category
        dimension
        dimensionId
      }
      changeRequestsCount(companyId: $companyId, users: $users)
    }
  }
`

export enum EActiveItemType {
  DIMENSION = 'dimension',
  CATEGORY = 'category',
}

export type GetActiveTaxonomyOverridesResult_items = {
  rowId: string
  dataOverrideId: number
  isPrimary: boolean
  type: EActiveItemType
  category: string | null
  dimension: number | null
  dimensionId: number | null
}

export type GetActiveTaxonomyOverridesResult_changeRequets = {
  linkId: string
  user: string
}

export type GetActiveTaxonomyOverridesResult = {
  getActiveTaxonomyOverrides: {
    items: GetActiveTaxonomyOverridesResult_items[]
    changeRequestsCount: number
  }
}

export type QueryGetActiveTaxonomyOverridesArgs = {
  companyId: number
  users?: string[]
}
