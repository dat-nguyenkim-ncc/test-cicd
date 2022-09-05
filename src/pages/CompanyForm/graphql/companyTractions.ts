import gql from 'graphql-tag'

export const GET_COMPANY_TRACTIONS = gql`
  query getCompanyTractions($input: CompanyTractionsInput) {
    getCompanyTractions(input: $input) {
      total
      skip
      take
      result {
        sentence
        url
        date
        topic
      }
    }
  }
`
