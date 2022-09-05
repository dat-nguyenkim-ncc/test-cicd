import { gql } from '@apollo/client'

export default gql`
  query getCurrencyConversion($input: CurrencyConversionInput) {
    getCurrencyConversion(input: $input) {
      data {
        id
        year
        currency
        rate
      }
      total
    }
  }
`
