import {
  companyDetails,
  companyFinancials,
  companyBusiness,
  companyPeople,
  mappingSummary,
  companySources,
  companyOverview,
} from '../../__mock__'

export const mockEditCompany = {
  details: companyDetails(),
  overview: companyOverview(),
  financials: companyFinancials(),
  business: companyBusiness(),
  people: companyPeople(),
  mapping: mappingSummary,
}

export const mockAddCompany = {
  details: companyDetails(),
  overview: companyOverview(),
  financials: companyFinancials(),
}

export const sources = companySources
