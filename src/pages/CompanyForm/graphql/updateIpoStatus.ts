import { gql } from '@apollo/client'

export default gql`
  mutation($input: UpdateStatusInput1!) {
    updateStatusIpo(input: $input)
  }
`
