import { gql } from '@apollo/client'

export default gql`
  mutation($input: IposInput!) {
    appendNewIpos(input: $input)
  }
`
