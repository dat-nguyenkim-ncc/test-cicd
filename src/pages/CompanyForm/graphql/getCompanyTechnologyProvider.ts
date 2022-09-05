import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyTechnologyProvider(companyId: $companyId) {
      ...CompanyTechnologyProvider
    }
  }
  ${Fragments.companyTechnologyProvider}
`
