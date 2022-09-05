import { ChangeEvent, PropsWithChildren } from 'react'
import { SxStyleProp } from 'theme-ui'
import { IconProps } from '../components/Icon'
import {
  HasHistoryField,
  HasPendingCQField,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from '../pages/CompanyForm/CompanyForm'
import { OverridesCompanyDataInput, SharedCompanyLocation } from '../pages/CompanyForm/helpers'
import { PaletteKeys } from '../theme'
import {
  EnumVariantKeys,
  EnumCompanyTypeSector,
  EnumDimensionCategories,
  EnumAttachmentType,
} from './enums'

export const VariantKeys = Object.values(EnumVariantKeys)
export type Variants = keyof typeof EnumVariantKeys
export type Size = 'normal' | 'big' | 'small' | 'tiny'
export type TaxonomyType = 'primary' | 'aux' | 'group'

export type FieldStates = Record<'default' | 'validated' | 'error', IconProps | null>

export type ChangeFieldEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>

export interface IDataOverride {
  dataOverrideId: number
  rowId: string
  companyId: string
  tableName: string
  columnName: string
  newValue: string
  sourceValue: string
  user: string
  source: string
  comment: string
  auditTimestamp: string
  inputSource: string
  selfDeclared: number
}

export type FieldProps<P> = P & {
  label?: string
  name: string
  id?: string
  placeholder?: string
  defaultValue?: string
  value?: string | ReadonlyArray<string> | number
  fieldState?: keyof FieldStates
  disabled?: boolean
  onChange(event: onChangeField): void
  onBlur?(name: string, event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void
  onFocus?(): void
  viewHistory?(): void
  maxLength?: number
  labelSx?: SxStyleProp
  required?: boolean
}

export type MapVariantToColor = {
  [x in Variants]: PaletteKeys
}

export type MapVariantToSize = {
  [x in Size]: number | {}
}

export type ViewInterface<P> = P &
  PropsWithChildren<{
    sx?: SxStyleProp
  }>

export type MapCategory = {
  label: string
  list: string[]
}

export type FormOption = {
  value: string | number
  regionValue?: string
  label: string
}

export type Source = {
  label: string
  default?: boolean
}

export type SourceDetail = {
  company: CompanyDetail
  source: Source
}

export type ISortBy<T> = { field: T; direction: SortDirection }
export type IPagination = { page: number; pageSize: number }

export type SearchResultItem = {
  company_id?: string
  companyDetails: CompanyDetail
  // TODO change according to BE
  source: string | Source | SourceDetail[]
  category?: MapCategory
  defaultSource?: boolean
  priority?: number
  amount?: string
  id?: string
}

export type CompanyDetail = {
  companyId: string
  companyName: string
  countryCode: string | null
  countryName: string | null
  url: string | null
  companyTypes?: EnumCompanyTypeSector[] | null
  primaryCategories?: EnumCompanyTypeSector[] | null
  source?: string
  priority?: number
  external_id?: string
  expandStatusId?: string | number | null
}

export type CompanyOverview = {
  id: string
  source: string
  sources: string[]
  companyName: string
  companyLocation: Array<{
    id: string | null
    address: string | null
    postalCode: string | null
    location: {
      city: string | null
      country: string | null
      region: string | null
    }
    isHeadQuarter: boolean
    expandStatus: string
    selfDeclared: boolean
    source: string
  }> | null
  companyType: string | null
  description: string | null
  foundedYear: number | null
  status: string | null
  expandStatus: string | null
  expandStatusId: string | number | null
  closedDate: string | null
  ftse: number | null
  logoUrl: string | null
  contactEmail: string | null
  phoneNumber: string | null
  lastFundingType: string | null
  otherNames: string | null
  tags: string[] | string | null
  attachments: Array<Attachment> | null
  url?: string | null
  industries?: string | string[] | null
  categories?: string | string[] | null
  category_groups?: string | string[] | null
  aliases: Array<Alias> | null
  isExternalViewDetail?: boolean
  twitter_url?: string | null
  facebook_url?: string | null
  linkedin_url?: string | null
  ftes_exact?: string | null
  ftes_range?: string | null
  logo_bucket_url: string
  hashed_image: string
}

export type Attachment = {
  name: string | null
  description: string | null
  type: EnumAttachmentType | undefined
  url_attachment: string | null
  expandStatus: string | null
  selfDeclared: boolean
  date_created: string
}

export type Alias = {
  alias_id: string
  company_alias: string
  expand_status_id: number | null
  source: string | null
  selfDeclared: boolean
}

export type InvestorsProps = {
  lead?: string
  other?: string
}

export type CompanyFinancialsFundingRound = {
  id: string
  date: string
  quarter: string
  comment: string
  expandRound1: string
  expandRound2?: string
  originExpandRound1: string
  originExpandRound2?: string
  roundTypes: string[]
  investment: ValueCurrency
  valuation: ValueCurrency
  investors: InvestorsProps
}

export type ValueCurrency = {
  value: number
  currency: string
}

export type CompanyFinancials = {
  valuation: ValueCurrency
  fundingTotal: ValueCurrency
  companyStage: string
  lastFundingDate: ValueCurrency
  equityFundingTotal: ValueCurrency
  leadInvestor: string
  lastFundingAmount: ValueCurrency
  fundingRounds: CompanyFinancialsFundingRound[]
  isExternalViewDetail: boolean
}

export type CompanyBusiness = {
  productsServices: string[]
  businessRevenue: string[]
  targetClients: string[]
  partnerships: string[]
  vision: string[]
  keyMetrics: string[]
  differentiators: string[]
}

export type CompanyPeople = {
  companyId: number
}

export type CompanyAcquisitions = {
  acquisition_id: string
  acquisition_date: string
  currency?: string
  price: string
  status: string
  source: string
  comment: string
  investors: Array<{
    investor_name: string
    investor_type: string
    expand_status_id?: string | number
  }>
  investment?: ValueCurrency
}

export type GetCompanyAcquireesVariables = {
  companyId: number
  take: number
  skip: number
  activeOnly?: boolean
}

export type GetCompanyAcquireesResult = {
  getCompanyAcquirees: PaginationResult<Acquiree> | null | undefined
}

export type CompanyAcquiree = {
  companyId: number
}

export type Acquiree = {
  acquireeId: string
  source: string
  apiAppend: string
  companyId: number
  companyName: string
  url: string
  description: string
  longDescription: string
  status: string
  foundedYear: number
  closedDate: string
  valuation: number
  companyStage: string
  ftes: number
  contactEmail: string
  phoneNumber: string
  fctStatusId: number
  facebookUrl: string
  linkedinUrl: string
  twitterUrl: string
}

export type CompanyIpos = {
  ipo_id?: string
  amount?: string
  share_price?: string
  currency?: string
  shares_outstanding?: string
  shares_sold?: string
  stock_exchange?: string
  stock_symbol?: string
  valuation?: string
  went_public_on?: string
  source: string
}

export type CompanyAcquisitionsDetail = {
  acquisitionRounds: CompanyAcquisitions[]
  isExternalViewDetail: boolean
}

export type CompanyIposDetail = {
  ipoRounds: CompanyIpos[]
  isExternalViewDetail: boolean
}

type MappingSummaryItem = {
  label: string
  parent?: string[]
  source?: string
  isPrimary?: boolean
}

export type MappingSummary = {
  title?: string
  items: MappingSummaryItem[]
  type?: CompanyTypeSector
  dimension: number
}

export type CompanyTypeSector =
  | EnumCompanyTypeSector.FIN
  | EnumCompanyTypeSector.INS
  | EnumCompanyTypeSector.REG
  | EnumCompanyTypeSector.OUT
export type TagContainerParent = {
  tags: TagData[]
  parent: (undefined | TagDataParent)[]
}

export type TagData = {
  value: string
  children?: TagData[]
  endpoint?: boolean
  parent: ParentTag[]
  dimensionType?: DimensionType
  dimension?: number
  description: string
  link_id?: string
  type?: string
  companyDimensionId?: string
} & Tag

export type MappedTaxonomy = {
  isPrimary: boolean
  type: CompanyTypeSector
} & TagData

export type TagDataParent = {
  value: string
} & Tag

export type Tag = {
  id: string
  label: string
  rowId: string
  fctStatusId?: EnumExpandStatus
  selfDeclared?: boolean
  isPriority?: boolean
  shownOnBanksy?: boolean
  source?: string
}

export type TagGroupType = {
  children: Tag[]
} & Tag

type MappedTagData = {
  isPrimary: boolean
  parent: MappedTagData[]
  type: CompanyTypeSector
} & TagData

type CategoryData = {
  id: string
  name: string
  isPrimary: boolean
  companyId?: string
}

export type MappingCompanyDimensions = {
  mapping: MappedTagData[]
  extra: MappedTagData[]
  tags: TagData[]
  categories: CategoryData[]
  fintechType: TagData[]
  fintechTypeCRsCount: number
  tagCRsCount: number
}

export type TagNewsData = {
  isInternalCompany: boolean
  companyId: string
  source: string
}

export type GetCompanyDimensions = Record<'getCompanyDimensions', MappingCompanyDimensions>

export type PopoverPositions = 'top' | 'right' | 'bottom' | 'left'

export type PopoverAlign = 'start' | 'center' | 'end'

export type ButtonProps = ViewInterface<{
  label: string
  action(): void
  type?: Variants
  disabled?: boolean
  icon?: Paths
}>

export type UpdateFieldButtonsProps = {
  action(
    tableName: string,
    columnName: string,
    oldValue: string | number,
    newValue: string | number,
    id: string | number
  ): Promise<void>
} & Omit<ButtonProps, 'action'>

export type OverridesData = {
  oldValue: string
  newValue: string
  user: string
  comment: string
  columnName: string
  tableName: string
  date: string
  companyId: string
  selfDeclared: boolean
  inputSource: string
  isFile: boolean
}

export type OverrideResponse = {
  getCompanyOverrideHistory: OverridesData[]
}

export type PendingCRData = {
  oldValue: string
  newValue: string
  user: string
  comment: string
  columnName: string
  tableName: string
  date: string
  changeRequest: boolean
}

/* 
  ========
  Taxonomy 
  ========
*/
export type TaxonomyProps = {
  taxonomyState: TaxonomyState
  setTaxonomyState: (state: TaxonomyState) => void
  setError(s: string): void
  viewHistory: (input: GetCompanyOverrideInput) => void
} & ViewHistoryProps &
  ViewPendingChangeRequest

export type StateSelectedTags = Partial<
  Record<Exclude<TaxonomyType, 'group'>, Partial<Record<CompanyTypeSector, TagData[]>>>
>

export type StateOpenedTags = Partial<
  Record<
    Exclude<TaxonomyType, 'group'>,
    Partial<Record<CompanyTypeSector, Record<DimensionType, TagContainerParent>>>
  >
>

export type ButtonTagType = {
  label: string
  value: CompanyTypeSector
  disabled?: boolean
  hidden?: boolean
}

export type TaxonomyState = {
  tabActive: Exclude<TaxonomyType, 'group'>
  selectedMap?: CompanyTypeSector
  selectedTags?: StateSelectedTags
  openedTags?: StateOpenedTags
  tagGroupSelected?: TagGroupType
  tagGroupChildrenSelected: TagData[]
  extraSelectedTags?: TagData[] // When select CLUSTER, store it's SECTOR ancestor to extraSelectedTags
  fintechType?: string[]
  fintechTypeOverrides?: TagData[]
  fintechTypeCRsCount?: number
  tagCRsCount?: number
}

export type CompanyDimensions = {
  isPrimary: boolean
  categoryName?: EnumCompanyTypeSector
  isRemove?: boolean
} & TagData

export type HistoryStack = Record<
  Exclude<TaxonomyType, 'group'>,
  Partial<Record<CompanyTypeSector, TaxonomyState[]>>
>

export type RequireAtLeastOne<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = {
  // For each `Key` in `KeysType` make a mapped type:
  [Key in KeysType]-?: Required<Pick<ObjectType, Key>> & // 1. Make `Key`'s type required
    // 2. Make all other keys in `KeysType` optional
    Partial<Pick<ObjectType, Exclude<KeysType, Key>>>
}[KeysType] &
  // 3. Add the remaining keys not in `KeysType`
  Except<ObjectType, KeysType>

export type FileState = {
  fileId: string
  file: File
  name: string
  description: string
  type: string
  magicBytes: string
  thumbnail?: File | null
}

export type IFieldFormat = (value: string | number) => string
export type ResearchReportCompanyIdsInput = {
  id: number
  directMention: number
}
export type SignUrl = {
  fileId: string
  signedUrl: string
}

export type ResearchReportFile = {
  fileId: string
  name: string
  magicBytes: string
  contentType: string
  issueNumber: string
}

export type CompanyMention = {
  companyId: number
  directMention: number
  version: string
  issueNumber: string
}
export interface IReport {
  issueNumber: string
  name: string
  version: string
  publishedDate: string
  uploadedDate: string
  expandStatus: number
  description: string
  urlAttachment: string
}

export type IReportWithCompanies = IReport & {
  companies: CompanyMention[]
}

export type ProfileDetails = {
  profile_id: string
  company_id: string
  profile_type_id: string
  profile_value: string
  expand_status_id: string
  profile_type_name: string
}

export type OverridesConflictsValue = {
  value: string | null
  companyId: number
  dataOverrideId?: number
  user?: string
  dateTime?: string
  headquarterLocation?: HeadquarterConflictValue
}

export type HeadquarterConflictValue = {
  country: OverridesConflictsValue
  city: OverridesConflictsValue
}

export type OverridesConflictsValueWithUId = OverridesConflictsValue & {
  uid: string
}

export type OverridesConflicts<T> = {
  field: string
  values: Array<T>
}

export type MergeLocationData = SharedCompanyLocation & {
  isRemove: boolean
  hidden?: boolean
}

export type CompanyPriority = {
  companyId: number
  externalId: string
  priority: number
  source?: string
  data: string
}

export type OverrideVisibilityRequest = {
  functionName: string
  companyIds: CompanyPriority[]
}

export type OperationState<T> = {
  uid: string
  operation: EBulkEditOptions
  data: T
}

export type GetCompanyOverrideInput = {
  tableName: string
  columnName: string
  companyId: number
  rowId: string
  source?: string
  dataOverrideId?: number
}

export type FinancialItemHeaderProps = {
  buttons: Array<ButtonProps & { isCancel?: boolean }>
  isReadOnly?: boolean
  isOverride?: boolean
} & ViewDataOverrides

export type ViewDataOverrides = {
  viewHistory?(): void
  viewPendingChangeRequest?(): void
  totalItemPendingCR?: number
}

export type SharedFinancialWrapperProps = {
  pendingCR: HasPendingCQField[]
}

export type PaginationResult<T> = {
  total: number
  skip: number
  take: number
  result: T[]
}

export type PaginationResult2<T> = {
  total: number
  page: number
  size: number
  result: T[]
}

export type IField<Name> = Omit<
  FieldProps<{
    type: FieldTypes
    name: Name
    label: string
    placeholder: string
    validators?: IValidators
    format?: IFieldFormat
    required?: boolean
    options?: FormOption[]
  }>,
  'onChange'
>

export type OverrideMultipleFieldState<Keys> = Record<Keys, OverridesCompanyDataInput>

export type TagChangeRequest = {
  dataOverrideId: number
  rowId: number
  tagName: string
  tagGroupName: string
  tagGroupSource: string
  fctStatusId: number
  selfDeclared: number
  inputSource: string
  sourceValue: string
  newValue: string
  date: string
  reason: string
  user: string
  tagId: number
}

export type TagChangeRequestResult = {
  getAllTagChangeRequests: { data: TagChangeRequest[] }
}

export type FundingRoundTypeBase = {
  id: number
  name: string
  round_type: number
  parent_id: number
}

export type FundingRoundType = FundingRoundTypeBase & {
  children: FundingRoundTypeBase[]
}

export type FundingRoundTypeResponse = {
  getFundingRoundTypes: FundingRoundType[]
}

export type RoundTypesOption = {
  roundType1: FormOption[]
  roundType2: Record<string, FormOption[]>
}

export type PartnerDetailType = {
  id: number
  companyId?: number
  partnerName: string
  externalId: string
  fctStatusId: EnumExpandStatusId
}

export type Partnership = {
  id: number
  companyId?: number
  partnershipId: string
  externalId: string
  partnerName: string
  source: string
  date: string
  summary: string
  title: string
  partnerDetails: PartnerDetailType[]
  fctStatusId: EnumExpandStatusId
}

export type PartnershipGroupType = {
  name: string
  externalId: string
  logoUrl?: string
  companyId?: number
  partnerships: Partnership[]
}

export type Product = {
  title: string
  companyId: number
  productId: string
  url: string
  date: string
  summary: string
  ml_cluster: string
  product_name: string
  isActive?: boolean
}

export type Traction = {
  sentence: string
  url: string
  date: string
  topic: string
}
