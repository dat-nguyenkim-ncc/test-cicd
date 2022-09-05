import { gql } from '@apollo/client'

export default gql`
  query getAllSuggestedMappings($input: AllChangeRequestsInput!) {
    getAllSuggestedMappings(input: $input) {
      data {
        id
        companyId
        companyName
        currentMapping
        suggestedMapping
        isPrimary
        inputUser
        createdDate
        reviewed
        reviewer
        reviewedDate
      }
      total
    }
  }
`
