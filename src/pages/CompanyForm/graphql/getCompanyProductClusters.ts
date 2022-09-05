import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyProductClusters(companyId: $companyId) {
      data {
        ...Product
      }
      productClusters
    }
  }
  ${Fragments.product}
`
