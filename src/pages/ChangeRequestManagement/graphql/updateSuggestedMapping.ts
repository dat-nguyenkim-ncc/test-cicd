import { gql } from '@apollo/client'

export default gql`
  mutation($id: String!) {
    updateSuggestedMapping(id: $id)
  }
`
