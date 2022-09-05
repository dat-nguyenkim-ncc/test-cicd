import { gql } from '@apollo/client'

export default gql`
  query getSimilarCompanies($input: SimilarCompaniesInput) {
    getSimilarCompanies(input: $input) {
      total
      pageSize
      currentPage
      numberOfPages
      data {
        companyId
        companyName
        logoUrl
        description
        longDescription
        country
        category
        cluster
        distance
      }
    }
  }
`
