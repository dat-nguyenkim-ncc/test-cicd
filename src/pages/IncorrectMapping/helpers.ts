import { FormOption, IPagination, ISortBy } from '../../types'
import { SortDirection } from '../../types/enums'

export const EColumn = {
  COMPANY_ID: 'company_id',
  COMPANY_NAME: 'name',
  SOURCE: 'source',
  WEBSITE_URL: 'website_url',
  STATUS: 'status',
  FOUNDED_YEAR: 'founded_year',
  FTES_RANGE: 'ftes_range',
  FTES_EXACT: 'ftes_exact',
  CLUSTER: 'mapped_l1_cluster',
  SUGGESTED_MAPPING: 'suggested_l1_cluster',
  SCORE_DELTA: 'mapping_score_delta',
  REVIEWED: 'reviewed',
  REVIEWED_DATE: 'reviewed_date',
  REVIEWER: 'reviewer',
  COMPANY_LOGO: 'logo_url',
  TOTAL_EQUITY_FUNDING: 'total_equity_funding',
  DESCRIPTION: 'description',
  LONG_DESCRIPTION: 'long_description',
  LAST_FUNDING_DATE: 'last_funding_date',
}

export const allColumns: FormOption[] = [
  { label: 'Website', value: EColumn.WEBSITE_URL },
  { label: 'Total Equity Funding', value: EColumn.TOTAL_EQUITY_FUNDING },
  { label: 'Source', value: EColumn.SOURCE },
  { label: 'Founded year', value: EColumn.FOUNDED_YEAR },
  { label: 'Status', value: EColumn.STATUS },
  { label: 'FTEs range', value: EColumn.FTES_RANGE },
  { label: 'FTEs exact', value: EColumn.FTES_EXACT },
  { label: 'Short Description', value: EColumn.DESCRIPTION },
  { label: 'Long Description', value: EColumn.LONG_DESCRIPTION },
  { label: 'Last funding date', value: EColumn.LAST_FUNDING_DATE },
  { label: 'Cluster', value: EColumn.CLUSTER },
  { label: 'Suggested mapping', value: EColumn.SUGGESTED_MAPPING },
  { label: 'Score delta', value: EColumn.SCORE_DELTA },
]

export const ESortFields = {
  SCORE: 'mapping_score_delta',
  TOTAL: 'total_equity_funding',
}

export type SortBy = ISortBy<typeof ESortFields[keyof typeof ESortFields]>

export const defaultSortBy: FormOption[] = [
  { label: 'Mapping score delta', value: EColumn.SCORE_DELTA },
  { label: 'Total Equity Funding', value: EColumn.TOTAL_EQUITY_FUNDING },
]

export const defaultColumns: FormOption[] = [
  { label: 'Short Description', value: EColumn.DESCRIPTION },
  { label: 'Long Description', value: EColumn.LONG_DESCRIPTION },
  { label: 'Total Equity Funding', value: EColumn.TOTAL_EQUITY_FUNDING },
  { label: 'Cluster', value: EColumn.CLUSTER },
  { label: 'Suggested mapping', value: EColumn.SUGGESTED_MAPPING },
  { label: 'Score delta', value: EColumn.SCORE_DELTA },
]

export const defaultQueryColumns = [EColumn.WEBSITE_URL]

export const defaultPagination: IPagination = {
  page: 1,
  pageSize: 10,
}

export type IncorrectMappingFilterType = {
  sortBy: SortBy
  pagination: IPagination
  mapped_l1_cluster: string[]
  suggested_l1_cluster: string[]
  columns: FormOption[]
}

export const initialFilter: IncorrectMappingFilterType = {
  sortBy: {
    field: ESortFields.SCORE,
    direction: SortDirection.DESC,
  },
  pagination: defaultPagination,
  columns: defaultColumns,
  mapped_l1_cluster: [],
  suggested_l1_cluster: [],
}

export type IncorrectMappingDetails = {
  company_id: string
  mapped_l1_cluster: string
  suggested_l1_cluster: string
  mapping_score_delta: string
  reviewed: string
  reviewed_date: string
  reviewer: string
  name: string
  logo_url: string
  total_equity_funding: string
  website_url: string
}
