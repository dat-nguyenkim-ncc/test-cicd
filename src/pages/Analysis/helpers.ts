import { FormOption } from '../../types'
import {
  CombinationType,
  ECombination,
  EKeywordSearch,
  KeywordFilterType,
  OperationFilterType,
} from '../CompanyManagement/CompanyFilter/helpers'
import { defaultPagination } from '../FindFintechs/helpers'

export type AnalysisFilterType = {
  category: FormOption[]
  sector: FormOption[]
  valueChain: FormOption[]
  risk: FormOption[]
  cluster: OperationFilterType[]
  sectorsCombination: CombinationType
  valueChainsCombination: CombinationType
  risksCombination: CombinationType
  clustersCombination: CombinationType
  categoryCombination: CombinationType
  keyword: KeywordFilterType
  uniquenessPercent: number
  page: number
  pageSize: number
}

export const KEYWORD_OPTIONS: FormOption[] = [
  { label: 'Internal tags', value: EKeywordSearch.INTERNAL_TAGS },
  { label: 'External tags', value: EKeywordSearch.EXTERNAL_TAGS },
  { label: 'Website keywords', value: EKeywordSearch.WEBSITE_KEYWORDS },
]

export const INITIAL_KEYWORD: KeywordFilterType = {
  keywords: KEYWORD_OPTIONS,
  operations: [],
}

export const INITIAL_ANALYSIS_FILTER: AnalysisFilterType = {
  category: [],
  sector: [],
  valueChain: [],
  risk: [],
  cluster: [],
  sectorsCombination: ECombination.OR,
  valueChainsCombination: ECombination.OR,
  risksCombination: ECombination.OR,
  clustersCombination: ECombination.OR,
  categoryCombination: ECombination.OR,
  keyword: INITIAL_KEYWORD,
  uniquenessPercent: 5,
  page: defaultPagination.page,
  pageSize: defaultPagination.pageSize,
}

export type AnalysisProps = {
  keyword: string
  number_of_occurrences: string
  uniqueness: string
}
