import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query getFinanceServicesLicenses($companyId: Int!) {
    getCompanyFinancialServicesLicenses(companyId: $companyId) {
      ...FinancialServiceLicense
    }
  }

  ${Fragments.financialServiceLicense}
`
