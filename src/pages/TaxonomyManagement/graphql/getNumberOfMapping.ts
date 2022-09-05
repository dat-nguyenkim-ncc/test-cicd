import gql from 'graphql-tag'

export const GET_NUMBER_OF_MAPPING = gql`
  query GetNumberOfCompanyMapping($dimensionIds: [Int!]) {
    getNumberOfCompanyMapping(dimensionIds: $dimensionIds) {
      count
    }
  }
`
