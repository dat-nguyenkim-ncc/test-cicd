import { gql } from '@apollo/client'

export default gql`
  mutation($input: AppendTechnology!) {
    appendNewTechnology(input: $input)
  }
`
