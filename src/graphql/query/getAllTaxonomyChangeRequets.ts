import { gql } from '@apollo/client'
import { ESortFields } from '../../pages/ChangeRequestManagement/helpers'
import { IDataOverride, ISortBy } from '../../types'

export const GET_ALL_TAXONOMY_CHANGE_REQUESTS = gql`
  query GetAllTaxonomyChangeRequests(
    $companyIds: [Int!]!
    $sortBy: SortBy
    $filterBy: FilterBy
    $keyword: String
    $users: [String!]
  ) {
    getAllTaxonomyChangeRequests(
      companyIds: $companyIds
      sortBy: $sortBy
      filterBy: $filterBy
      keyword: $keyword
      users: $users
    ) {
      dataOverrideId
      rowId
      companyId
      tableName
      columnName
      newValue
      sourceValue
      user
      source
      comment
      auditTimestamp
      selfDeclared
      inputSource
      linkId
      companyName
      name
      isPrimary
      category
      dimension
    }
  }
`

export interface TaxonomyChangeRequest extends IDataOverride {
  linkId: string
  companyName: string
  name: string
  isPrimary: number
  category?: string
  dimension?: number
}

export type GetAllTaxonomyChangeRequestsResult = {
  getAllTaxonomyChangeRequests: TaxonomyChangeRequest[]
}

export type QueryGetAllTaxonomyChangeRequestsArgs = {
  companyIds?: number[]
  sortBy?: ISortBy<ESortFields>
  filterBy?: { isSelfDeclared?: boolean | null }
  keyword?: string
  users?: string[]
}
