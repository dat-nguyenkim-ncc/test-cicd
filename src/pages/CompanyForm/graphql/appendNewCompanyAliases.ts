import { gql } from '@apollo/client'

export default gql`
  mutation appendNewCompanyAliases($companyId: Int!, $company_aliases: [String]!) {
    appendNewCompanyAliases(companyId: $companyId, company_aliases: $company_aliases)
  }
`

export const GET_COMPANY_ALIASES = gql`
  query($companyId: Int!) {
    getCompanyAliases(companyId: $companyId) {
      alias_id
      company_alias
      expand_status_id
      source
    }
  }
`
