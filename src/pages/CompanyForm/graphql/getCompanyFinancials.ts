import gql from 'graphql-tag'
import { Fragments } from '.'

export default gql`
  query getCompanyFinancials($id: Int!) {
    getCompanyFinancials(id: $id) {
      fundingRounds {
        funding_id
        expandStatus
        date
        investment
        sourceInvestment
        investmentCurrency
        valuation
        comment
        roundType1 {
          id
          name
        }
        roundType2 {
          id
          name
        }
        source
        selfDeclared
        apiAppend
        lead_investors {
          ...Investor
          isLead @client
        }
        investors {
          ...Investor
          isLead @client
        }
        sourceRoundType
      }
    }
  }
  ${Fragments.investor}
`
