import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!, $page: Int, $pageSize: Int, $activeOnly: Boolean, $rowId: String) {
    getCompanyPartnerships(
      companyId: $companyId
      page: $page
      pageSize: $pageSize
      activeOnly: $activeOnly
      rowId: $rowId
    ) {
      total
      partners
      data {
        name
        externalId
        companyId
        logoUrl
        partnerships {
          ...Partnership
        }
      }
    }
  }
  ${Fragments.partnership}
`
