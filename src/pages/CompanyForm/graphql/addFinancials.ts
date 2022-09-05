import { gql } from '@apollo/client'

export default gql`
  mutation addFinancials($input: FinancialsInput!) {
    addFinancials(input: $input)
  }
`
