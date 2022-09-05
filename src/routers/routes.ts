import { PERMISSIONS, Routes } from '../types/enums'
import {
  Search,
  SearchResults,
  Home,
  AddCompany,
  CompanyForm,
  Company,
  Merge,
  TaxonomyManagement,
  TagManagement,
  MappingZone,
  ReportManagement,
  CompanyManagement,
  BulkEdit,
  HealthCheck,
  FindFintechs,
  SimilarCompanies,
  SourceMappingManagement,
  IncorrectMapping,
  Analysis,
} from '../pages'
import InvestorManagement from '../pages/InvestorManagement'
import ChangeRequestManagementPage from '../pages/ChangeRequestManagement/ChangeRequestsManagementPage'
import { clearCoverageState, clearCurrencyFilter, clearCompanyManagementFilter } from '../utils'

export type IRoute = {
  path: string
  component: React.FunctionComponent
  insecured?: boolean
  permissions?: string[]
}

export const managementMenu = [
  'investorManagement',
  'taxonomyManagement',
  'tagManagement',
  'reportManagement',
  'companyManagement',
  'changeRequestManagement',
  'sourceMappingManagement',
]

export const coverageMenu = ['mappingZone', 'findFintechs', 'incorrectMapping']
export const analysisMenu = ['analysis']

export const menuLinks: Array<{
  key: string
  to: Routes
  permissions?: string[]
  action?(): void
}> = [
  {
    key: 'mappingZone',
    to: Routes.MAPPING_ZONE,
    action: clearCoverageState,
  },
  {
    key: 'findFintechs',
    to: Routes.FIND_FINTECHS,
    action: clearCoverageState,
  },
  {
    key: 'incorrectMapping',
    to: Routes.INCORRECT_MAPPING,
    action: clearCoverageState,
    permissions: PERMISSIONS[Routes.CHANGE_REQUEST_MANAGEMENT],
  },
  { key: 'addCompanyManually', to: Routes.ADD_COMPANY },
  { key: 'download', to: Routes.SEARCH },
  {
    key: 'investorManagement',
    to: Routes.INVESTOR_MANAGEMENT,
  },
  {
    key: 'taxonomyManagement',
    to: Routes.TAXONOMY_MANAGEMENT,
    permissions: PERMISSIONS[Routes.TAXONOMY_MANAGEMENT],
  },
  {
    key: 'tagManagement',
    to: Routes.TAG_MANAGEMENT,
    permissions: PERMISSIONS[Routes.TAG_MANAGEMENT],
  },
  {
    key: 'reportManagement',
    to: Routes.REPORT_MANAGEMENT,
    permissions: PERMISSIONS[Routes.REPORT_MANAGEMENT],
  },
  {
    key: 'companyManagement',
    to: Routes.COMPANY_MANAGEMENT,
    permissions: PERMISSIONS[Routes.COMPANY_MANAGEMENT],
    action: clearCompanyManagementFilter,
  },
  {
    key: 'healthCheck',
    to: Routes.HEALTH_CHECK,
  },
  {
    key: 'similarCompanies',
    to: Routes.SIMILAR_COMPANIES,
  },
  {
    key: 'analysis',
    to: Routes.ANALYSIS,
    permissions: PERMISSIONS[Routes.ANALYSIS],
  },
  {
    key: 'changeRequestManagement',
    to: Routes.CHANGE_REQUEST_MANAGEMENT,
    permissions: PERMISSIONS[Routes.CHANGE_REQUEST_MANAGEMENT],
  },
  {
    key: 'sourceMappingManagement',
    to: Routes.SOURCE_MAPPING_MANAGEMENT,
    permissions: PERMISSIONS[Routes.SOURCE_MAPPING_MANAGEMENT],
    action: clearCurrencyFilter,
  },
]

export const routes: IRoute[] = [
  { path: '/', component: Home, insecured: true },
  { path: Routes.SEARCH, component: Search },
  { path: Routes.SEARCH_QUERY, component: SearchResults },
  { path: Routes.ADD_COMPANY, component: AddCompany },
  { path: Routes.ADD_COMPANY_OVERVIEW, component: CompanyForm },
  { path: Routes.ADD_COMPANY_TAXONOMY, component: CompanyForm },
  { path: Routes.ADD_COMPANY_BUSINESS, component: CompanyForm },
  { path: Routes.ADD_COMPANY_PEOPLE, component: CompanyForm },
  { path: Routes.ADD_COMPANY_FINANCIALS, component: CompanyForm },
  // { path: Routes.ADD_COMPANY_FUNDRAISING, component: CompanyForm },
  { path: Routes.ADD_COMPANY_TAXONOMY_EXTERNAL, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_NEWS, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_USE_CASE, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_TECHNOLOGY, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_PARTNERSHIPS, component: CompanyForm },
  { path: Routes.COMPANY, component: Company },
  {
    path: Routes.COMPANY_EDIT_SOURCE,
    component: Company,
    permissions: PERMISSIONS[Routes.COMPANY_EDIT_SOURCE],
  },
  { path: Routes.COMPANY_NEW, component: Company },

  { path: Routes.EDIT_COMPANY_TAXONOMY, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_OVERVIEW, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_FINANCIALS, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_INVESTMENTS, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_FUNDRAISING, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_BUSINESS, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_PEOPLE, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_ACQUISITIONS, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_ACQUIREES, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_IPOS, component: CompanyForm },

  { path: Routes.EDIT_COMPANY_FINANCIALS_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_FUNDRAISING_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_ACQUISITIONS_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_IPOS_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_NEWS_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_PEOPLE_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_TAXONOMY_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_USE_CASE_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_TECHNOLOGY_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_BUSINESS_CR, component: CompanyForm },
  { path: Routes.EDIT_COMPANY_PARTNERSHIPS_CR, component: CompanyForm },

  { path: Routes.MERGE, component: Merge, permissions: PERMISSIONS[Routes.MERGE_COMPANY] },
  {
    path: Routes.MERGE_COMPANY,
    component: Merge,
    permissions: PERMISSIONS[Routes.MERGE_COMPANY],
  },
  {
    path: Routes.TAXONOMY_MANAGEMENT,
    component: TaxonomyManagement,
    permissions: PERMISSIONS[Routes.TAXONOMY_MANAGEMENT],
  },
  {
    path: Routes.TAG_MANAGEMENT,
    component: TagManagement,
    permissions: PERMISSIONS[Routes.TAG_MANAGEMENT],
  },
  { path: Routes.MAPPING_ZONE, component: MappingZone },
  { path: Routes.REPORT_MANAGEMENT, component: ReportManagement },
  {
    path: Routes.COMPANY_MANAGEMENT,
    component: CompanyManagement,
    permissions: PERMISSIONS[Routes.COMPANY_MANAGEMENT],
  },
  {
    path: Routes.BULK_EDIT,
    component: BulkEdit,
    permissions: PERMISSIONS[Routes.COMPANY_MANAGEMENT],
  },

  { path: Routes.HEALTH_CHECK, component: HealthCheck },
  { path: Routes.ANALYSIS, component: Analysis, permissions: PERMISSIONS[Routes.ANALYSIS] },
  { path: Routes.SIMILAR_COMPANIES, component: SimilarCompanies },
  {
    path: Routes.CHANGE_REQUEST_MANAGEMENT,
    component: ChangeRequestManagementPage,
    permissions: PERMISSIONS[Routes.CHANGE_REQUEST_MANAGEMENT],
  },
  {
    path: Routes.INVESTOR_MANAGEMENT,
    component: InvestorManagement,
  },
  {
    path: Routes.INVESTOR_MANAGEMENT_CR,
    component: InvestorManagement,
  },
  {
    path: Routes.FIND_FINTECHS,
    component: FindFintechs,
  },
  {
    path: Routes.SOURCE_MAPPING_MANAGEMENT,
    component: SourceMappingManagement,
    permissions: PERMISSIONS[Routes.SOURCE_MAPPING_MANAGEMENT],
  },
  {
    path: Routes.INCORRECT_MAPPING,
    component: IncorrectMapping,
  },
]
