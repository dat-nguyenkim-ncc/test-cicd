import {
  FundingAmountType,
  GeographyType,
  YearRangeType,
  DateRangeType,
} from '../../components/MappingZone/FilterForm/helpers'
import { FormOption, IPagination, ISortBy } from '../../types'
import { SortDirection } from '../../types/enums'
import { EKeywordSearch, KeywordFilterType } from '../CompanyManagement/CompanyFilter/helpers'

export enum ESortFields {
  NAME = 'company_name',
  TOTAL = 'total_equity_funding_USD',
  LAST_FUNDING_DATE = 'last_funding_date',
}

export type SortBy = ISortBy<ESortFields>

export const defaultSortBy: FormOption[] = [
  { label: 'Name', value: 'company_name' },
  { label: 'Total Equity Funding', value: 'total_equity_funding_USD' },
  { label: 'Last Funding Date', value: 'last_funding_date' },
]

export const defaultColumns: FormOption[] = [
  { label: 'Name', value: 'company_name' },
  { label: 'Website', value: 'url' },
  { label: 'Total Equity Funding', value: 'total_equity_funding_USD' },
  { label: 'Source', value: 'source' },
  { label: 'Suggested mapping', value: 'suggested_mapping' },
  { label: 'Score delta', value: 'score_delta' },
]

export const defaultPagination: IPagination = {
  page: 1,
  pageSize: 10,
}

export const keywordOptions: FormOption[] = [
  { label: 'Description', value: EKeywordSearch.DESCRIPTIONS },
  { label: 'External tags', value: EKeywordSearch.EXTERNAL_TAGS },
]

export type FindFintechsFilterType = {
  sortBy: SortBy
  pagination: IPagination
  columns: FormOption[]
  source?: string
  description?: string
  keywords?: KeywordFilterType
  foundedYears: {
    year: string
    yearRange: YearRangeType
  }
  lastFundingDates: {
    date: string
    dateRange: DateRangeType
  }
  status?: string
  ftesRange: string[]
  fundingAmount: FundingAmountType
  geography: GeographyType
  suggestedMapping: string[]
}

export const initialFilter: FindFintechsFilterType = {
  sortBy: {
    field: ESortFields.TOTAL,
    direction: SortDirection.DESC,
  },
  pagination: defaultPagination,
  columns: defaultColumns,
  geography: {
    region: [],
    region1: [],
    region2: [],
    countries: [],
  },
  fundingAmount: {
    from: '',
    to: '',
  },
  foundedYears: {
    year: '',
    yearRange: {
      from: '',
      to: '',
    },
  },
  lastFundingDates: {
    date: '',
    dateRange: {
      from: '',
      to: '',
    },
  },
  ftesRange: [],
  suggestedMapping: [],
  keywords: {
    keywords: keywordOptions,
    operations: [],
  },
}

export type FindFintechsCompanyDetails = {
  external_id: string
  source: string
  company_name: string
  url: string
  short_description: string
  long_description: string
  hq_country: string
  founded_year: string
  status: string
  ftes_range: string
  ftes_exact: string
  total_equity_funding_USD: string
  countryCode: string
}

export type IsRangeType = {
  foundedYear: boolean
  lastFundingDate: boolean
}

export type CompanyTractionsFilterType = {
  take: number
  skip: number
  topic: string
  dateFrom: string
  dateTo: string
  textSentence: string
  date: string
  isRange: boolean
}

export const initialTractionsFilter: CompanyTractionsFilterType = {
  take: defaultPagination.pageSize,
  skip: defaultPagination.page,
  topic: '',
  dateFrom: '',
  dateTo: '',
  textSentence: '',
  date: '',
  isRange: false,
}
