import { gql } from '@apollo/client'

export default gql`
  mutation editFundingRound(
    $companyId: String!
    $user_name: String!
    $edit_record: EditFundingRoundInput!
  ) {
    editFundingRound(companyId: $companyId, user_name: $user_name, edit_record: $edit_record)
  }
`
