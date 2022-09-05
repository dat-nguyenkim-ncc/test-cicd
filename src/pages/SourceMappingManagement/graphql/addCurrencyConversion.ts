import { gql } from '@apollo/client'

export default gql`
  mutation addCurrencyConversion($input: AddCurrencyConversionInput!) {
    addCurrencyConversion(input: $input)
  }
`
