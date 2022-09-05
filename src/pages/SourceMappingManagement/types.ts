import { FieldTypes } from '../../components/TextField'

export type FundingRoundMappingDTO = {
  sourceValue: string
  round2Id: number
  round1Id: number
  round1: string
  round2: string
  id: number
}

export type FundingRoundMappingResponse = { data: FundingRoundMappingDTO[]; total: number }

export type GetFundingRoundMappingsResponse = {
  getFundingRoundMappings: FundingRoundMappingResponse
}

export type PendingFundingRoundMappingUpdate = Record<
  keyof Omit<FundingRoundMappingDTO, 'id'>,
  string | number
>

export type FundingRoundMappingFieldDTO = {
  field: keyof FundingRoundMappingDTO
  key: keyof FundingRoundMappingDTO
  label: string
  canEdit: boolean
  validate?: (v: string | number) => boolean
  format?: (v: string | number) => string
  fieldType: FieldTypes
  disablePopover?: boolean
  formLabel?: string
}

export type FundingRoundMappingFilterDTO = {
  sourceValue?: string
  round2Id: number
  round1Id: number
  isSourceValueBlank: boolean
}
