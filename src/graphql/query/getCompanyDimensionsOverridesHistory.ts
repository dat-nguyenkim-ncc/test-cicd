import { gql } from '@apollo/client'
import { EnumCompanyTypeSector } from '../../types/enums'

export const GET_COMPANY_DIMENSIONS_OVERRIDES_HISTORY = gql`
  query GetCompanyDimensionsOverridesHistory(
    $companyId: Int!
    $category: InternalDbCompanyTypes
    $isPrimary: Boolean
    $ids: [Int!]
  ) {
    getCompanyDimensionsOverridesHistory(
      companyId: $companyId
      category: $category
      isPrimary: $isPrimary
      ids: $ids
    ) {
      id
      name
      category
      dimension
      is_primary

      company_id
      row_id
      table_name
      column_name
      source_value
      new_value
      source
      comment
      change_request
      self_declared
      input_source
      audit_timestamp
      user
    }
  }
`

export type QueryGetCompanyDimensionsOverridesHistoryArgs = {
  companyId: number
  category?: EnumCompanyTypeSector
  isPrimary?: boolean
  ids?: number[]
}

export type GetCompanyDimensionsOverridesHistoryResult = {
  getCompanyDimensionsOverridesHistory: CompanyDimensionsOverridesHistory[]
}

export type CompanyDimensionsOverridesHistory = {
  id: number
  name: string
  category?: string
  is_primary: number
  dimension?: number

  company_id: number
  row_id: string
  table_name: string
  column_name: string
  source_value: string
  new_value: string
  source: string
  comment: string
  change_request: number
  self_declared: number
  input_source: string
  audit_timestamp: string
  user: string
}
