import { Node } from '../../components/Tree'
import { EnumDimensionCategories } from '../../types/enums'

export { default } from './TaxonomyManagement'

export type DimensionIdInput = {
  id: string
  isCreate: boolean
}

export type DimensionWithIdNameInput = {
  id: string
  name: string
}
export type DimensionBase = {
  parentId?: string
} & DimensionWithIdNameInput

export type EditDimensionInputItem = {
  id: string
  name: string
  canBeFinal?: boolean
  parent?: DimensionIdInput
}

export type DimensionInputItem = {
  category: EnumDimensionCategories
  dimension: number
  level: number
  canBeFinal: boolean
  description: string
} & DimensionBase

export interface GetDimensionsItem extends Node {
  canBeFinal: boolean
  interrelationships: string[]
  level: number
  parentId?: string
  category: EnumDimensionCategories
  dimension: number
  description: string
}

export type MovingDimensionsItem = GetDimensionsItem & {
  isInvalid: boolean
}

export type Dimension = {
  id: number
  name: string
  level: number
  category: EnumDimensionCategories
  canBeFinal: boolean
  dimension: number
}

export type DimensionCompanyMapping = {
  dimensionId: number
  companyId: number
  isPrimary: boolean
}
