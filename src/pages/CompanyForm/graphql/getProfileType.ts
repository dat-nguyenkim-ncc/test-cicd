import { gql } from '@apollo/client'

export default gql`
  query getProfileType {
    getProfileType {
      profile_type_id
      profile_type_name
      isSingle
      isNumber
      isBoolean
      options
      group {
        profile_type_id
        profile_type_name
        options
        isSingle
        isNumber
        isBoolean
      }
    }
  }
`
