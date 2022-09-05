import { gql } from '@apollo/client'

export default gql`
  mutation($input: MultipleCopyBucketInput!) {
    multipleCopyBucket(input: $input)
  }
`
