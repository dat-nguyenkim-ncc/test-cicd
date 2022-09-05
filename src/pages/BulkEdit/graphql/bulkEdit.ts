import { gql } from '@apollo/client'
import { EBulkEditOptions } from '../helpers'

export const BULK_EDIT_OVERVIEW = gql`
  mutation($input: BulkEditOverviewInput!) {
    bulkEditOverview(input: $input)
  }
`
export const BULK_EDIT_TAXONOMY = gql`
  mutation BulkEditTaxonomy($input: BulkEditTaxonomyInput!) {
    bulkEditTaxonomy(input: $input)
  }
`
export type BulkEditTaxonomyInput_Dimensions = {
  isPrimary: boolean
  dimensionId: string
  parentId?: string
  isRemove?: boolean
}

export type BulkEditTaxonomyInput_Tag = {
  id: string
  isRemove?: boolean
}

export type BulkEditTaxonomyInput = {
  companyIds: number[]
  dimensions: BulkEditTaxonomyInput_Dimensions[]
  tags: BulkEditTaxonomyInput_Tag[]
  actions: {
    aux: EBulkEditOptions | null
    tag: EBulkEditOptions | null
    fintechType: EBulkEditOptions | null
  }
  fintechType: BulkEditTaxonomyInput_Tag[]
  mapAsOut: boolean
  reason: string
}

export type MutationBulkEditTaxonomyArgs = {
  input: BulkEditTaxonomyInput
}
