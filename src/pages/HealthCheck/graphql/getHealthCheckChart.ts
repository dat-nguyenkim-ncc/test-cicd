import { gql } from '@apollo/client'

export default gql`
  query GetHealthCheckChart($timeFrame: String) {
    getHealthCheckChart(timeFrame: $timeFrame) {
      date
      data_completeness
      mapping_quality
      source_coverage
      fintech_coverage
      overall_health
    }
  }
`
