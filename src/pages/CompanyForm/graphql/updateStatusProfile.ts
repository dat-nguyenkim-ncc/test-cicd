import { gql } from '@apollo/client'

export default gql`
  mutation updateStatusProfile($id: String!, $status: String!) {
    updateStatusProfile(id: $id, status: $status)
  }
`
