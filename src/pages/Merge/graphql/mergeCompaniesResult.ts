import { gql } from '@apollo/client'

export default gql`
  mutation mergeCompaniesResult($input: MergeCompanies!) {
    mergeCompaniesResult(input: $input)
  }
`
