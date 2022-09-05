import { gql } from '@apollo/client'

export default gql`
  query getProfile($id: Int) {
    getProfile(id: $id) {
      profile_id
      company_id
      profile_type_id
      profile_value
      expand_status_id
      profile_type_name
      selfDeclared
    }
  }
`
