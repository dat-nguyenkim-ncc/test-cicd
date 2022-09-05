import { gql } from '@apollo/client'

export default gql`
  query GetKeywordAnalysis($input: KeywordAnalysisInput) {
    getKeywordAnalysis(input: $input) {
      total
      results {
        tag_id
        keyword
        number_of_occurrences
        uniqueness
      }
    }
  }
`
