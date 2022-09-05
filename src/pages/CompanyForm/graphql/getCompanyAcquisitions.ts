import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyAcquisitions(companyId: $companyId) {
      ...Acquisition
      investors {
        ...Investor
      }
    }
  }
  ${Fragments.acquisition}
  ${Fragments.investor}
`

