export enum LocalstorageFields {
  COMPANY_FORM = 'companyForm',
  COMPANY_TAXONOMY = 'companyTaxonomy',
  COMPANY_BUSINESS = 'companyBusiness',
  COMPANY_PEOPLE = 'companyPeople',
  COMPANY_ID = 'companyId',
  COMPANY_FINANCIALS = 'companyFinancials',
  COMPANY_ACQUISITIONS = 'companyAcquisitions',
  COMPANY_IPOS = 'companyIPOS',
  COMPANY_MERGE = 'companyMerge',
  COMPANY_LOCATION = 'companyLocation',
  COMPANY_ALIAS = 'companyAlias',
  COMPANY_AGGREGATE = 'companyAggregate',
  COMPANY_MANAGEMENT = 'companyManagement',
  IS_MAPPING_ZONE = 'isMappingZone',
  BULK_EDIT = 'bulkEdit',
  PENDING_CHANGE_REQUEST = 'pendingChangeRequest',
  FIND_FINTECHS_FILTER = 'findFintechsFilter',
  MAPPING_ZONE_FILTER = 'mappingZoneFilter',
  CURRENCY_CONVERSION_FILTER = 'currencyConversionFilter',
  INCORRECT_MAPPING_FILTER = 'incorrectMappingFilter',
  FUNDING_ROUND_MAPPING = 'fundingRoundMapping',
  COMPANY_NEWS = 'companyNews',
}

export default {
  set: (name: LocalstorageFields, value: string) => {
    window.localStorage.setItem(name, value)
  },

  get: (name: LocalstorageFields) => window.localStorage.getItem(name),

  remove: (name: LocalstorageFields) => {
    window.localStorage.removeItem(name)
  },
}
