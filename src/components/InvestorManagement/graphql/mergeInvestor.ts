import { gql } from '@apollo/client'

export default gql`
  mutation mergeInvestor($input: MergeInvestorInput!) {
    mergeInvestor(input: $input)
  }
`
