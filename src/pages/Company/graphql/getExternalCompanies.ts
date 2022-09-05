import { gql } from '@apollo/client'
import { Fragments } from '../../CompanyForm/graphql'

export default gql`
  query GetExternalCompaniesByIds($input: [GetExternalCompanyById]!) {
    getExternalCompaniesByIds(input: $input) {
      companies {
        ...SharedCompanyResult
      }
    }
  }
  ${Fragments.acquisition}
  ${Fragments.people}
  ${Fragments.investor}
  ${Fragments.financials}
  ${Fragments.overview}
  ${Fragments.getExternalCompanyById}
  ${Fragments.ipos}
  ${Fragments.acquirees}
`
