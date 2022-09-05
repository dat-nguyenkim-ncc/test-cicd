import { uniqBy } from 'lodash'
import { CompanyDimensions, FormOption, OperationState, TagData, TaxonomyState } from '../../types'
import { EnumDimensionType, EnumExpandStatus, EnumExpandStatusId } from '../../types/enums'
import { getFlatSelectedTags } from '../CompanyForm/helpers'
import { BulkEditTaxonomyInput_Tag } from './graphql'

export type OverridesDataInput = {
  company_id: number
  row_id: string | number
  table_name: string
  column_name: string
  source_value: string
  new_value: string
  comment: string
  source: string
}

export enum EBulkEditOptions {
  ADD_NEW = 'ADD_NEW',
  REPLACE_ALL_WITH = 'REPLACE_ALL_WITH',
  FIND_AND_REMOVE_THESE = 'FIND_AND_REMOVE_THESE',
  CLEAR_ALL = 'CLEAR_ALL',
}

export const bulkEditOptions: FormOption[] = [
  { label: 'Add new', value: EBulkEditOptions.ADD_NEW },
  { label: 'Replace all with', value: EBulkEditOptions.REPLACE_ALL_WITH },
  { label: 'Find and remove these', value: EBulkEditOptions.FIND_AND_REMOVE_THESE },
  { label: 'Clear all', value: EBulkEditOptions.CLEAR_ALL },
]

export const getFctStatus = (value?: EnumExpandStatusId) => {
  return value === EnumExpandStatusId.FOLLOWING
    ? EnumExpandStatus.FOLLOWING
    : value === EnumExpandStatusId.DUPLICATED
    ? EnumExpandStatus.DUPLICATED
    : ''
}

export function getOperationChainResult<T, R>(
  state: OperationState<T>[],
  key: keyof R,
  mapFn: (i: T) => R[],
  filterFn?: (i: R, j: R[]) => boolean
) {
  if (!state?.length) return []

  const res = state.reduce((acc: R[], curr) => {
    const items = mapFn(curr.data).map(i => {
      return {
        ...i,
        isRemove: curr.operation === EBulkEditOptions.FIND_AND_REMOVE_THESE,
      }
    })

    if (
      curr.operation === EBulkEditOptions.ADD_NEW ||
      curr.operation === EBulkEditOptions.FIND_AND_REMOVE_THESE
    ) {
      return [
        ...acc.filter(item =>
          filterFn ? filterFn(item, items) : !items.some(i => item[key] === i[key])
        ),
        ...items,
      ]
    } else if (curr.operation === EBulkEditOptions.CLEAR_ALL) {
      return []
    } else if (curr.operation === EBulkEditOptions.REPLACE_ALL_WITH) {
      return items
    }

    return acc
  }, [])

  return uniqBy(res, key)
}

export const getBulkEditTaxonomyInput_Dimensions = (
  state: OperationState<TaxonomyState>[]
): CompanyDimensions[] => {
  return getOperationChainResult<TaxonomyState, CompanyDimensions>(
    state,
    'link_id',
    data => getFlatSelectedTags(data),
    (item, list) =>
      !list.some(
        d =>
          item.id === d.id &&
          item.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id ===
            d.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id
      )
  )
}

export const getBulkEditTaxonomyInput_Tag = (
  state: OperationState<TagData[]>[]
): BulkEditTaxonomyInput_Tag[] => {
  return getOperationChainResult<TagData[], BulkEditTaxonomyInput_Tag>(state, 'id', data =>
    data.map(item => ({
      id: item.id,
    }))
  )
}

export const getOperation = (state: OperationState<any>[]): EBulkEditOptions | null => {
  if (!state?.length) return null

  return state.reduce((op, curr) => {
    const operation = curr.operation
    if (operation === EBulkEditOptions.ADD_NEW) {
      return op === EBulkEditOptions.REPLACE_ALL_WITH ? op : operation
    } else if (operation === EBulkEditOptions.FIND_AND_REMOVE_THESE) {
      return op
    } else {
      return operation
    }
  }, state[0].operation)
}
