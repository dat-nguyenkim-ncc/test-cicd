import { gql } from '@apollo/client'

export const GET_COMPANY_NEWS_CHART = gql`
  query GetCompanyNewsChart($companyId: Int!) {
    getCompanyNewsChart(companyId: $companyId) {
      trend
      thirtyDaysAverage
      thirtyDaysToSixtyDaysAverge
      sentimentChartData {
        date
        sevenDaysAverage
        sumPositive
        sumNegative
      }
    }
  }
`
