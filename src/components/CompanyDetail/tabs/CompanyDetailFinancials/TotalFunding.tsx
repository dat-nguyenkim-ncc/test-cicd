import React from 'react'
import { groupBy } from 'lodash'
import { Box, Grid } from 'theme-ui'
import CompanyDetailInline from '../CompanyDetailInline'
import Decimal from 'decimal.js-light'
import { CompanyFinancialsFundingRound, ViewInterface } from '../../../../types'
import { formatMoney } from '../../../../utils'
import strings from '../../../../strings'

type TotalFundingProps = ViewInterface<{
  isExternalViewDetail: boolean
  fundingRounds: CompanyFinancialsFundingRound[]
}>

function TotalFunding({ isExternalViewDetail, fundingRounds }: TotalFundingProps) {
  const {
    companyDetail: { financials: copy },
  } = strings

  if (isExternalViewDetail) return null

  const groupedFundingRounds = groupBy(fundingRounds || [], f => f.expandRound1)
  const totalFunding = fundingRounds
    ?.map(item => item?.investment.value || 0)
    .reduce(
      (pre: number, cur: number) => new Decimal(pre || 0).plus(new Decimal(cur || 0)).toNumber(),
      0
    )

  const getTotalByFundingRounds = (arr: CompanyFinancialsFundingRound[]) => {
    const flatArr = arr?.map(item => item?.investment.value)
    if (flatArr?.every(item => typeof item !== 'number')) return copy.fundingRounds.notAvailable
    const total = flatArr?.reduce(
      (pre: number, cur: number) => new Decimal(pre || 0).plus(new Decimal(cur || 0)).toNumber(),
      0
    )
    if (total) return formatMoney(total, arr[0]?.investment?.currency)
    return copy.fundingRounds.notAvailable
  }

  return (
    <Box mb={3}>
      <CompanyDetailInline
        title={`${copy.fundingRounds.totalFunding}: `}
        key={copy.fundingRounds.totalFunding}
        detail={
          totalFunding ? formatMoney(totalFunding, fundingRounds[0]?.investment?.currency) : copy.fundingRounds.notAvailable
        }
      />
      <Grid columns={'1fr 1fr'}>
        {Object.values(groupedFundingRounds).map((arr, i) => (
          <CompanyDetailInline
            key={arr[0]?.expandRound1 + i}
            title={`TOTAL ${arr[0]?.expandRound1?.toUpperCase()}:`}
            detail={getTotalByFundingRounds(arr)}
          />
        ))}
      </Grid>
    </Box>
  )
}

export default TotalFunding
