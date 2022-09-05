import { gql } from '@apollo/client'
import { Fragments } from '.'

export const GET_COMPANY_ACQUIREES = gql`
  query GET_COMPANY_ACQUIREES($companyId: Int!, $take: Int, $skip: Int, $activeOnly: Boolean) {
    getCompanyAcquirees(companyId: $companyId, take: $take, skip: $skip, activeOnly: $activeOnly) {
      total
      skip
      take
      result {
        ...Acquiree
      }
    }
  }
  ${Fragments.acquirees}
`
