import { FormOption, RoundTypesOption } from '../../types'
import { OverridesCompanyDataInput, validateNumber2 } from '../CompanyForm/helpers'
import {
  FundingRoundMappingDTO,
  FundingRoundMappingFieldDTO,
  FundingRoundMappingFilterDTO,
} from './types'

export type CurrencyConversionType = {
  id: number
  year: string
  currency: string
  rate: string
}
export enum ECurrencyConversion {
  ID = 'id',
  RATE = 'rate',
  YEAR = 'year',
  CURRENCY = 'currency',
}
export type UpdateCurrencyConversionState = Record<
  keyof CurrencyConversionType,
  OverridesCompanyDataInput
>
export type Field = {
  key: ECurrencyConversion
  label: string
  canEdit?: boolean
  validate?: (v: string | number) => boolean
  format?: (v: string | number) => string
}
export const fields: Field[] = [
  { key: ECurrencyConversion.YEAR, label: 'Year', canEdit: false },
  { key: ECurrencyConversion.CURRENCY, label: 'Currency', canEdit: false },
  {
    key: ECurrencyConversion.RATE,
    label: 'Rate',
    canEdit: true,
    validate: v => !+v || validateNumber2(v) === 'Invalid number',
    format: v => Number.parseFloat(`${v}`).toFixed(9),
  },
]
export type FilterType = {
  year: string
  currency: string
}

export enum ESourceMappingTab {
  CURRENCY_CONVERSION,
  ROUND_MAPPING,
}

export enum ECurrencyConversionTab {
  EDIT,
  ADD,
}

export const allOption = { label: 'All', value: 'all' }

// TODO get data from db
export const currencyOptions = [
  {
    label: 'AED',
    value: 'AED',
  },
  {
    label: 'ARS',
    value: 'ARS',
  },
  {
    label: 'AUD',
    value: 'AUD',
  },
  {
    label: 'BDT',
    value: 'BDT',
  },
  {
    label: 'BGN',
    value: 'BGN',
  },
  {
    label: 'BHD',
    value: 'BHD',
  },
  {
    label: 'BRL',
    value: 'BRL',
  },
  {
    label: 'CAD',
    value: 'CAD',
  },
  {
    label: 'CHF',
    value: 'CHF',
  },
  {
    label: 'CNH',
    value: 'CNH',
  },
  {
    label: 'CNY',
    value: 'CNY',
  },
  {
    label: 'COP',
    value: 'COP',
  },
  {
    label: 'CZK',
    value: 'CZK',
  },
  {
    label: 'DKK',
    value: 'DKK',
  },
  {
    label: 'EGP',
    value: 'EGP',
  },
  {
    label: 'EUR',
    value: 'EUR',
  },
  {
    label: 'GBP',
    value: 'GBP',
  },
  {
    label: 'HKD',
    value: 'HKD',
  },
  {
    label: 'HUF',
    value: 'HUF',
  },
  {
    label: 'IDR',
    value: 'IDR',
  },
  {
    label: 'ILS',
    value: 'ILS',
  },
  {
    label: 'INR',
    value: 'INR',
  },
  {
    label: 'IRN',
    value: 'IRN',
  },
  {
    label: 'ISK',
    value: 'ISK',
  },
  {
    label: 'JPY',
    value: 'JPY',
  },
  {
    label: 'KRW',
    value: 'KRW',
  },
  {
    label: 'KWD',
    value: 'KWD',
  },
  {
    label: 'KZT',
    value: 'KZT',
  },
  {
    label: 'LKD',
    value: 'LKD',
  },
  {
    label: 'LKR',
    value: 'LKR',
  },
  {
    label: 'MAD',
    value: 'MAD',
  },
  {
    label: 'MXN',
    value: 'MXN',
  },
  {
    label: 'MYR',
    value: 'MYR',
  },
  {
    label: 'NGN',
    value: 'NGN',
  },
  {
    label: 'NOK',
    value: 'NOK',
  },
  {
    label: 'NZD',
    value: 'NZD',
  },
  {
    label: 'PEN',
    value: 'PEN',
  },
  {
    label: 'PHP',
    value: 'PHP',
  },
  {
    label: 'PKR',
    value: 'PKR',
  },
  {
    label: 'PLN',
    value: 'PLN',
  },
  {
    label: 'PNL',
    value: 'PNL',
  },
  {
    label: 'RON',
    value: 'RON',
  },
  {
    label: 'RUB',
    value: 'RUB',
  },
  {
    label: 'SEK',
    value: 'SEK',
  },
  {
    label: 'SGD',
    value: 'SGD',
  },
  {
    label: 'THB',
    value: 'THB',
  },
  {
    label: 'TRY',
    value: 'TRY',
  },
  {
    label: 'TWD',
    value: 'TWD',
  },
  {
    label: 'UAH',
    value: 'UAH',
  },
  {
    label: 'VEF',
    value: 'VEF',
  },
  {
    label: 'VND',
    value: 'VND',
  },
  {
    label: 'ZAR',
    value: 'ZAR',
  },
]

export const yearOptions = [
  {
    label: '2022',
    value: '2022',
  },
  {
    label: '2021',
    value: '2021',
  },
  {
    label: '2020',
    value: '2020',
  },
  {
    label: '2019',
    value: '2019',
  },
  {
    label: '2018',
    value: '2018',
  },
  {
    label: '2017',
    value: '2017',
  },
  {
    label: '2016',
    value: '2016',
  },
  {
    label: '2015',
    value: '2015',
  },
  {
    label: '2014',
    value: '2014',
  },
  {
    label: '2013',
    value: '2013',
  },
  {
    label: '2012',
    value: '2012',
  },
]

export const validateRound2Id = (round2: number | string) => !round2 || +round2 === EMPTY_ROUND_ID

export const FIRST_PAGE = 1

export enum FundingRoundMappingColumns {
  SOURCE_VALUE = 'sourceValue',
  ROUND1ID = 'round1Id',
  ROUND2ID = 'round2Id',
  IS_BLANK = 'isSourceValueBlank',
}

const SOURCE_VALUE_FIELD: FundingRoundMappingFieldDTO = {
  field: 'sourceValue',
  label: 'Source Value',
  canEdit: false,
  key: 'sourceValue',
  fieldType: 'input',
  formLabel: 'Source Value',
}

export const EMPTY_ROUND_ID = -1

const ROUND_2_ID_FIELD: FundingRoundMappingFieldDTO = {
  field: 'round2Id',
  label: 'Round 2 ID',
  canEdit: true,
  key: 'round2Id',
  fieldType: 'dropdown',
  validate: validateRound2Id,
  formLabel: 'Round 2',
}

export const ROUND_TYPE_FIELDS: FundingRoundMappingFieldDTO[] = [
  {
    field: 'round1Id',
    label: 'Round 1 ID',
    canEdit: true,
    key: 'round1Id',
    fieldType: 'dropdown',
    disablePopover: true,
    formLabel: 'Round 1',
  },
  ROUND_2_ID_FIELD,
]

export const FUNDING_ROUND_EDITING_FIELDS: FundingRoundMappingFieldDTO[] = [
  SOURCE_VALUE_FIELD,
  ...ROUND_TYPE_FIELDS,
]

export const FUNDING_ROUND_VIEWING_FIELDS: FundingRoundMappingFieldDTO[] = [
  SOURCE_VALUE_FIELD,
  ROUND_2_ID_FIELD,
  { field: 'round1', label: 'Round 1', canEdit: true, key: 'round1', fieldType: 'dropdown' },
  { field: 'round2', label: 'Round 2', canEdit: true, key: 'round2', fieldType: 'dropdown' },
]

export const getRoundTypeOptions = (
  key: string,
  round1Id: number,
  roundTypeOptions: RoundTypesOption
) => {
  return key === FundingRoundMappingColumns.ROUND1ID
    ? roundTypeOptions?.roundType1 || []
    : roundTypeOptions?.roundType2?.[round1Id] || []
}

export const BLANK_LABEL = 'Blank'

export const DEFAULT_ROUND_TYPE_OPTION: FormOption = { label: BLANK_LABEL, value: EMPTY_ROUND_ID }

export const DEFAULT_FILTER: FundingRoundMappingFilterDTO = {
  round1Id: EMPTY_ROUND_ID,
  round2Id: EMPTY_ROUND_ID,
  sourceValue: '',
  isSourceValueBlank: false,
}

export const getMappingAfterUpdatingRound1OrRound2 = (
  key: keyof FundingRoundMappingDTO,
  value: string | number,
  originMapping: FundingRoundMappingDTO,
  roundTypeOptions: RoundTypesOption
) => {
  switch (key) {
    case FundingRoundMappingColumns.ROUND1ID: {
      return {
        ...originMapping,
        round1Id: value,
        round1: roundTypeOptions.roundType1.find(({ value: round }) => round === value)?.label,
        round2Id: EMPTY_ROUND_ID,
        round2: '',
      } as FundingRoundMappingDTO
    }

    case FundingRoundMappingColumns.ROUND2ID: {
      return {
        ...originMapping,
        round2Id: value,
        round2: (roundTypeOptions.roundType2[originMapping.round1] || []).find(
          ({ value: round }) => round === value
        )?.label,
      } as FundingRoundMappingDTO
    }

    default:
      return originMapping
  }
}
