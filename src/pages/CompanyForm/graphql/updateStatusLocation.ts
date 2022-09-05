import { gql } from '@apollo/client'

export default gql`
  mutation updateStatusLocation($id: String!, $status: String!) {
    updateStatusLocation(id: $id, status: $status)
  }
`
