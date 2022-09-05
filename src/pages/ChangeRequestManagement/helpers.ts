import { FormOption } from '../../types'
import { Routes } from '../../types/enums'
import { TableNames } from '../CompanyForm/helpers'

export enum ESortFields {
  DATE = 'audit_timestamp',
  COMPANY_NAME = 'name',
  FIELD_CHANGE = 'column_name',
  PREVIOUS_VALUE = 'source_value',
  NEW_VALUE = 'new_value',
  REASON = 'comment',
  CREATED_DATE = 'created_date',
}

export const sortByOptions: FormOption[] = [
  { label: 'Date', value: ESortFields.DATE },
  { label: 'Company Name', value: ESortFields.COMPANY_NAME },
]

export const formatFields = (str: string) => {
  if (!str) return ''

  const splitStr = str.toLowerCase().split('_')
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ')
}

export const tableUrl = (table: string) => {
  if ([TableNames.ACQUISITIONS, TableNames.ACQUISITIONS_INVESTORS].includes(table))
    return Routes.EDIT_COMPANY_ACQUISITIONS_CR
  if (
    [TableNames.PROFILE, TableNames.PROFILE_TYPE, TableNames.FINANCE_SERVICES_LICENSES].includes(
      table
    )
  )
    return Routes.EDIT_COMPANY_BUSINESS_CR
  if (['finance.fundings_investors', 'finance.fundings'].includes(table))
    return Routes.EDIT_COMPANY_FINANCIALS_CR
  if (['finance.ipos'].includes(table)) return Routes.EDIT_COMPANY_IPOS_CR
  if (['news.news'].includes(table)) return Routes.EDIT_COMPANY_NEWS_CR
  if ([TableNames.PEOPLE, TableNames.COMPANIES_PEOPLE, TableNames.JOB_TITLE].includes(table))
    return Routes.EDIT_COMPANY_PEOPLE_CR
  if ([TableNames.INVESTOR, 'finance.investor_mapping'].includes(table))
    return Routes.INVESTOR_MANAGEMENT_CR
  if ([TableNames.FUNDRAISING].includes(table)) return Routes.EDIT_COMPANY_FUNDRAISING_CR
  if (
    [
      TableNames.USE_CASE,
      TableNames.CURRENT_CLIENTS,
      TableNames.COMPANIES_CURRENT_CLIENTS,
    ].includes(table)
  )
    return Routes.EDIT_COMPANY_USE_CASE_CR
  if ([TableNames.TECHNOLOGY].includes(table)) return Routes.EDIT_COMPANY_TECHNOLOGY_CR
  if ([TableNames.CERTIFICATION].includes(table)) return Routes.EDIT_COMPANY_TECHNOLOGY_CR
  if ([TableNames.COMPANY_TECHNOLOGY_PROVIDER].includes(table))
    return Routes.EDIT_COMPANY_TECHNOLOGY_CR
  if ([TableNames.COMPANIES_PARTNERSHIPS].includes(table)) return Routes.EDIT_COMPANY_PARTNERSHIPS_CR
  return Routes.EDIT_COMPANY_OVERVIEW
}
