import { gql } from '@apollo/client'

export default gql`
  mutation CreatePeopleTabManual($input: [CreatePeopleTabInput!]!) {
    createPeopleTab(input: $input) {
      externalId
      source
    }
  }
`