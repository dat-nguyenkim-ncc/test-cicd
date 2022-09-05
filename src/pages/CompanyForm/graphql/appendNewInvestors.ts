import { gql } from '@apollo/client'

export default gql`
  mutation appendNewInvestors(
    $isFunding: Boolean
    $companyId: Int
    $fundings: [AppendInvestorInput]!
  ) {
    appendNewInvestors(isFunding: $isFunding, companyId: $companyId, fundings: $fundings)
  }
`
