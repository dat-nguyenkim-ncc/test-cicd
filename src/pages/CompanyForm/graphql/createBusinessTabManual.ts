import { gql } from '@apollo/client'

export default gql`
  mutation CreateBusinessTabManual($input: [CreateBusinessTabInput!]!) {
    createBusinessTab(input: $input) {
      source
      externalId
    }
  }
`