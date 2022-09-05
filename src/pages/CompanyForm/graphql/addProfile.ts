import { gql } from '@apollo/client'

export default gql`
  mutation addProfile($input: ProfileInput!) {
    addProfile(input: $input)
  }
`
