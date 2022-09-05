import { gql } from '@apollo/client'

export default gql`
  query getFundingRoundMappings($input: GetFundingRoundMappingInput) {
    getFundingRoundMappings(input: $input) {
      data {
        id
        sourceValue
        round2Id
        round1Id
        round1
        round2
      }
      total
    }
  }
`
