import { gql } from '@apollo/client'

export default gql`
  mutation SetDefaultCompany($input: SetDefaultCompanyInput!) {
    setDefaultCompany(input: $input) {
      response
    }
  }
`
