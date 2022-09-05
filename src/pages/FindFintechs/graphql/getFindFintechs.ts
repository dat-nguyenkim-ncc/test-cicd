import { gql } from '@apollo/client'

export default gql`
  query getFindFintechs($input: FindFintechsInput) {
    getFindFintechs(input: $input) {
      total
      companies {
        external_id
        source
        company_name
        url
        short_description
        long_description
        founded_year
        status
        ftes_range
        ftes_exact
        total_equity_funding_USD
        countryCode
        last_funding_date
        suggested_mapping
        score_delta
        external_tags
      }
    }
  }
`
