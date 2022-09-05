import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query getCompanyProducts($input: CompanyProductsInput) {
    getCompanyProducts(input: $input) {
      data {
        ...Product
      }
      productClusters
    }
  }
  ${Fragments.product}
`
