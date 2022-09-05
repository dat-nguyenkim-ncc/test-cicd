import { gql } from '@apollo/client'

export default gql`
  mutation editInvestor($edit_record: EditInvestorInput!) {
    editInvestor(edit_record: $edit_record)
  }
`
