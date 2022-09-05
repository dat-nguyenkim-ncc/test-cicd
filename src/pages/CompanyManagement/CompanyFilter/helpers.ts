import {
  EnumAttachmentType,
  EnumCompanyTypeSector,
  EnumExpandStatusId,
} from './../../../types/enums'
import { EnumTagGroupSource } from '../../../types/enums'
import { FormOption, ISortBy } from '../../../types'
import { GetDimensionsItem } from '../../TaxonomyManagement'
import { TractionTopic } from '../../../components/TractionsList/TractionsList'

export enum ECombination {
  OR = 'or',
  AND = 'and',
}

export enum EKeywordSearch {
  DESCRIPTIONS = 'descriptions',
  INTERNAL_TAGS = 'internalTags',
  EXTERNAL_TAGS = 'externalTags',
  WEBSITE_KEYWORDS = 'websiteKeywords',
  DIMENSION_PRIMARY = 'primaryDimension',
  DIMENSION_SECONDARY = 'auxiliaryDimension',
  NEWS = 'news',
}

export enum ESortFields {
  ISSUE_NUMBER = 'issue_number',
  NAME = 'name',
  PUBLISHED_DATE = 'published_date',
  UPLOADED_DATE = 'uploaded_date',
}

export type SortBy = ISortBy<ESortFields>

export type CompanyManagementResult = {
  company_id: number
  name: string
  website_url?: string
  description?: string
  long_description?: string
  founded_year?: string
  status?: string
  logo_url?: string
  contact_email?: string
  phone_number?: string
  company_type?: string
  expand_status_id?: number
  fct_status_id?: EnumExpandStatusId
  facebook_url?: string
  linkedin_url?: string
  twitter_url?: string
  ftes_range?: string
  ftes_exact?: string
  country_name?: string
  countryCode?: string
  city?: string
  region1_name?: string
  region2_name?: string
  region3_name?: string
  priority_source?: string
  lastest_valuation?: number
  company_stage?: string
  category?: DimensionTypeResult[]
  sector?: DimensionTypeResult[]
  value_chain?: DimensionTypeResult[]
  risk?: DimensionTypeResult[]
  cluster?: DimensionTypeResult[]
  logo_bucket_url?: string
}

export type CompanyManagementIdsResult = {
  companyIds: number[]
  hasDuplicated: boolean
  hasOut: boolean
}

export type DimensionTypeResult = {
  name: string
  is_primary: number
}

export type CombinationType = ECombination.OR | ECombination.AND

export type OperationFilterType = {
  value: FormOption[]
  combination: CombinationType
  isNot?: boolean
  clusterIds?: number[]
}
export type OperationValueFilterType = {
  value: string | number
  combination: CombinationType
  isNot?: boolean | undefined
}

export type OverviewFilterType = {
  isBlankFoundedYear: boolean
  years: {
    isRange: boolean
  } & RangeType
  isBlankDescription: boolean
  description: string[]
  descriptionCombination: CombinationType
  categoryCombination: CombinationType
  category: FormOption[]
  sector: FormOption[]
  valueChain: FormOption[]
  risk: FormOption[]
  cluster: OperationFilterType[]
  tags: OperationFilterType[]
  mappingType: string | null
  fintechTypesCombination: CombinationType
  fintechTypes: FormOption[]
  operationStatuses: string | null
  isBlankEmployeesCount: boolean
  employeeCount: RangeType
  fctStatusId: number | null
  sectorsCombination: CombinationType
  clustersCombination: CombinationType
  risksCombination: CombinationType
  valueChainsCombination: CombinationType
}
export type KeywordFilterType = {
  keywords: FormOption[]
  operations: OperationValueFilterType[]
}

export type GeographyFilterType = {
  region: ItemGeographyType[]
  region1: ItemGeographyType[]
  region2: ItemGeographyType[]
  countries: ItemGeographyType[]
  city: string[]
  isBlankCity: boolean
}

export type FinancingFilterType = {
  totalFunding: RangeType
  latestExpandRound1Amount: {
    from: ''
    to: ''
  }
  latestExpandRound1Type: FormOption[]
  latestExpandRound2Amount: RangeType
  latestExpandRound2Type: FormOption[]
  allExpandRound1Amount: RangeType
  allExpandRound1Type: FormOption[]
  allExpandRound2Amount: RangeType
  allExpandRound2Type: FormOption[]
  isBlankFundingYear: boolean
  fundingYear: {
    isRange: boolean
  } & RangeType
  isBlankInvestor: boolean
  investors: FormOption[]
  isBlankLeadInvestor: boolean
  investorTypes: FormOption[]
  leadInvestors: FormOption[]
  leadInvestorType: FormOption[]
  numOfInvestors: RangeType
  allExpandRound1TypeCombination: CombinationType
  allExpandRound2TypeCombination: CombinationType
  investorTypesCombination: CombinationType
  leadInvestorTypesCombination: CombinationType
}

export type MnAFilterType = {
  isBlankAcquiredYear: boolean
  acquiredYear: {
    isRange: boolean
  } & RangeType
  isBlankAcquirers: boolean
  acquirers: FormOption[]
  acquirerTypes: FormOption[]
  latestAcquisitionAmount: RangeType
  acquirerTypesCombination: CombinationType
}

export type IpoFilterType = {
  isIpoPublicYearBlank: boolean
  ipoPublicYear: {
    isRange: boolean
  } & RangeType
  ipoAmount: RangeType
  ipoValuation: RangeType
  ipoStockExchange: string[]
  isIpoStockExchangeBlank: boolean
}

export type AttachmentFilterType = {
  isBlankAttachment: boolean
  attachmentType: FormOption[]
  attachmentTypeCombination: CombinationType
}

export type SourceFilterType = {
  priority: FormOption[]
  all: FormOption[]
  allSourceCombination: CombinationType
}

export type FilterType = {
  overview: OverviewFilterType
  geography: GeographyFilterType
  financing: FinancingFilterType
  mnA: MnAFilterType
  attachment: AttachmentFilterType
  source: SourceFilterType
  columns: FormOption[]
}

export type ItemGeographyType = {
  name: string
  parent?: string
  parent1?: string
  parent2?: string
}

export type GeographyType = {
  region: ItemGeographyType[]
  region1: ItemGeographyType[]
  region2: ItemGeographyType[]
  countries: ItemGeographyType[]
}

export type RangeType = {
  from: string
  to: string
}

export const categoryOptions = [
  { value: EnumCompanyTypeSector.FIN, label: 'FinTech' },
  { value: EnumCompanyTypeSector.INS, label: 'InsurTech' },
  { value: EnumCompanyTypeSector.REG, label: 'RegTech' },
  { value: EnumCompanyTypeSector.OUT, label: 'Out' },
  { value: 'unmapped', label: 'UnMapped' },
]

export const externalSourceOptions = [
  { value: EnumTagGroupSource.CRB, label: 'Crunchbase' },
  { value: EnumTagGroupSource.DR, label: 'Dealroom' },
]

export const sourceOptions = [
  ...externalSourceOptions,
  { value: EnumTagGroupSource.BCG, label: 'BCG' },
]

export const combinationOptions = [
  { value: ECombination.OR, label: 'Or' },
  { value: ECombination.AND, label: 'And' },
]

export const attachmentTypeOptions = [
  { value: EnumAttachmentType.FCT_PROFILE, label: EnumAttachmentType.FCT_PROFILE },
  { value: EnumAttachmentType.USE_CASE_PDF, label: EnumAttachmentType.USE_CASE_PDF },
  { value: EnumAttachmentType.USE_CASE_PPT, label: EnumAttachmentType.USE_CASE_PPT },
  { value: EnumAttachmentType.PRODUCT_PDF, label: EnumAttachmentType.PRODUCT_PDF },
  { value: EnumAttachmentType.FINANCIALS_PDF, label: EnumAttachmentType.FINANCIALS_PDF },
  { value: EnumAttachmentType.PITCH_DECK, label: EnumAttachmentType.PITCH_DECK },
  { value: EnumAttachmentType.METHODOLOGY, label: EnumAttachmentType.METHODOLOGY },
  { value: EnumAttachmentType.DEMO, label: EnumAttachmentType.DEMO },
  { value: EnumAttachmentType.OTHER, label: EnumAttachmentType.OTHER },
]

export enum EnumFileType {
  PDF = 'PDF',
  PPT = 'PPT',
  DOCS = 'doc/xls/ppt/pdf',
}

export const acceptAttachmentType = {
  [EnumFileType.PDF]: [
    EnumAttachmentType.PRODUCT_PDF,
    EnumAttachmentType.FINANCIALS_PDF,
    EnumAttachmentType.USE_CASE_PDF,
  ],
  [EnumFileType.PPT]: [EnumAttachmentType.FCT_PROFILE, EnumAttachmentType.USE_CASE_PPT],
  [EnumFileType.DOCS]: [
    EnumAttachmentType.PITCH_DECK,
    EnumAttachmentType.METHODOLOGY,
    EnumAttachmentType.DEMO,
    EnumAttachmentType.OTHER,
  ],
}

export const attachmentTypeWarning = [
  EnumAttachmentType.PRODUCT_PDF,
  EnumAttachmentType.FINANCIALS_PDF,
  EnumAttachmentType.USE_CASE_PDF,
]

export const employeeCountOptions = [
  { label: '1-10', value: '0' },
  { label: '11-50', value: '1' },
  { label: '51-100', value: '2' },
  { label: '101-250', value: '3' },
  { label: '251-500', value: '4' },
  { label: '501-1000', value: '5' },
  { label: '1001-5000', value: '6' },
  { label: '5001-10000', value: '7' },
  { label: '10001+', value: '8' },
]

export const fintechTypeOptions = [
  { label: 'None', value: -2 },
  { label: 'Enabler', value: 1 },
  { label: 'Disruptor', value: 2 },
]

export const mappingTypeOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Auxiliary', value: 'auxiliary' },
]

export const columnOptions = [
  { label: 'Website', value: 'website_url' },
  { label: 'Description', value: 'description' },
  { label: 'Long description', value: 'long_description' },
  { label: 'Founded year', value: 'founded_year' },
  { label: 'Status', value: 'status' },
  { label: 'Logo url', value: 'logo_url' },
  { label: 'Contact email', value: 'contact_email' },
  { label: 'Phone number', value: 'phone_number' },
  { label: 'FCT status', value: 'fct_status_id' },
  { label: 'Facebook url', value: 'facebook_url' },
  { label: 'LinkedIn url', value: 'linkedin_url' },
  { label: 'Twitter url', value: 'twitter_url' },
  { label: 'FTEs range', value: 'ftes_range' },
  { label: 'FTEs exact', value: 'ftes_exact' },
  { label: 'Country', value: 'country_name' },
  { label: 'City', value: 'city' },
  { label: 'Region 1', value: 'region1_name' },
  { label: 'Region 2', value: 'region2_name' },
  { label: 'Region 3', value: 'region3_name' },
  { label: 'Priority source', value: 'priority_source' },
  { label: 'Latest valuation', value: 'lastest_valuation' },
  { label: 'Company stage', value: 'company_stage' },
  { label: 'Category', value: 'category' },
  { label: 'Sector', value: 'sector' },
  { label: 'Value chain', value: 'value_chain' },
  { label: 'Risk', value: 'risk' },
  { label: 'Cluster', value: 'cluster' },
]

export const keywordOptions: FormOption[] = [
  { label: 'Description', value: EKeywordSearch.DESCRIPTIONS },
  { label: 'Internal tags', value: EKeywordSearch.INTERNAL_TAGS },
  { label: 'External tags', value: EKeywordSearch.EXTERNAL_TAGS },
  { label: 'Website keywords', value: EKeywordSearch.WEBSITE_KEYWORDS },
  { label: 'Primary dimension', value: EKeywordSearch.DIMENSION_PRIMARY },
  { label: 'Auxiliary dimension', value: EKeywordSearch.DIMENSION_SECONDARY },
  { label: 'News', value: EKeywordSearch.NEWS },
]

export const tractionTopicOptions = [
  { value: TractionTopic.REVENUE_EARNINGS, label: 'Revenue & Earnings' },
  { value: TractionTopic.TRANSACTION_VOLUME, label: 'Transaction Volume' },
  { value: TractionTopic.CUSTOMER_TRACTIONS, label: 'Customer Traction' },
  { value: TractionTopic.ASSETS_UNDER_MANAGEMENT, label: 'Assets Under Management' },
]

export const blankId = { label: 'Blank', value: -2 }
export const blankText = { label: 'Blank', value: 'blank' }

export const getUniqueValue = (arr1: string[], arr2: string[]) => {
  return [...arr1, ...arr2].filter(item => !(arr1.includes(item) && arr2.includes(item)))
}

export const getChildrenCluster = (clusters: GetDimensionsItem[], id?: string | number) => {
  let list: number[] = []

  const getChildren = (children?: number[]) => {
    let listCheck: number[] = []
    if (children?.length) {
      listCheck = [...listCheck, ...children]
      for (const c of children) {
        const child = clusters.find(item => +item.id === +c)
        listCheck = [...listCheck, ...getChildren(child?.children?.map(id => +id))]
      }
    }
    return listCheck
  }

  if (id) {
    const parent = clusters.find(item => item.id === id)
    list = [+id, ...getChildren(parent?.children?.map(id => +id))]
  }

  return list
}
