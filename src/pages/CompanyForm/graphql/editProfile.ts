import { gql } from '@apollo/client'

export default gql`
  mutation editProfile($companyId: Int!, $profile: ProfileEditInput!) {
    editProfile(companyId: $companyId, profile: $profile)
  }
`
