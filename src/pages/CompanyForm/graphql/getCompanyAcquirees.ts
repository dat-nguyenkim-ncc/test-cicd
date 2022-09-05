import { gql } from '@apollo/client'
import { Fragments } from '.'

export default gql`
  query($companyId: Int!, $page: Int, $size: Int, $showAll: Boolean) {
    getCompanyAcquireesById(companyId: $companyId, page: $page, size: $size, showAll: $showAll) {
      acquirees {
        ...Acquisition
        investors {
          ...Investor
        }
        company {
          company_id
          name
          logo_bucket_url
          fct_status_id
          category
        }
      }
      total
    }
  }
  ${Fragments.acquisition}
  ${Fragments.investor}
`
