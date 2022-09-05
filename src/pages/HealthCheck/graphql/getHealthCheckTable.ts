import { gql } from '@apollo/client'

export default gql`
  query GetHealthCheckTable($timeFrame: String) {
    getHealthCheckTable(timeFrame: $timeFrame) {
      date
      mapped_companies
      mapped_funding
      mapped_investors
      unmapped_companies
      unmapped_funding
      missing_description
      missing_foundedyear
      missing_hqlocation
      missing_operating_status
      unmapped_country
      unmapped_investors
      static_sources
      static_overview_sources
      active_overrides
      invalid_funding_date
      single_source
      news_articles
      news_coverage
      out_companies_have_profile
      apix_companies
      having_many_hq_locations
      dead_source_companies
      find_fintechs_with_funding
      incorrect_mappings
      unconverted_currencies
      duplicate_companies
      duplicate_investors
    }
  }
`
