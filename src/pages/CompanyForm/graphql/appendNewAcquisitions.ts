import { gql } from '@apollo/client'

export default gql`
  mutation($input: AcquisitionsInput!) {
    appendNewAcquisitions(input: $input)
  }
`
