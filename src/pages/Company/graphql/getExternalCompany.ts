import { gql } from '@apollo/client'
import { Fragments } from '../../CompanyForm/graphql'

export default gql`
  query GetExternalCompanyById($input: GetExternalCompanyById!) {
    getExternalCompanyById(input: $input) {
      ...SharedCompanyResult
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
