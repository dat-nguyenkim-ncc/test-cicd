import { FormOption } from '../../../types'

export type FilterType = {
  geography: GeographyType
  fundingAmount: FundingAmountType
  years: {
    year: string
    yearRange: YearRangeType
  }
  investorType: FormOption[]
  investors: FormOption[]
}

export type ItemGeographyType = {
  name: string
  parent?: string
  parent1?: string
  parent2?: string
}

export type GeographyType = {
  region: ItemGeographyType[]
  region1: ItemGeographyType[]
  region2: ItemGeographyType[]
  countries: ItemGeographyType[]
}

export type FundingAmountType = {
  from: string
  to: string
}

export type YearRangeType = {
  from: string
  to: string
}

export type DateRangeType = {
  from: string
  to: string
}

export const getYearList = (startYear: number) => {
  let currentYear = new Date().getFullYear()
  let years = []
  startYear = startYear || 2000
  while (startYear <= currentYear) {
    years.push(currentYear--)
  }
  return years
}
