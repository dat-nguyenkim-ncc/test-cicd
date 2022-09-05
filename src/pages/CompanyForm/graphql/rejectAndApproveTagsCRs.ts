import { gql } from '@apollo/client'

export default gql`
  mutation approveAndRejectTagCRs(
    $companyId: Int!
    $approve: [Int!]
    $reject: [Int!]
    $reason: String
  ) {
    approveAndRejectTagCRs(
      companyId: $companyId
      approve: $approve
      reject: $reject
      reason: $reason
    )
  }
`
