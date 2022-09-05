import { gql } from '@apollo/client'

export default gql`
  mutation($input: AppendTechnologyProvider!) {
    appendNewTechnologyProvider(input: $input)
  }
`
