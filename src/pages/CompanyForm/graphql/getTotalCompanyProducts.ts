import { gql } from '@apollo/client'

export default gql`
  query getTotalCompanyProducts($input: CompanyProductsInput) {
    getTotalCompanyProducts(input: $input) {
      total
    }
  }
`
