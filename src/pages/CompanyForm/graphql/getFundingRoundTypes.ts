import { gql } from '@apollo/client'

export default gql`
  query getFundingRoundTypes {
    getFundingRoundTypes {
      id
      name
      round_type
      parent_id
      children {
        id
        name
        round_type
        parent_id
      }
    }
  }
`
