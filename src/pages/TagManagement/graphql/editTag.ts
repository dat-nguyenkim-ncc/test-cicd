import { gql } from '@apollo/client'

export default gql`
  mutation editTag($input: EditTagInput!) {
    editTag(input: $input)
  }
`
