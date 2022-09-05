import gql from 'graphql-tag'
import { Fragments } from '.'

export default gql`
  query getCompanyInvestments(
    $id: Int!
    $page: Int
    $size: Int
    $showAll: Boolean
    $showDetail: Boolean
  ) {
    getCompanyInvestments(
      id: $id
      page: $page
      size: $size
      showAll: $showAll
      showDetail: $showDetail
    ) {
      investmentDetails {
        ...Financials
      }
      investments {
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
        company {
          company_id
          name
          logo_bucket_url
          fct_status_id
          category
        }
      }
      total
    }
  }
  ${Fragments.investor}
  ${Fragments.financials}
`
