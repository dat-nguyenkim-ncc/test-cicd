import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyTechnology(companyId: $companyId) {
      ...CompanyTechnology
    }
  }
  ${Fragments.companyTechnology}
`
