export enum Routes {
  SEARCH = '/search',
  SEARCH_QUERY = '/search/:query',
  ADD_COMPANY = '/add',
  ADD_COMPANY_OVERVIEW = '/add/overview',
  ADD_COMPANY_FINANCIALS = '/add/financials',
  ADD_COMPANY_FUNDRAISING = '/add/fundraising',
  ADD_COMPANY_BUSINESS = '/add/business',
  ADD_COMPANY_PEOPLE = '/add/people',
  ADD_COMPANY_TAXONOMY = '/add/taxonomy',
  ADD_COMPANY_TAXONOMY_EXTERNAL = '/add/:id/taxonomy',
  COMPANY = '/company/:id',
  COMPANY_EDIT_SOURCE = '/company/sources/:id',
  COMPANY_NEW = '/company/new/:id/:source',
  EDIT_COMPANY_TAXONOMY = '/edit/:id/taxonomy',
  EDIT_COMPANY_OVERVIEW = '/edit/:id/overview',
  EDIT_COMPANY_FINANCIALS = '/edit/:id/financials',
  EDIT_COMPANY_INVESTMENTS = '/edit/:id/investments',
  EDIT_COMPANY_FUNDRAISING = '/edit/:id/fundraising',
  EDIT_COMPANY_BUSINESS = '/edit/:id/business',
  EDIT_COMPANY_PEOPLE = '/edit/:id/people',
  EDIT_COMPANY_ACQUISITIONS = '/edit/:id/acquisitions',
  EDIT_COMPANY_ACQUIREES = '/edit/:id/acquirees',
  EDIT_COMPANY_IPOS = '/edit/:id/ipos',
  EDIT_COMPANY_NEWS = '/edit/:id/news',
  EDIT_COMPANY_USE_CASE = '/edit/:id/use-case',
  EDIT_COMPANY_TECHNOLOGY = '/edit/:id/technology',
  EDIT_COMPANY_PARTNERSHIPS = '/edit/:id/partnerships',

  EDIT_COMPANY_FINANCIALS_CR = '/edit/:id/financials/:cr',
  EDIT_COMPANY_FUNDRAISING_CR = '/edit/:id/fundraising/:cr',
  EDIT_COMPANY_ACQUISITIONS_CR = '/edit/:id/acquisitions/:cr',
  EDIT_COMPANY_IPOS_CR = '/edit/:id/ipos/:cr',
  EDIT_COMPANY_NEWS_CR = '/edit/:id/news/:cr',
  EDIT_COMPANY_PEOPLE_CR = '/edit/:id/people/:cr',
  EDIT_COMPANY_TAXONOMY_CR = '/edit/:id/taxonomy/:cr',
  INVESTOR_MANAGEMENT_CR = '/investor-management/:cr',
  EDIT_COMPANY_USE_CASE_CR = '/edit/:id/use-case/:cr',
  EDIT_COMPANY_TECHNOLOGY_CR = '/edit/:id/technology/:cr',
  EDIT_COMPANY_BUSINESS_CR = '/edit/:id/business/:cr',
  EDIT_COMPANY_PARTNERSHIPS_CR = '/edit/:id/partnerships/:cr',

  MERGE = '/merge',
  MERGE_COMPANY = '/merge/:query',
  TAXONOMY_MANAGEMENT = '/taxonomy-management',
  TAG_MANAGEMENT = '/tag-management',
  MAPPING_ZONE = '/mapping-zone',
  REPORT_MANAGEMENT = '/report-management',
  COMPANY_MANAGEMENT = '/company-management',
  BULK_EDIT = '/company-management/bulk-edit',
  HEALTH_CHECK = '/health-check',
  CHANGE_REQUEST_MANAGEMENT = '/change-request-management',
  CHANGE_REQUEST_MANAGEMENT_TAXONOMY = '/taxonomy-change-request',
  INVESTOR_MANAGEMENT = '/investor-management',
  FIND_FINTECHS = '/find-fintechs',
  SIMILAR_COMPANIES = '/similar-companies',
  SOURCE_MAPPING_MANAGEMENT = '/source-mapping-management',
  INCORRECT_MAPPING = '/incorrect-mapping',
  ANALYSIS = '/analysis',
}

const { REACT_APP_STAGE } = process.env
const prefix = REACT_APP_STAGE === 'prod' ? 'prod' : 'dev'

export const EnumUserGroups = {
  KT: `fct_dataplatform_${prefix}_KT`,
  EXPAND: `fct_dataplatform_${prefix}_expand`,
  EVS: `fct_dataplatform_${prefix}_EVS`,
  MISSION_PLUS: `fct_dataplatform_${prefix}_mission_plus`,
}

export enum EnumVariantKeys {
  primary = 'primary',
  secondary = 'secondary',
  outline = 'outline',
  outlineWhite = 'outlineWhite',
  black = 'black',
  muted = 'muted',
  error = 'error',
  invert = 'invert',
}

export enum EnumCompanyTypeSector {
  FIN = 'fintech',
  INS = 'insurtech',
  REG = 'regtech',
  OUT = 'out',
}

export enum EnumDimensionType {
  SECTOR = 'sector',
  CLUSTER = 'cluster',
  VALUE_CHAIN = 'value chain',
  RISH = 'risk',
}

export type DimensionType =
  | EnumDimensionType.SECTOR
  | EnumDimensionType.CLUSTER
  | EnumDimensionType.VALUE_CHAIN
  | EnumDimensionType.RISH

export enum EnumExpandStatus {
  FOLLOWING = 'Following',
  UNFOLLOWED = 'Unfollowed',
  DUPLICATED = 'Duplicated',
  TO_BE_EVALUATED = 'ToBeEvaluated',
  CHANGE_REQUEST = 'ChangeRequest',
}

export enum EnumExpandStatusId {
  FOLLOWING = '1',
  UNFOLLOWED = '2',
  DUPLICATED = '3',
  TO_BE_EVALUATED = '4',
  CHANGE_REQUEST = '5',
}

export enum EnumCompanyNewsStatusId {
  FOLLOWING = '1',
  UNFOLLOWED = '0',
}

export enum EnumCompanyNewsStatus {
  FOLLOWING = 'Following',
  UNFOLLOWED = 'Unfollowed',
}

export enum EnumTagGroupSource {
  BCG = 'bcg',
  DR = 'dealroom',
  CRB = 'crunchbase',
  BCG_FIXED = 'bcg_fixed',
  FEEDLY = 'feedly',
  SWITCHPITCH = 'switchpitch',
}

export enum EnumApiSource {
  CRB = 'CRB',
  DR = 'DR',
  MANUAL = 'MANUAL',
  SWITCHPITCH = 'SWITCHPITCH',
  FEEDLY = 'FEEDLY',
}

export enum EnumReverseApiSource {
  CRB = 'crunchbase',
  DR = 'dealroom',
  MANUAL = 'bcg',
  SWITCHPITCH = 'switchpitch',
  FEEDLY = 'feedly',
}

export type ApiSourceType =
  | EnumApiSource.CRB
  | EnumApiSource.DR
  | EnumApiSource.MANUAL
  | EnumApiSource.SWITCHPITCH
  | EnumApiSource.FEEDLY

export enum RoundStatus {
  FOLLOWING = 'following',
  NOT_FOLLOWING = 'not following',
}

export enum EnumCompanySource {
  BCG = 'bcg',
  DR = 'dealroom',
  CRB = 'crunchbase',
}

export enum EnumReverseCompanySource {
  bcg = 'BCG',
  dealroom = 'DR',
  crunchbase = 'CRB',
}

export enum EnumInvestorSource {
  bcg = 'BCG',
  dealroom = 'DR',
  crunchbase = 'CRB',
  bcg_comp = 'BCG_COMP',
}

export enum EnumRemoveSourceType {
  MAKE_TO_OUT = 1,
  CREATE_NEW_MAPPING = 2,
  KEEP_EXISTING_MAPPING = 3,
  SET_AS_DUPLICATE = 4,
}

export enum EnumMergeStep {
  PRIMARY = 1,
  AUXILIARY = 2,
  FINTECH_TYPE = 3,
  TAGS = 4,
  PROFILE = 5,
  USE_CASE = 6,
  FUNDRAISING = 7,
  TECHNOLOGY = 8,
  LOCATION = 9,
  OVERRIDES = 10,
  SUMMARY = 11,
}

export enum ValidateInput {
  MAX_RANGE_BIGINT = 18446744073709551615,
  MAX_RANGE_INT = 2147483647,
}

export enum EnumDimensionCategories {
  FIN = 'fintech',
  INS = 'insurtech',
  REG = 'regtech',
}

export enum EnumDimensionValue {
  PRIMARY = 1,
  SECONDARY = 2,
}

export enum EnumS3Operation {
  PUT = 'putObject',
  GET = 'getObject',
}
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const PERMISSIONS: Partial<Record<Routes, string[]>> = {
  [Routes.TAG_MANAGEMENT]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS],
  [Routes.TAXONOMY_MANAGEMENT]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS],
  [Routes.REPORT_MANAGEMENT]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS],
  [Routes.COMPANY_MANAGEMENT]: [
    EnumUserGroups.EXPAND,
    EnumUserGroups.MISSION_PLUS,
    EnumUserGroups.EVS,
  ],
  [Routes.CHANGE_REQUEST_MANAGEMENT]: [
    EnumUserGroups.EXPAND,
    EnumUserGroups.MISSION_PLUS,
    EnumUserGroups.EVS,
  ],
  [Routes.INVESTOR_MANAGEMENT]: [
    EnumUserGroups.EXPAND,
    EnumUserGroups.MISSION_PLUS,
    EnumUserGroups.EVS,
  ],
  [Routes.MERGE_COMPANY]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS, EnumUserGroups.EVS],
  [Routes.COMPANY_EDIT_SOURCE]: [
    EnumUserGroups.EXPAND,
    EnumUserGroups.MISSION_PLUS,
    EnumUserGroups.EVS,
  ],
  [Routes.SOURCE_MAPPING_MANAGEMENT]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS],
  [Routes.ANALYSIS]: [EnumUserGroups.EXPAND, EnumUserGroups.MISSION_PLUS, EnumUserGroups.EVS],
}

export enum EnumAttachmentType {
  FCT_PROFILE = 'FCT profile',
  USE_CASE_PDF = 'Use case (PDF) - Live on portal',
  USE_CASE_PPT = 'Use case (PPT)',
  PRODUCT_PDF = 'Product (PDF) - Live on portal',
  FINANCIALS_PDF = 'Financials (PDF) - Live on portal',
  PITCH_DECK = 'Pitch deck',
  METHODOLOGY = 'Methodology',
  DEMO = 'Demo',
  OTHER = 'Other',
}

export enum TagTypes {
  FINTECHTYPE = 'FINTECHTYPE',
  TAG = 'TAG',
}

export enum EnumBoolean {
  TRUE = 1,
  FALSE = 0,
}

export enum EnumSourceNA {
  NA = 'NA',
}

export enum EnumInvestor {
  LEAD = 'Lead Investor',
  SUPPORT = 'Support Investor',
}

export enum ENumDataType {
  USE_CASE = 'use_cases',
  TECHNOLOGY = 'technologies',
  FUNDRAISING = 'fundraising',
}

export enum EnumSignUrlOperation {
  GET = 'getObject',
  PUT = 'putObject',
}

export enum EnumFileSize {
  PDF = 10485760,
  VIDEO = 52428800,
  IMG = 2097152,
}

export enum EPageKey {
  MAPPING_ZONE = 'mappingZone',
  FIND_FINTECHS = 'findFintechs',
  INCORRECT_MAPPING = 'incorrectMapping',
}

export enum ETaxonomyKeys {
  PRIMARY = 'primary',
  AUXILIARY = 'aux',
  GROUP = 'group',
}
