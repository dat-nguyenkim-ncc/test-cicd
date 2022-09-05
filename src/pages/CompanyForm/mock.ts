import { FormOption } from '../../types'
import {
  EnumBoolean,
  EnumCompanyNewsStatus,
  EnumCompanyNewsStatusId,
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumInvestor,
} from '../../types/enums'

export const DEFAULT_AVATAR =
  'https://s3.eu-west-2.amazonaws.com/dealroom-static/null/people-32.png'

// TODO get this from backend
export const regions = [
  { label: 'Europe', value: 'europe' },
  { label: 'North America', value: 'na' },
  { label: 'South America', value: 'sa' },
  { label: 'Central America', value: 'ca' },
  { label: 'Asia', value: 'asia' },
  { label: 'Australia', value: 'australia' },
]

export const countries = [
  { label: 'UK', value: 'uk' },
  { label: 'Brazil', value: 'br' },
  { label: 'Peru', value: 'peru' },
  { label: 'Spain', value: 'spain' },
]

export enum EStatusValue {
  ACQUIRED = 'Acquired',
  CLOSED = 'Closed',
  IPO = 'IPO / Went public',
  MERGED = 'Merged',
  OPERATING = 'Operating',
}

export const status = [
  { label: 'Acquired', value: EStatusValue.ACQUIRED },
  { label: 'Closed', value: EStatusValue.CLOSED },
  { label: 'IPO / Went public', value: EStatusValue.IPO },
  { label: 'Merged', value: EStatusValue.MERGED },
  { label: 'Operating', value: EStatusValue.OPERATING },
]

export const expandStatus = [
  { value: EnumExpandStatusId.FOLLOWING, label: EnumExpandStatus.FOLLOWING },
  { value: EnumExpandStatusId.DUPLICATED, label: EnumExpandStatus.DUPLICATED },
  { value: EnumExpandStatusId.UNFOLLOWED, label: EnumExpandStatus.UNFOLLOWED },
  { value: EnumExpandStatusId.CHANGE_REQUEST, label: EnumExpandStatus.CHANGE_REQUEST },
  { value: EnumExpandStatusId.TO_BE_EVALUATED, label: EnumExpandStatus.TO_BE_EVALUATED },
]

export const newsStatus = [
  { value: EnumCompanyNewsStatusId.FOLLOWING, label: EnumCompanyNewsStatus.FOLLOWING },
  { value: EnumCompanyNewsStatusId.UNFOLLOWED, label: EnumCompanyNewsStatus.UNFOLLOWED },
]

export const leadInvestor = [
  { value: EnumBoolean.TRUE, label: EnumInvestor.LEAD },
  { value: EnumBoolean.FALSE, label: EnumInvestor.SUPPORT },
]

export const fctStatusOptions = [
  { value: EnumExpandStatusId.FOLLOWING, label: EnumExpandStatus.FOLLOWING },
  { value: EnumExpandStatusId.DUPLICATED, label: EnumExpandStatus.DUPLICATED },
]

export const roundType1 = [
  { label: 'Debt Financing', value: 'Debt Financing' },
  { label: 'Equity Financing', value: 'Equity Financing' },
  { label: 'ICO', value: 'ICO' },
  { label: 'Post IPO', value: 'Post IPO' },
  { label: 'Other', value: 'Other' },
]

export const roundType2: Record<string, FormOption[]> = {
  'Debt Financing': [
    { label: 'Debt', value: 'Debt' },
    { label: 'Loan', value: 'Loan' },
    { label: 'Revenue Finance', value: 'Revenue Finance' },
  ],
  'Equity Financing': [
    { label: 'Competition/Grant', value: 'Competition/Grant' },
    { label: 'Corporate', value: 'Corporate' },
    { label: 'Private/Growth Equity', value: 'Private/Growth Equity' },
    { label: 'Seed/Angel', value: 'Seed/Angel' },
    { label: 'Series A', value: 'Series A' },
    { label: 'Series B', value: 'Series B' },
    { label: 'Series C', value: 'Series C' },
    { label: 'Series D', value: 'Series D' },
    { label: 'Series E+', value: 'Series E+' },
    { label: 'Unattributed', value: 'Unattributed' },
  ],
  ICO: [{ label: 'ICO', value: 'ICO' }],
  'Post IPO': [
    { label: 'Option/Warrant', value: 'Option/Warrant' },
    { label: 'Post IPO Convertible', value: 'Post IPO Convertible' },
    { label: 'Post IPO Debt', value: 'Post IPO Debt' },
    { label: 'Post IPO Equity', value: 'Post IPO Equity' },
    { label: 'Post IPO Secondary', value: 'Post IPO Secondary' },
    { label: 'Shelf Registration', value: 'Shelf Registration' },
  ],
  Other: [
    { label: 'Buyback', value: 'Buyback' },
    { label: 'Competition/Grant', value: 'Competition/Grant' },
    { label: 'Corporate-Venture Partnership', value: 'Corporate-Venture Partnership' },
    { label: 'Crowdfunding', value: 'Crowdfunding' },
    { label: 'Dead', value: 'Dead' },
    { label: 'Grant', value: 'Grant' },
    { label: 'Incubator/Accelerator', value: 'Incubator/Accelerator' },
    { label: 'In-kind/Services', value: 'In-kind/Services' },
    { label: 'Media for equity', value: 'Media for equity' },
    { label: 'Portfolio Merger', value: 'Portfolio Merger' },
    { label: 'Portfolio NewCo', value: 'Portfolio NewCo' },
    { label: 'Recap', value: 'Recap' },
    { label: 'Secondary Market', value: 'Secondary Market' },
    { label: 'Shareholder Liquidity', value: 'Shareholder Liquidity' },
    { label: 'Spinoff/Spinout', value: 'Spinoff/Spinout' },
    { label: 'PIPE', value: 'PIPE' },
  ],
}

export const investor = [
  { label: 'Academic/Grant', value: 'Academic/Grant' },
  { label: 'Accelerator', value: 'Accelerator' },
  { label: 'Angel', value: 'Angel' },
  { label: 'Bank', value: 'Bank' },
  { label: 'Corporate', value: 'Corporate' },
  { label: 'Crowdfunding', value: 'Crowdfunding' },
  { label: 'Exchange', value: 'Exchange' },
  { label: 'Government/Nonprofit', value: 'Government/Nonprofit' },
  { label: 'Incubator', value: 'Incubator' },
  { label: 'Information Service Provider', value: 'Information Service Provider' },
  { label: 'Insurance', value: 'Insurance' },
  { label: 'Investment Management', value: 'Investment Management' },
  { label: 'Other', value: 'Other' },
  { label: 'Payments Infrastructure', value: 'Payments Infrastructure' },
  { label: 'PE', value: 'PE' },
  { label: 'Start-Up', value: 'Start-Up' },
  { label: 'Tech', value: 'Tech' },
  { label: 'VC', value: 'VC' },
]

export const ftesRange = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-100', value: '51-100' },
  { label: '101-250', value: '101-250' },
  { label: '251-500', value: '251-500' },
  { label: '501-1000', value: '501-1000' },
  { label: '1001-5000', value: '1001-5000' },
  { label: '5001-10000', value: '5001-10000' },
  { label: '10001+', value: '10001+' },
]

export const ftesRangeWithBlankOptions = [{ label: 'Blank', value: 'blank' }, ...ftesRange]
