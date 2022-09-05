import gql from 'graphql-tag'
import { DimensionIdInput, DimensionInputItem, EditDimensionInputItem } from '..'
import { EnumDimensionCategories } from '../../../types/enums'

export const MODIFY_DIMENSIONS = gql`
  mutation ModifyDimensions($input: ModifyDimensionsInput!) {
    modifyDimensions(input: $input)
  }
`
export type AddDimensionInputItem = {
  createId: string
  parent?: DimensionIdInput
} & Omit<DimensionInputItem, 'id' | 'parent'>

export type ModifyDimensionsInput = {
  items: AddDimensionInputItem[]
  editItems: EditDimensionInputItem[]
  interrelationships: DimensionsInterrelationshipsItem[]
  removeIds: number[]
}

type DimensionsInterrelationshipsItem = {
  dimension1: DimensionIdInput
  dimension2: DimensionIdInput
  dimension1ChildIds: number[]
  category: EnumDimensionCategories
  isRemove?: boolean
}
