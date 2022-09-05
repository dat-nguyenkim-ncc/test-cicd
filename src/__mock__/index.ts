import { TagGroupType } from './../types/index.d'
import {
  CompanyBusiness,
  CompanyDetail,
  CompanyFinancials,
  CompanyOverview,
  CompanyPeople,
  MappingSummary,
  TagData,
  TagDataParent,
} from '../types'
import { EnumAttachmentType, EnumCompanyTypeSector } from '../types/enums'

const getRandomId = (): string => {
  return (~~(Math.random() * 999999) + new Date().valueOf()).toString()
}

const companyTypes = Object.values(EnumCompanyTypeSector)
const suffix = ['Restaurant', 'Limited', 'UK', 'US', 'Bank']
export const mockCompanyId = getRandomId()
export const companyDetails = (): CompanyDetail => ({
  companyId: mockCompanyId,
  companyName: `Monzo ${suffix[~~(Math.random() * suffix.length)]}`,
  countryCode: 'GB',
  countryName: 'United Kingdom',
  url: 'https://monzo.com',
  companyTypes: [companyTypes[~~(Math.random() * companyTypes.length)]],
})

export const MockMonzoDetails = companyDetails()

export const mappingSummary = [
  {
    title: 'CATEGORIES',
    items: [
      { label: 'Fintech', parent: [] },
      { label: 'Retail Accounts' },
      { label: 'Accounts & Savings' },
      { label: 'Digital Banking' },
    ],
    type: EnumCompanyTypeSector.FIN,
  },
  {
    title: 'SECTORS',
    items: [{ label: 'No sector mapped', parent: [] }],
    type: EnumCompanyTypeSector.FIN,
  },
] as MappingSummary[]

export const companySources = [
  {
    company: MockMonzoDetails,
    source: {
      label: 'Source: XPTO',
      default: true,
    },
  },
  {
    company: companyDetails(),
    source: {
      label: 'Manual',
    },
  },
]

export const companyOverview = (): CompanyOverview => ({
  id: getRandomId(),
  source: 'CRB',
  sources: ['CRB', 'DR', 'MANUAL'],
  companyName: `Monzo ${suffix[~~(Math.random() * suffix.length)]}`,
  companyLocation: [
    {
      id: '123456',
      address: 'Broadwalk House<br>5 Appold Street<br>London<br>EC2A 2AG',
      postalCode: '94103',
      location: {
        region: 'EMEA',
        city: 'San Francisco',
        country: 'United States',
      },
      isHeadQuarter: true,
      selfDeclared: true,
      expandStatus: 'Following',
      source: 'bcg',
    },
  ],
  description: 'Monzo is a fintech challenger bank.',
  companyType: 'Startup',
  foundedYear: 2012,
  status: 'The company status',
  expandStatus: 'Following',
  expandStatusId: '1',
  closedDate: new Date(2012, 11, 1).toISOString(),
  ftse: 1000,
  logoUrl: 'https://monzo.com/logo.svg',
  contactEmail: 'monzo@monzo.com',
  phoneNumber: '0123456789',
  tags: null,
  otherNames: null,
  lastFundingType: null,
  logo_bucket_url: '',
  hashed_image: '',
  attachments: [
    {
      name: 'File nam',
      description: 'Broadwalk House<br>5 Appold Street<br>London<br>EC2A 2AG',
      type: EnumAttachmentType.FCT_PROFILE,
      url_attachment: '',
      expandStatus: 'Following',
      selfDeclared: true,
      date_created: '2021-03-30 10:43:33',
    },
  ],
  aliases: [
    {
      alias_id: '200354bcg1',
      company_alias: 'name-edit',
      expand_status_id: 1,
      selfDeclared: true,
      source: 'bcg',
    },
    {
      alias_id: '200354bcg2',
      company_alias: 'test1',
      expand_status_id: 1,
      selfDeclared: true,
      source: 'bcg',
    },
  ],
})

export const companyFinancials = (): CompanyFinancials => ({
  valuation: {
    value: 23123123,
    currency: 'USD',
  },
  fundingTotal: {
    value: 2312312312,
    currency: 'USD',
  },
  companyStage: 'Series E+',
  lastFundingDate: {
    value: 1231233,
    currency: 'USD',
  },
  equityFundingTotal: {
    value: 1231233,
    currency: 'USD',
  },
  leadInvestor: 'Mussum Cassilds-Cepacol',
  lastFundingAmount: {
    value: 123123123,
    currency: 'USD',
  },
  fundingRounds: [
    {
      id: '1',
      date: new Date(2012, 11, 1).toISOString(),
      quarter: 'Q2',
      comment: 'This is comment',
      roundTypes: ['Equity Financing, series E+'],
      expandRound1: 'Equity Financing',
      originExpandRound1: 'Equity Financing',
      valuation: {
        value: 123123123,
        currency: 'USD',
      },
      investment: {
        value: 123123123,
        currency: 'USD',
      },
      investors: {
        lead: 'Accel Partners, VC',
        other:
          'Goodwater Capital, VC Orange, Corporate Passion Capital, VC Reference Capital (formerly Genevest), VC Stripe, Tech Thrive Capital, VC Vanderbilt University, Other Y Combinator, Accelerator',
      },
    },
    {
      id: '2',
      date: new Date(2012, 11, 1).toISOString(),
      quarter: 'Q2',
      comment: 'This is comment',
      roundTypes: ['Equity Financing, series E+'],
      expandRound1: 'Equity Financing',
      originExpandRound1: 'Equity Financing',
      valuation: {
        value: 123123123,
        currency: 'USD',
      },
      investment: {
        value: 123123123,
        currency: 'USD',
      },
      investors: {
        lead: 'Accel Partners, VC',
      },
    },
    {
      id: '3',
      date: new Date(2012, 11, 1).toISOString(),
      quarter: 'Q2',
      comment: 'This is comment',
      roundTypes: ['Equity Financing, series E+'],
      expandRound1: 'Equity Financing',
      originExpandRound1: 'Equity Financing',
      valuation: {
        value: 123123123,
        currency: 'USD',
      },
      investment: {
        value: 123123123,
        currency: 'USD',
      },
      investors: {
        lead: 'Accel Partners, VC',
      },
    },
  ],
  isExternalViewDetail: true,
})

export const companyBusiness = (): CompanyBusiness => ({
  productsServices: ['Offers a current account and debit card '],
  businessRevenue: ['Service type: B2C'],
  targetClients: ['Retail customers'],
  partnerships: [
    '**Deliveroo:** Partnered with Deliveroo in Sep-2017 to allow users to split the bill on orders via its Monzo.me money request feature',
  ],
  vision: ['string'],
  keyMetrics: ['string'],
  differentiators: ['string'],
})

export const companyAcquisitions = () => []
export const companyIpos = () => []
export const companyPeople = (): CompanyPeople => ({ companyId: 145803 })

const tags = [
  'Capital Markets',
  'Corporate Banking',
  'Retail Banking',
  'SME Banking',
  'Support',
  'Technology',
  'Wealth Management',
]

const getRandomValueLabel = (index?: number) => {
  const tag = index ? tags[index] : tags[~~(Math.random() * tags.length)]
  return {
    label: tag,
    value: tag.toLowerCase().replace(' ', '_'),
  }
}

const getRandomBoolean = () => {
  return Math.random() * 10 > 5
}

export const TagMock = (
  index?: number,
  level: number = 0,
  parent: TagDataParent[] = []
): TagData => {
  const { value, label } = getRandomValueLabel(index)
  const id = getRandomId()
  const rowId = getRandomId()
  const isPriority = getRandomBoolean()
  return {
    id,
    rowId,
    value,
    label,
    isPriority,
    endpoint: level > 0 ? Math.random() > 0.5 : false,
    parent,
    description: 'Mock',
    children:
      level >= 5
        ? undefined
        : new Array(Math.max(3, ~~(Math.random() * tags.length)))
            .fill(null)
            .map((_a, index) =>
              TagMock(index, level + 1, [...parent, { id, rowId, label, value, isPriority }])
            ),
  }
}

export const ListRandomTags = (): TagData[] =>
  new Array(tags.length).fill(null).map((_a, index) => TagMock(index, 0))

const labels = [
  'Insurance Value Chain 1',
  'Insure Tech Tag',
  'Revenue model',
  'P&C Commercial Customers',
  'Product',
  'RegTech',
  'Regulation',
  'Report',
]

export const TagGroupMock = (): TagGroupType[] =>
  new Array(labels.length * 2).fill(null).map((_a, index) => {
    const id = getRandomId()
    const rowId = getRandomId()
    const label = labels[index % labels.length]
    const value = label.toLowerCase().split(' ').join('_')
    const isPriority = getRandomBoolean()
    return {
      id,
      rowId,
      label,
      value,
      isPriority,
      parent: [],
      children: new Array(Math.max(1, ~~(Math.random() * labels.length * 2)))
        .fill(null)
        .map((_b, index) => {
          const labelChild = labels[index % labels.length]
          return {
            label: labelChild,
            id: getRandomId(),
            rowId: getRandomId(),
            parent: [{ id, label, value }],
            isPriority,
            value: labelChild.toLowerCase().split(' ').join('_'),
          }
        }),
    }
  })
