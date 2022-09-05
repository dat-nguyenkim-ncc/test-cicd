import { gql } from '@apollo/client'

export default gql`
  mutation($input: UpdateAttachmentStatusInput!) {
    updateAttachmentStatus(input: $input)
  }
`
