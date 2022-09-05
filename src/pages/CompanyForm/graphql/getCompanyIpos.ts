import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!) {
    getCompanyIpos(companyId: $companyId) {
      ...Ipos
    }
  }
  ${Fragments.ipos}
`

