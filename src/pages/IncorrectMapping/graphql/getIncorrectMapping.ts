import { gql } from '@apollo/client'

export default gql`
  query getIncorrectMapping($input: IncorrectMappingInput) {
    getIncorrectMapping(input: $input) {
      total
      data {
        company_id
        mapped_l1_cluster
        suggested_l1_cluster
        mapping_score_delta
        reviewed
        reviewed_date
        reviewer
        name
        description
        long_description
        logo_url
        total_equity_funding
        website_url
        status
        founded_year
        ftes_range
        ftes_exact
        source
        last_funding_date
      }
    }
  }
`
