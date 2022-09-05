import moment from 'moment'
import { AcquisitionForm } from '../../components/AcquisitionRound/AcquisitionRound'
import { FundingForm } from '../../components/FundingRound'
import { Investor } from '../../components/InvestorForm'
import { ProfileEditType } from '../../components/ProfileForm'
import { FieldTypes } from '../../components/TextField'
import { uploadDocumentMaxLength } from '../../components/UploadDocumentation'
import strings from '../../strings'
import theme from '../../theme'
import {
  CompanyDimensions,
  CompanyTypeSector,
  FileState,
  FormOption,
  IFieldFormat,
  TagData,
  TaxonomyState,
  Variants,
  FundingRoundType,
  RoundTypesOption,
} from '../../types'
import {
  EnumAttachmentType,
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumExpandStatusId,
  ValidateInput,
} from '../../types/enums'
import { checkLength, isDate, isURL, isEmail, acceptedFormats } from '../../utils'
import acceptedFileTypes, { checkLimitFileSize } from '../../utils/acceptedFileTypes'
import * as pdfjs from 'pdfjs-dist/es5/build/pdf.js'
import { HasHistoryField, HasPendingCQField } from './CompanyForm'
import { isOverrideUserFn, IUser } from '../../context/UserContext'
import { acceptAttachmentType, EnumFileType } from '../CompanyManagement/CompanyFilter/helpers'
import { Certification, CertificationType } from './CertificationForm'
import {
  INVALID_DATE,
  TRACTION_DATE_FORMAT,
  DEFAULT_POST_DATE_FORMAT,
  DEFAULT_VIEW_DATE_FORMAT,
  MIN_YEAR,
} from '../../utils/consts'

export const transformDate = (value?: string | number, format = DEFAULT_VIEW_DATE_FORMAT) => {
  if (!value || value === undefined) return ''

  let date = moment(value, DEFAULT_VIEW_DATE_FORMAT, true)

  if (!date.isValid()) date = moment(value)

  if (!date.isValid() || Number(date.format('YYYY')) < MIN_YEAR) return 'Invalid date'

  return date.format(format)
}

export const transformPostDate = (value?: string | number, format = DEFAULT_POST_DATE_FORMAT) => {
  return transformDate(value, format)
}

export const transformViewDate = (value?: string | number, format = DEFAULT_VIEW_DATE_FORMAT) => {
  return transformDate(value, format)
}

export const validateDate = (value?: string | number) => {
  if (!value || value === undefined) return ''

  if (!isDate(value.toString())) return 'Invalid date'

  return transformViewDate(value)
}

export const INVALID_EMAIL = 'Invalid email'
export const validateEmail = (value?: string | number) => {
  if (!value || value === undefined) return ''

  return isEmail(String(value)) ? String(value) : INVALID_EMAIL
}
export const validateURL = (value?: string | number) => {
  if (!value || value === undefined) return ''

  return isURL(String(value)) ? String(value) : 'invalid'
}
export const validateYear = (value?: string | number) => {
  if (value && (!Number.isInteger(+value) || value < 0 || value.toString().length !== 4))
    return 'Invalid year'
  return value?.toString() || ''
}
export const validateMoney = (value?: string | number) => {
  if (value && (Number.isNaN(+value) || value < 0 || +value > +ValidateInput.MAX_RANGE_BIGINT))
    return 'Invalid money'
  return value ? '$ ' + value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') : ''
}
export const validateNumber = (value?: string | number) => {
  if (value && (Number.isNaN(+value) || value < 0 || +value > +ValidateInput.MAX_RANGE_INT))
    return 'Invalid number'
  return value ? value.toString() : ''
}
export const validateNumber2 = (value?: string | number) => {
  if (value && (Number.isNaN(+value) || value < 0 || +value > +ValidateInput.MAX_RANGE_INT))
    return 'Invalid number'
  return value && typeof +value === 'number' ? (+value).toString() : ''
}
export const validateFTEs = (value: string | number) => {
  if (!value) return ''
  var myRe = new RegExp(`^[0-9]+$`)
  var valueRe = myRe.test(value.toString())
  if (value && (Number.isNaN(+value) || value < 0 || !valueRe)) return 'Invalid FTEs'
  return value.toString()
}

// Check duplicate investor_name and investor_type
export const validateInvestor = (financial?: FundingForm[], acquisition?: AcquisitionForm[]) => {
  const arrError: number[] = []

  const validate = ({ investors }: { investors: Investor[] }, index: number) => {
    investors.forEach((investor, investorIndex) => {
      const findInvestor = investors.find((item, index) => {
        return investorIndex !== index && investor.investor_name === item.investor_name
      })
      if (findInvestor) {
        arrError.push(index)
      }
    })
  }

  financial?.forEach(validate)

  acquisition?.forEach(validate)
  return arrError.filter((item: number, pos: number) => {
    return arrError.indexOf(item) === pos
  })
}

export enum FieldNames {
  name = 'name',
  website_url = 'website_url',
  twitter_url = 'twitter_url',
  facebook_url = 'facebook_url',
  linkedin_url = 'linkedin_url',
  company_type = 'company_type',
  founded_year = 'founded_year',
  status = 'status',
  company_alias = 'company_alias',
  closed_date = 'closed_date',
  logo_url = 'logo_url',
  description = 'description',
  location = 'location',
  roundType1 = 'roundType1',
  roundType2 = 'roundType2',
  investment = 'investment',
  date = 'date',
  source = 'source',
  valuation = 'valuation',
  comment = 'comment',
  fct_status_id = 'fct_status_id',
  apiAppend = 'api_append',
  attachment = 'attachment',
  ftes_range = 'ftes_range',
  ftes_exact = 'ftes_exact',
  logo_bucket_url = 'logo_bucket_url',
  hashed_image = 'hashed_image',
}

export const TableNames = {
  COMPANIES: 'organizations.companies',
  COMPANIES_ALIAS: 'organizations.company_aliases',
  LOCATIONS: 'organizations.locations',
  FUNDINGS: 'finance.fundings',
  FUNDRAISING: 'finance.fundraising',
  FUNDINGS_INVESTORS: 'finance.fundings_investors',
  PROFILE: 'organizations.profiles',
  PROFILE_TYPE: 'organizations.profile_type',
  INVESTOR: 'finance.investors',
  ACQUISITIONS: 'finance.acquisitions',
  ACQUISITIONS_INVESTORS: 'finance.acquisitions_investors',
  COMPANIES_ATTACHMENTS: 'organizations.companies_attachments',
  ALIAS: 'organizations.aliases',
  IPO: 'finance.ipos',
  NEWS: 'news.news',
  PEOPLE: 'people.people',
  COMPANIES_PEOPLE: 'people.companies_people',
  JOB_TITLE: 'people.job_titles',
  ACQUIREE: 'finance.acquirees',
  COMPANIES_TAGS: 'taxonomies.companies_tags',
  USE_CASE: 'organizations.use_case',
  CURRENT_CLIENTS: 'organizations.current_clients',
  COMPANIES_CURRENT_CLIENTS: 'organizations.companies_current_clients',
  TECHNOLOGY: 'organizations.technology',
  CERTIFICATION: 'organizations.technology_certifications',
  TECHNOLOGY_PROVIDER: 'organizations.technology_provider',
  COMPANY_TECHNOLOGY_PROVIDER: 'organizations.companies_technology_provider',
  FINANCE_SERVICES_LICENSES: 'organizations.financial_services_licenses',
  PARTNERSHIPS: 'partnerships.partnerships',
  CURRENCY_CONVERSION: 'expand.currency_conversion',
  COMPANIES_PARTNERSHIPS: 'partnerships.companies_partnerships',
  DATA_MAPPING: 'expand.data_mapping',
}
export const SourceIndependentTables = [
  TableNames.LOCATIONS,
  TableNames.COMPANIES_ATTACHMENTS,
  TableNames.FUNDINGS_INVESTORS,
]

export type TableNamesValues = typeof TableNames[keyof typeof TableNames]

export const ColumnNames = {
  ALIAS: 'company_alias',
  INVESTOR_NAME: 'investor_name',
  INVESTOR_TYPE: 'investor_type',
  LEAD_INVESTOR: 'lead_investor',
  EXPAND_STATUS_ID: 'expand_status_id',
  FCT_STATUS_ID: 'fct_status_id',
  NEWS_STATUS: 'news_status',
  PITCH_DECK_BUCKET_KEY: 'pitch_deck_bucket_key',
  HASHED_IMAGE: 'hashed_image',
  USE_CASE_VALUE: 'use_case_value',
  FUNDRAISING: 'fundraising',
  TECHNOLOGY_VALUE: 'technology_value',
  TECHNOLOGY_ID: 'technology_id',
  CERTIFICATION_ID: 'certification_id',
  CERTIFICATION: 'certification',
  CERTIFICATION_BUCKET_KEY: 'certification_upload_bucket_key',
  TECHNOLOGY_PROVIDER_ID: 'technology_provider_id',
  COMPANY_TECHNOLOGY_PROVIDER_ID: 'company_technology_provider_id',
  CERTIFICATION_OTHER: 'certification_other_value',
  NAME: 'name',
  DESCRIPTION: 'description',
  JOB_TITLE: 'job_title',
  LOGO_BUCKET_URL: 'logo_bucket_url',
  PROFILE_VALUE: 'profile_value',
  COMPANY_NAME: 'companyName',
  DISTANCE: 'distance',
  RATE: 'rate',
  INVESTMENT: 'investment',
  EXPAND_VALUE: 'expand_value',
  ROUND_2_ID: 'round_2_id',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  DATE: 'date',
  ML_CLUSTER: 'ml_cluster',
  PRODUCT_NAME: 'product_name',
  PRODUCTS: 'products',
}

export interface LocationFields {
  region: string
  country: string
  city: string
  is_headquarters: number
  source: string
  id?: string | number
  expandStatus?: string
  selfDeclared?: boolean
}
export enum RoundFieldNames {
  roundType1 = 'roundType1',
  roundType2 = 'roundType2',
  investment = 'investment',
  date = 'date',
  source = 'source',
  valuation = 'valuation',
  comment = 'comment',
  apiAppend = 'apiAppend',
}

export type FieldNameKeys = keyof typeof FieldNames

export type FormFieldsState = Record<FieldNameKeys, string | number>

export enum BusinessFieldNames {
  products_services = 'products_services',
  business_revenue_model = 'business_revenue_model',
  target_clients = 'target_clients',
  partnerships = 'partnerships',
  company_name = 'company_name',
  company_description = 'company_description',
  vision = 'vision',
  key_metrics = 'key_metrics',
  differentiators = 'differentiators',
  num_of_partnerships = 'num_of_partnerships',
}

export type BusinessFieldKeys = keyof typeof BusinessFieldNames

export type BusinessFieldState = Record<BusinessFieldKeys, string | number>

export const getlabel = (name: string) => {
  switch (name) {
    case 'products_services':
      return 'Products & Service'
    case 'target_clients':
      return 'Target Clients'
    case 'partnerships':
      return 'Partnership'
    case 'company_name':
      return 'Company Name'
    case 'company_description':
      return 'Company Description (150 words max)'
    case 'vision':
      return 'Vision'
    case 'key_metrics':
      return 'Key Metrics'
    case 'differentiators':
      return 'Differentiators'
    case 'business_revenue_model':
      return 'Business & Revenue Model'
    default:
      return ''
  }
}

export enum fieldsInBusinessPartnerships {
  company_name = 'company_name_',
  company_description = 'company_description_',
}

export enum PeopleFieldNames {
  number_of_employees = 'number_of_employees',
  name = 'name',
  role = 'role',
  department = 'department',
  email = 'email',
  phone_number = 'phone_number',
  num_of_board_members_advisors = '',
  num_of_company_contact_detail = '',
}

export type PeopleFieldKeys = keyof typeof PeopleFieldNames | any

export type PeopleFieldState = Record<PeopleFieldKeys, string | number>

export const getPeoplelabel = (name: string) => {
  switch (name) {
    case 'number_of_employees':
      return 'Number of Employees'
    case 'name':
      return 'Name'
    case 'role':
      return 'Role'
    case 'department':
      return 'Department'
    case 'email':
      return 'Email'
    case 'phone_number':
      return 'Phone Number'
    default:
      return ''
  }
}

export type RoundFieldsKeys = keyof typeof RoundFieldNames

export type FormRoundFieldsState = Record<RoundFieldsKeys, string | number>

export const Value2LabelPipe = (mapping: FormOption[], value: string | number) =>
  (mapping || [])?.find(x => String(x.value) === String(value))?.label || value

export const SortByDate = (a: any, b: any, props: string, type: 'ascending' | 'descending') => {
  const startTime = new Date(a[props]).getTime()
  if (!a[props] || isNaN(startTime)) {
    return type === 'ascending' ? 1 : -1
  }
  const endTime = new Date(b[props]).getTime()
  if (!b[props] || isNaN(endTime)) {
    return type === 'ascending' ? -1 : 1
  }
  return type === 'ascending' ? startTime - endTime : endTime - startTime
}

export enum EnumFundingModalMode {
  EDITING,
  ADDING,
}

export type OverridesCompanyDataInput = {
  id: string
  tableName: TableNamesValues
  columnName: string
  oldValue: string | number | EnumExpandStatusId
  newValue: string | number | EnumExpandStatusId
  source?: string | number
  companyId: number
  reason?: string
}

export type OverridesInvestorInput = Omit<OverridesCompanyDataInput, 'companyId'>

export type UpdateFundingState = Record<RoundFieldsKeys, OverridesCompanyDataInput>

export const defaultLocations: LocationFields = {
  region: '',
  country: '',
  city: '',
  is_headquarters: 1,
  source: 'bcg',
}

export const defaultFinancial: FundingForm = {
  round: {
    roundType1: '',
    roundType2: '',
    investment: '',
    date: '',
    source: '',
    valuation: '',
    comment: '',
    // readonly
    apiAppend: '',
  },
  investors: [],
}

export type CompanyLocationResult = {
  city: string | null
  country: string | null
  region: string | null
}

export type SharedCompanyLocation = {
  location: CompanyLocationResult
  id: string | null
  isHeadQuarter: boolean
  selfDeclared: boolean
  expandStatus: string
  source: string
  companyId: number
}
export const locationMapFn = ({
  location,
  id,
  isHeadQuarter,
  selfDeclared,
  expandStatus,
  source,
}: Omit<SharedCompanyLocation, 'companyId'>) =>
  ({
    city: location.city || '',
    country: location.country || '',
    region: location.region || '',
    id: id,
    is_headquarters: isHeadQuarter ? 1 : 0,
    selfDeclared: !!selfDeclared,
    expandStatus: expandStatus,
    source,
  } as LocationFields)

export enum ProfileName {
  BUSINESS_REVENUE = 'Business & Revenue Model',
  DIFFERENTIATORS = 'Differentiators',
  KEY_METRICS = 'Key Metrics',
  PARTNERSHIPS = 'Partnerships',
  PRODUCTS_SERVICES = 'Products & Services',
  TARGET_CLIENTS = 'Target Clients',
  TEAM = 'Team',
  UNDERLYING_TECHNOLOGY = 'Underlying Technology',
  VISION = 'Vision',
  FINANCIAL_SERVICES_LICENSES = 'Financial Services Licenses',
  FINANCIALS = 'Financials',
}

export type ProfileFormItem = {
  id: string
  label: ProfileName
  type: FieldTypes
  state: string[]
  editState: ProfileEditType[] | undefined

  isDivider?: boolean
  oldState: ProfileEditType[]
}

export const MultiProfileTypeIds = [2, 3, 4, 5, 6, 9, 10, 11, 12, 17, 18, 19, 23, 32, 33, 34]
export const SingleProfileTypeIds = [13, 14, 15, 16, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31]
export const NumberProfileTypeIds = []
export const YesNoProfileTypeIds = [20, 21, 22]

export const getFlatProfileTypes = (profileType: ProfileType[]): ProfileType[] => {
  let profileTypes = [] as ProfileType[]
  profileType.forEach(type => {
    if (!!type.profile_type_id) {
      profileTypes = [...profileTypes, type]
    } else {
      profileTypes = [...profileTypes, ...(type?.group || [])]
    }
  })
  return profileTypes
}

/**
 * TAXONOMY
 */

export const getCompanyCategories = (
  state: TaxonomyState,
  bothAuxAndPrim: boolean = false
): Array<{ name: CompanyTypeSector; isPrimary: boolean }> => {
  const { selectedMap, selectedTags } = state
  if (selectedMap === EnumCompanyTypeSector.OUT)
    return [
      {
        name: EnumCompanyTypeSector.OUT,
        isPrimary: true,
      },
    ]

  return [EnumCompanyTypeSector.FIN, EnumCompanyTypeSector.INS, EnumCompanyTypeSector.REG].reduce(
    (total: any, category) => {
      const hasAux = !!(((selectedTags?.aux || {})[category] || []).length > 0)
      const hasPrim = !!(((selectedTags?.primary || {})[category] || []).length > 0)
      const temp = []
      if (bothAuxAndPrim) {
        if (hasAux) temp.push({ name: category, isPrimary: false })
        if (hasPrim) temp.push({ name: category, isPrimary: true })
      } else if (hasAux || hasPrim) {
        temp.push({ name: category, isPrimary: hasPrim })
      }
      return [...total, ...temp]
    },
    []
  )
}

export const checkValidTaxonomy = (
  state: TaxonomyState,
  acceptEmptyTaxonomy: boolean = false
): boolean | Error => {
  const DIMENSION_TYPES = {
    FIN: {
      SECTOR: 1,
      CLUSTER: 2,
    },
    INS: {
      VALUE_CHAIN: 2,
      CLUSTER: 1,
    },
    REG: {
      RISK: 2,
      CLUSTER: 1,
    },
  }
  const { selectedMap } = state
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings
  const dimensions = getFlatSelectedTags(state)
  const hasPrimFin = dimensions.some(
    i => i.isPrimary && i.categoryName === EnumCompanyTypeSector.FIN
  )
  const hasPrimIns = dimensions.some(
    i => i.isPrimary && i.categoryName === EnumCompanyTypeSector.INS
  )
  const hasPrimReg = dimensions.some(
    i => i.isPrimary && i.categoryName === EnumCompanyTypeSector.REG
  )

  const hasAuxFin = dimensions.some(
    i => !i.isPrimary && i.categoryName === EnumCompanyTypeSector.FIN
  )
  const hasAuxIns = dimensions.some(
    i => !i.isPrimary && i.categoryName === EnumCompanyTypeSector.INS
  )
  const hasAuxReg = dimensions.some(
    i => !i.isPrimary && i.categoryName === EnumCompanyTypeSector.REG
  )

  const auxMustGoWithPrimaryError =
    selectedMap !== EnumCompanyTypeSector.OUT &&
    !hasPrimReg &&
    !hasPrimFin &&
    !hasPrimIns &&
    (hasAuxFin || hasAuxIns || hasAuxReg)

  if (selectedMap === EnumCompanyTypeSector.OUT) {
    return true
  }

  if (auxMustGoWithPrimaryError) {
    /* No auxillary mappings should be allowed unless a primary mapping has been added
     */
    throw Error(copy.error.requiredPrimaryMapping)
  }

  if (
    hasPrimIns &&
    (!dimensions.some(
      tag =>
        tag.isPrimary &&
        tag.categoryName === EnumCompanyTypeSector.INS &&
        tag.dimension === DIMENSION_TYPES.INS.VALUE_CHAIN
    ) ||
      !dimensions.some(
        tag =>
          tag.isPrimary &&
          tag.categoryName === EnumCompanyTypeSector.INS &&
          tag.dimension === DIMENSION_TYPES.INS.CLUSTER
      ))
  ) {
    throw Error(copy.error.primInsurtechNeedBothClusterAndValueChain)
  }

  if (
    hasPrimFin &&
    (!dimensions.some(
      tag =>
        tag.isPrimary &&
        tag.categoryName === EnumCompanyTypeSector.FIN &&
        tag.dimension === DIMENSION_TYPES.FIN.CLUSTER
    ) ||
      !dimensions.some(
        tag =>
          tag.isPrimary &&
          tag.categoryName === EnumCompanyTypeSector.FIN &&
          tag.dimension === DIMENSION_TYPES.FIN.SECTOR
      ))
  ) {
    throw Error(copy.error.primFinNeedBothSectorAndCluster)
  }

  if (isEmptyTaxonomy(state) && !acceptEmptyTaxonomy) {
    throw Error(copy.error.emptyDimension)
  }

  return true
}

export const isEmptyTaxonomy = (state: TaxonomyState): boolean => {
  const { selectedMap, selectedTags } = state

  if (
    selectedMap !== EnumCompanyTypeSector.OUT &&
    !selectedTags?.primary?.fintech?.length &&
    !selectedTags?.primary?.insurtech?.length &&
    !selectedTags?.primary?.regtech?.length
  ) {
    return true
  }
  return false
}

export const convertToCompanyDimensions = (
  input:
    | Partial<Record<Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>, TagData[]>>
    | undefined,
  isPrimary?: boolean
): CompanyDimensions[] => {
  if (!input) return []

  const result = Object.entries(input || {}).reduce((acc: CompanyDimensions[], curr) => {
    const [key, value] = curr
    return [
      ...acc,
      ...(value || []).map(i => {
        return { ...i, isPrimary: !!isPrimary, categoryName: key }
      }),
    ] as CompanyDimensions[]
  }, [])

  return result
}

export const getFlatSelectedTags = ({
  selectedTags,
  extraSelectedTags,
}: Pick<TaxonomyState, 'selectedTags' | 'extraSelectedTags'>) => {
  return [
    ...convertToCompanyDimensions(selectedTags?.primary, true),
    ...convertToCompanyDimensions(selectedTags?.aux),
    ...(extraSelectedTags || []).map(etr => ({
      ...etr,
      isPrimary: true,
      categoryName: EnumCompanyTypeSector.FIN,
    })),
  ]
}

export const getTaxonomyMapInput = (
  state: TaxonomyState,
  companyId: string,
  options?: { bothAuxAndPrimCategories?: boolean }
) => {
  const { tagGroupChildrenSelected, fintechType, selectedMap } = state

  const flatSelectedTags: CompanyDimensions[] = getFlatSelectedTags(state).filter(item =>
    item.categoryName === EnumCompanyTypeSector.FIN ? !!item.parent?.length : true
  )

  const genId = (tag: CompanyDimensions) =>
    `${tag.id}-${
      tag.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR || !!item.link_id)?.id
    }`

  const lookup = flatSelectedTags.reduce((a, e) => {
    a[`${e.id}-${genId(e)}`] = ++a[`${e.id}-${genId(e)}`] || 0
    return a
  }, {} as any)

  const dup = [
    ...Array.from(new Set(flatSelectedTags.filter(t => lookup[genId(t)]).map(t => t.label))),
  ]

  if (dup.length > 0) {
    throw Error(`These following tags is duplicate: ${dup.map(t => t.split('-')[0]).join(', ')}`)
  }

  const tags = (tagGroupChildrenSelected || []).map(t => t.id)
  if (fintechType && fintechType?.length > 0) tags.push(...fintechType)

  return {
    companyId: +companyId,
    dimensions:
      selectedMap === EnumCompanyTypeSector.OUT
        ? []
        : flatSelectedTags.map(t => ({
            dimensionId: t.id,
            isPrimary: t.isPrimary,
            parentId: t.parent?.find(
              item => item.dimensionType === EnumDimensionType.SECTOR || !!item.link_id
            )?.id,
          })),
    categories: getCompanyCategories(state, options?.bothAuxAndPrimCategories),
    tags,
  }
}

export type InvestorInput = {
  investor_id: string | null
  external_investor_id: string | null
  investor_name: string | null
  investor_type: string | null
  source: string | null
}

export type AddFinancialsInput = Record<
  'roundType1' | 'roundType2' | 'investment' | 'valuation' | 'source' | 'comment' | 'date',
  string | number | undefined
> & {
  lead_investors: InvestorInput[]
  investors: InvestorInput[]
}

const fundingForm2FinancialsInput = (data: FundingForm, source: string): AddFinancialsInput => ({
  roundType1: data.round.roundType1,
  roundType2: data.round.roundType2,
  investment: data.round.investment,
  valuation: data.round.valuation,
  lead_investors: data.investors
    .filter(e => e.isLead && e.investor_name)
    .map(({ isLead, ...e }) => ({
      ...e,
      investor_id: e.investor_id || '',
      external_investor_id: e.external_investor_id || '',
      source: e.source || null,
      children: undefined,
    })),
  investors: data.investors
    .filter(e => !e.isLead && e.investor_name)
    .map(({ isLead, ...e }) => ({
      ...e,
      investor_id: e.investor_id || '',
      external_investor_id: e.external_investor_id || '',
      source: e.source || null,
      children: undefined,
    })),
  source: source || '',
  comment: data.round.comment,
  date: data.round.date && transformPostDate(data.round.date),
})

export const getAddCompanyFinancialsInput = (
  fundings: FundingForm[],
  source: string
): AddFinancialsInput[] => {
  return fundings
    .filter(({ round }) => {
      return (
        round.roundType1 ||
        round.roundType2 ||
        round.comment ||
        round.date ||
        round.investment ||
        round.valuation
      )
    })
    .map(data => fundingForm2FinancialsInput(data, source))
}

export type Fields = {
  required?: boolean
  format?: IFieldFormat
  formatError?: string | undefined
  option?: FormOption[]
  maxlength?: number
  maxWord?: number
  disabled?: boolean
}

export const getFieldVariants = (field: Fields, value: string | number): Variants => {
  if (!value || field.disabled) return 'black'
  if (
    field.maxWord
      ? checkLength(value, field.maxlength, field.maxWord)
      : checkLength(value, field.maxlength)
  )
    return 'error'
  if (!field.format || !field.formatError) return 'black'
  if (field.format(value) === '') return 'black'
  return field.format(value) === field.formatError ? 'error' : 'black'
}

export const validAttachmentType = (fileState: FileState, type?: string) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings
  if (!type) return false
  const { file, magicBytes } = fileState
  const allValidMagicBytes = [
    ...acceptedFileTypes.magicBytesOfPdf,
    ...acceptedFileTypes.magicBytesOfWord,
    ...acceptedFileTypes.magicBytesOfExcel,
    ...acceptedFileTypes.magicBytesOfPowerPoint,
  ]

  if (
    (acceptAttachmentType[EnumFileType.PDF].includes(type as EnumAttachmentType) &&
      (!copy.attachments.acceptTypes.pdf.includes(file?.type) ||
        !acceptedFileTypes.magicBytesOfPdf.includes(magicBytes))) ||
    (acceptAttachmentType[EnumFileType.PPT].includes(type as EnumAttachmentType) &&
      (!copy.attachments.acceptTypes.ppt.includes(file?.type) ||
        !acceptedFileTypes.magicBytesOfPowerPoint.includes(magicBytes)))
  ) {
    return false
  }

  return (
    acceptedFileTypes.documentation.includes(file?.type) && allValidMagicBytes.includes(magicBytes)
  )
}

export const invalidAttachments = (state: FileState[]): boolean => {
  return state.some(
    f =>
      !f.name ||
      getFieldVariants({ maxlength: uploadDocumentMaxLength.name }, f.name) === 'error' ||
      getFieldVariants({ maxlength: uploadDocumentMaxLength.description }, f.description) ===
        'error' ||
      !validAttachmentType(f, f.type) ||
      state.filter(({ type }) => !!type && type !== EnumAttachmentType.OTHER && type === f.type)
        .length > 1
  )
}

export const scrollToElement = (
  el: HTMLElement | Element | null,
  box?: HTMLElement | Element | null
) => {
  if (el) {
    const yOffset = -theme.space![5]
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    const wrapper = box || window

    wrapper.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export const companyAttachmentsMapFn = (file: FileState) => {
  const extension = file.file.name.slice(file.file.name?.lastIndexOf('.')) || ''
  return {
    name: !!file.name.length
      ? file.name + extension
      : file.file.name.slice(0, file.file.name.lastIndexOf('.')),
    description: file.description,
    type: file.type,
    url_attachment: file.fileId,
  }
}

export const getMagicBytesOfFile = async (file: File, event?: any) => {
  if (!file || file.size < 4) {
    return ''
  }
  let result_hex: string = await new Promise(resolve => {
    let fileReader = new FileReader()
    fileReader.onloadend = evt => {
      if (evt?.target?.readyState === FileReader.DONE) {
        const uint = new Uint8Array(evt?.target?.result as ArrayBufferLike)
        let bytes: string[] = []
        uint.forEach(byte => {
          bytes.push(byte.toString(16))
        })
        const hex = bytes.join('').toUpperCase()
        resolve(hex)
      }
    }
    fileReader.readAsArrayBuffer(file.slice(0, 4)) // read the first 4 bytes of file
    const target = event.target as HTMLInputElement
    if (target) {
      target.value = ''
    }
  })
  return result_hex
}

const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js'

export const getThumbnailOfPdf = async (
  file: File,
  id: string,
  event?: any
): Promise<File | null> => {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  if (!file?.size) {
    return null
  }
  return new Promise(resolve => {
    const fileReader = new FileReader()

    fileReader.onloadend = async evt => {
      if (evt?.target?.readyState === FileReader.DONE) {
        const uint = new Uint8Array(evt?.target?.result as ArrayBufferLike)
        const CMAP_URL = '../../../node_modules/pdfjs-dist/cmaps/'
        const CMAP_PACKED = true
        const loadingTask = pdfjs.getDocument({
          data: uint,
          cMapUrl: CMAP_URL,
          cMapPacked: CMAP_PACKED,
        })
        loadingTask.promise
          .then(pdfDocument => {
            pdfDocument.getPage(1).then(page => {
              if (!page) resolve(null)
              const canvas = document.createElement('canvas')
              const scale = 1.5
              const viewport = page.getViewport({ scale })
              canvas.height = viewport.height
              canvas.width = viewport.width
              const context = canvas.getContext('2d')
              const task = page.render({
                canvasContext: context as CanvasRenderingContext2D,
                viewport: viewport,
              })
              task.promise.then(async function () {
                const img = await resize(canvas)
                resolve(img && new File([img], 'image.jpg'))
              })
            })
          })
          .catch(() => {
            resolve(null)
          })
      }
    }

    fileReader.readAsArrayBuffer(file)
    const target = event?.target as HTMLInputElement
    if (target) {
      target.value = ''
    }
  })
}

const MAX_WIDTH = 248
const MAX_HEIGHT = 139
const MAX_SIZE = 5000000 // 50mb

const resize = async (img: HTMLCanvasElement, type = 'jpeg'): Promise<Blob | null> => {
  if (!img) return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.drawImage(img, 0, 0)

  let width = img.width
  let height = img.height
  let start = 0
  let end = 1
  let last, accepted, blob: Blob

  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width
      width = MAX_WIDTH
    }
  } else {
    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height
      height = MAX_HEIGHT
    }
  }
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  accepted = await new Promise(rs => canvas.toBlob(rs, 'image/' + type, 1))
  blob = (await new Promise((rs: BlobCallback) => canvas.toBlob(rs, 'image/' + type, 1))) as Blob
  if (blob.size < MAX_SIZE) {
    return blob
  }

  // Binary search for the right size
  while (true) {
    const mid = Math.round(((start + end) / 2) * 100) / 100
    if (mid === last) break
    last = mid
    blob = (await new Promise((rs: BlobCallback) =>
      canvas.toBlob(rs, 'image/' + type, mid)
    )) as Blob
    if (blob.size > MAX_SIZE) {
      end = mid
    }
    if (blob.size < MAX_SIZE) {
      start = mid
      accepted = blob
    }
  }

  return accepted as Blob
}

export const trimTheString = (input: any) => {
  if (input === null || input === undefined) return ''
  if (typeof input === 'string') {
    return input.trim()
  }
  return input
}

export const invalidUpdateData = (
  oldValue: string | number,
  newValue: string | number,
  reason: string,
  isOverride: boolean = false,
  requireNewValue: boolean = false,
  isAppendCQ: boolean = false
) => {
  return (
    oldValue === newValue ||
    (!isOverride && !isAppendCQ && !reason) ||
    (!newValue && requireNewValue)
  )
}

export function findCQ<T extends HasHistoryField>(
  allOverrideItems: Array<T>,
  cq: Partial<HasHistoryField>,
  ignoreSource = false
): T | undefined {
  return allOverrideItems?.find(
    x =>
      x.tableName === cq.tableName &&
      x.columnName === cq.columnName &&
      x.rowId === cq.rowId &&
      (SourceIndependentTables.includes(cq.tableName)
        ? true
        : ignoreSource || x.source === cq.source || x.source === 'NA')
  )
}

export const getNumPending = (
  allOverrideItems: Array<HasPendingCQField>,
  cq: Partial<HasHistoryField>,
  ignoreSource = false
): number => {
  return findCQ<HasPendingCQField>(allOverrideItems, cq, ignoreSource)?.total || 0
}

export const changeRequestActionDisabled = (users: string[], loginUser: IUser) => {
  const isOverrideUser = isOverrideUserFn(loginUser)
  return {
    approve: !isOverrideUser,
    reject: !isOverrideUser && !users?.includes(loginUser.email),
  }
}

export const editCRDisabled = (users: string[], loginUser: IUser, isAppendCQ: boolean) => {
  return isAppendCQ && !users?.includes(loginUser.email)
}

export function convertDataURIToBinary(dataURI: string) {
  const BASE64_MARKER = ';base64,'
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  const base64 = dataURI.substring(base64Index)
  const raw = window.atob(base64)
  const rawLength = raw.length
  const array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}

export const checkValidImageFile = (file: FileState) => {
  const { magicBytesOfJpg, magicBytesOfPng, png, jpg } = acceptedFileTypes
  const validMagicBytes = [...magicBytesOfPng, ...magicBytesOfJpg]

  const validContentTypes = [...png, ...jpg]

  if (!validContentTypes.includes(file.file.type) || !validMagicBytes.includes(file.magicBytes)) {
    return false
  }

  return true
}

export const putFileToS3 = async (signUrl: string, file: FileState) => {
  await fetch(signUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.file.type,
    },
    body: file.file,
  })
}

export enum TECHNOLOGY_TYPE {
  CLOUD_VENDOR = 'Cloud Vendor',
  ENGINEERING = 'Active Engineering / IT Employee',
}

export enum TECHNOLOGY_TYPE_ID {
  CLOUD_VENDOR = 2,
  ENGINEERING = 1,
}

export enum CertificationTypeEnum {
  CSA = 'CSA (Cloud Security Alliance Controls)',
  ISO_9001 = 'ISO 9001 (Global Quality Standard)',
  ISO_27001 = 'ISO 27001 (Security Management Controls)',
  ISO_27017 = 'ISO 27017 (Cloud Specific Controls)',
  ISO_27018 = 'ISO 27018 (Personal Data Protection)',
  PCI_DSS = 'PCI DSS Level 1 (Payment Card Standards)',
  SOC_1 = 'SOC 1 (Audit Controls Report)',
  SOC_2 = 'SOC 2 (Security, Availability, & Confidentiality Report)',
  SOC_3 = 'SOC 3 (General Controls Report)',
  GENERAL = 'General Data Protection Regulation (GDPR)',
  AWS = 'AWS',
  Other = 'Other',
}

export const CertificationTypes: CertificationType[] = [
  { value: CertificationTypeEnum.CSA, label: CertificationTypeEnum.CSA },
  { value: CertificationTypeEnum.ISO_9001, label: CertificationTypeEnum.ISO_9001 },
  { value: CertificationTypeEnum.ISO_27001, label: CertificationTypeEnum.ISO_27001 },
  { value: CertificationTypeEnum.ISO_27017, label: CertificationTypeEnum.ISO_27017 },
  { value: CertificationTypeEnum.ISO_27018, label: CertificationTypeEnum.ISO_27018 },
  { value: CertificationTypeEnum.PCI_DSS, label: CertificationTypeEnum.PCI_DSS },
  { value: CertificationTypeEnum.SOC_1, label: CertificationTypeEnum.SOC_1 },
  { value: CertificationTypeEnum.SOC_2, label: CertificationTypeEnum.SOC_2 },
  { value: CertificationTypeEnum.SOC_3, label: CertificationTypeEnum.SOC_3 },
  { value: CertificationTypeEnum.GENERAL, label: CertificationTypeEnum.GENERAL },
  { value: CertificationTypeEnum.AWS, label: CertificationTypeEnum.AWS },
  { value: CertificationTypeEnum.Other, label: CertificationTypeEnum.Other },
]

export const NotOtherCertificationValues: string[] = CertificationTypes.filter(
  ({ value }) => value !== CertificationTypeEnum.Other
).map(({ value }) => value)

export const validateCertification = (c: Certification) => {
  if (!c.certification) return 'error'
  if (
    c.file &&
    (!acceptTypes.format.includes(c.file.file.type) || !checkLimitFileSize(c.file.file))
  )
    return 'error'
  if (
    c.certification === CertificationTypeEnum.Other &&
    (!c.certification_other_value?.trim() || c.certification_other_value?.trim().length > 256)
  )
    return 'error'
  return 'default'
}

export enum CloudVendorEnum {
  AMAZON_WEB_SERVICES = 'Amazon Web Services',
  MICROSOFT_AZURE = 'Microsoft Azure',
  GOOGLE_CLOUD = 'Google Cloud',
  ALIBABA_CLOUD = 'Alibaba Cloud',
  IBM_CLOUD = 'IBM Cloud',
  ORACLE = 'Oracle',
  SALESFORCE = 'Salesforce',
  SAP = 'SAP',
  RACKSPACE_CLOUD = 'Rackspace Cloud',
  VMWARE = 'VMWare',
  OTHER = 'Other',
}

export const acceptTypes = {
  format: [...acceptedFormats.jpg, ...acceptedFormats.png, ...acceptedFormats.pdf],
  invalidText: `Only .jpg (max size: 2MB), .png (max size: 2MB), .pdf (max size 10MB) files`,
}

export const CloudVendorOptions = [
  { value: CloudVendorEnum.ALIBABA_CLOUD, label: CloudVendorEnum.ALIBABA_CLOUD },
  { value: CloudVendorEnum.AMAZON_WEB_SERVICES, label: CloudVendorEnum.AMAZON_WEB_SERVICES },
  { value: CloudVendorEnum.GOOGLE_CLOUD, label: CloudVendorEnum.GOOGLE_CLOUD },
  { value: CloudVendorEnum.MICROSOFT_AZURE, label: CloudVendorEnum.MICROSOFT_AZURE },
  { value: CloudVendorEnum.IBM_CLOUD, label: CloudVendorEnum.IBM_CLOUD },
  { value: CloudVendorEnum.ORACLE, label: CloudVendorEnum.ORACLE },
  { value: CloudVendorEnum.SALESFORCE, label: CloudVendorEnum.SALESFORCE },
  { value: CloudVendorEnum.SAP, label: CloudVendorEnum.SAP },
  { value: CloudVendorEnum.RACKSPACE_CLOUD, label: CloudVendorEnum.RACKSPACE_CLOUD },
  { value: CloudVendorEnum.VMWARE, label: CloudVendorEnum.VMWARE },
  { value: CloudVendorEnum.OTHER, label: CloudVendorEnum.OTHER },
]

export type AcceptedType = { format: string[]; invalidText: string }

export const MBSize = 1048576

const validateMagicBytes = (f: FileState) => {
  const { jpg, png, pdf, magicBytesOfJpg, magicBytesOfPng, magicBytesOfPdf } = acceptedFormats
  if (jpg.includes(f.file.type) && !magicBytesOfJpg.includes(f.magicBytes)) return false
  if (png.includes(f.file.type) && !magicBytesOfPng.includes(f.magicBytes)) return false
  if (pdf.includes(f.file.type) && !magicBytesOfPdf.includes(f.magicBytes)) return false
  return true
}

export const validateFile = (acceptTypes: string[], f: FileState) => {
  if (!f) return true
  return acceptTypes.includes(f.file.type) && checkLimitFileSize(f.file) && validateMagicBytes(f)
}

export const formatFundingRoundTypes = (
  rawfundingRoundTypes: FundingRoundType[]
): RoundTypesOption => {
  const roundType1: FormOption[] = rawfundingRoundTypes.map(({ id, name }) => ({
    label: name,
    value: id,
  }))

  const roundType2: Record<string, FormOption[]> = rawfundingRoundTypes.reduce(
    (roundType2: Record<string, FormOption[]>, fundingRoundType1) => {
      roundType2[fundingRoundType1.id] = fundingRoundType1.children.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
      return roundType2
    },
    {}
  )

  return { roundType1, roundType2 }
}

export const getRoundTypeLabel = (
  value: string | number,
  options?: FormOption[]
): string | undefined => {
  if (Array.isArray(options)) {
    const option = options.find(option => String(value) === String(option.value))
    const label = option?.label
    return label
  }
  return ''
}

export type ProfileType = {
  profile_type_id: string
  profile_type_name: ProfileName
  group?: ProfileType[]
  options?: string[]
  isSingle: boolean
  isNumber: boolean
  isBoolean: boolean
}

export const yesNoOptions = [
  {
    label: 'Yes',
    value: 'Yes',
  },
  {
    label: 'No',
    value: 'No',
  },
]

export const isEmpty = (input: string | number) => {
  return (input || '') === '' || !input.toString().length
}

export const LOCATION_LENGTH = 70

export const dateIsValid = (dateStr: string) => {
  const regex = new RegExp(/^(0[1-9]|1\d|2\d|3[01])[-](0[1-9]|1[0-2])[-]\d{4}$/)
  return regex.test(dateStr.toString())
}

export const validateDateTraction = (value?: string) => {
  if (!value) return ''
  return dateIsValid(value.toString())
    ? moment(value, TRACTION_DATE_FORMAT).format(TRACTION_DATE_FORMAT)
    : INVALID_DATE
}
