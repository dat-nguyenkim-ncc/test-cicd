import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyTechnologyCertification(companyId: $companyId) {
      ...CompanyTechnologyCertification
    }
  }
  ${Fragments.companyTechnologyCertification}
`
