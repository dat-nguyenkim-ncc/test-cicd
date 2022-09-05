import { gql } from '@apollo/client'

export default gql`
  query getUnconvertedCurrencies {
    getUnconvertedCurrencies {
      year
      currency
    }
  }
`
