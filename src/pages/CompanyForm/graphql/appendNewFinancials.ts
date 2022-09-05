import { gql } from '@apollo/client'

export default gql`
  mutation appendNewFinancials($input: FinancialsInput!) {
    appendNewFinancials(input: $input)
  }
`
