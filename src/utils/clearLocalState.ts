import { localstorage, LocalstorageFields, $attachment } from '.'
import { $logoUrl } from './reactiveVariables'

const clearLocalState = () => {
  localstorage.remove(LocalstorageFields.COMPANY_FORM)
  localstorage.remove(LocalstorageFields.COMPANY_TAXONOMY)
  localstorage.remove(LocalstorageFields.COMPANY_ID)
  localstorage.remove(LocalstorageFields.COMPANY_FINANCIALS)
  localstorage.remove(LocalstorageFields.COMPANY_ACQUISITIONS)
  localstorage.remove(LocalstorageFields.COMPANY_LOCATION)
  localstorage.remove(LocalstorageFields.COMPANY_ALIAS)
  localstorage.remove(LocalstorageFields.COMPANY_MANAGEMENT)
  $attachment([])
  $logoUrl(undefined)
}

export default clearLocalState

export const clearCoverageState = () => {
  localstorage.remove(LocalstorageFields.FIND_FINTECHS_FILTER)
  localstorage.remove(LocalstorageFields.INCORRECT_MAPPING_FILTER)
  localstorage.remove(LocalstorageFields.MAPPING_ZONE_FILTER)
  localstorage.remove(LocalstorageFields.IS_MAPPING_ZONE)
  localstorage.remove(LocalstorageFields.COMPANY_MERGE)
  localstorage.remove(LocalstorageFields.COMPANY_AGGREGATE)
}

export const clearCurrencyFilter = () => {
  localstorage.remove(LocalstorageFields.CURRENCY_CONVERSION_FILTER)
}

export const clearCompanyManagementFilter = () => {
  localstorage.remove(LocalstorageFields.COMPANY_MANAGEMENT)
}
