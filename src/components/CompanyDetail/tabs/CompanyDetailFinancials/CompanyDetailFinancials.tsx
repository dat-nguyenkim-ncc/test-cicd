import React, { useState } from 'react'
import { Box, Grid, Link } from 'theme-ui'
import strings from '../../../../strings'
import { formatMoney } from '../../../../utils'
import CompanyDetailInline from '../CompanyDetailInline'
import { Paragraph } from '../../../primitives'
import { CompanyFinancials, InvestorsProps, ValueCurrency } from '../../../../types'
import moment from 'moment'
import CompanyDetailInlineInvestors from '../CompanyDetailInlineInvestors'
import { SortByDate } from '../../../../pages/CompanyForm/helpers'
import TotalFunding from './TotalFunding'
import { CompanyLink } from '../../..'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../../utils/consts'

export type CompanyDetailFinancialsProps = {
  data: CompanyFinancials
  isInvestment?: boolean
}

type ShowTextProps = {
  value: string
  max: number
}
const ShowText = ({ value, max }: ShowTextProps) => {
  const [showFull, setShowFull] = useState(false)
  return (
    <>
      <Paragraph sx={{ mb: 2, wordWrap: 'break-word' }}>
        {showFull ? value : `${value.slice(0, max)}${value.length > max ? '...' : ''}`}
      </Paragraph>
      {value.length >= max && (
        <Link
          href=""
          onClick={e => {
            e.preventDefault()
            setShowFull(!showFull)
          }}
        >
          {showFull ? 'Show less' : 'Show more'}
        </Link>
      )}
    </>
  )
}

const CompanyDetailFinancials = ({ data, isInvestment = false }: CompanyDetailFinancialsProps) => {
  const {
    companyDetail: { financials: copy },
  } = strings

  const mapTitles = {
    valuation: copy.valuation,
    fundingTotal: copy.fundingTotal,
    fundingStage: copy.fundingStage,
    lastFundingAt: copy.lastFundingAt,
    lastFundingDate: copy.lastFundingDate,
    equityFundingTotal: copy.equityFundingTotal,
    leadInvestor: copy.leadInvestor,
    lastFundingAmount: copy.lastFundingAmount,
  }

  const tableKeys = React.useMemo(
    () => [
      {
        key: 'date',
        format: (v: string | number) =>
          moment(v).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' ? (
            <Paragraph>{moment(v).format(DEFAULT_VIEW_DATE_FORMAT)}</Paragraph>
          ) : (
            <Paragraph>Not available</Paragraph>
          ),
      },
      {
        key: 'roundTypes',
        format: (rounds: string[]) =>
          rounds.map((value: string, index) => (
            <Paragraph key={index}>{`${value}${index < rounds.length - 1 ? ',' : ''}`}</Paragraph>
          )),
      },
      {
        key: data.isExternalViewDetail ? 'investment' : 'investment_usd',
        format: (v: ValueCurrency) =>
          v.value ? (
            <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
          ) : (
            <Paragraph>Not available</Paragraph>
          ),
      },
      {
        key: data.isExternalViewDetail ? 'valuation' : 'valuation_usd',
        format: (v: ValueCurrency) =>
          v.value ? (
            <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
          ) : (
            <Paragraph>Not available</Paragraph>
          ),
      },
      isInvestment
        ? {
            key: 'company',
            format: (company: { company_id: number; name: string; logo_bucket_url?: string }) =>
              !!company?.company_id ? (
                <CompanyLink company={company} />
              ) : (
                <Paragraph>Not available</Paragraph>
              ),
          }
        : {
            key: 'investors',
            format: ({ lead, other }: InvestorsProps) => (
              <CompanyDetailInlineInvestors lead={lead} other={other} />
            ),
          },
      {
        key: 'comment',
        format: (value: string) => <ShowText value={value} max={120} />,
      },
    ],
    [data.isExternalViewDetail, isInvestment]
  )

  type FundingRoudsKeys = keyof typeof copy.fundingRounds

  const showFundingRound = (data: any) => {
    return (
      moment(data.date).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' ||
      data.investment.value ||
      data.roundTypes.length ||
      data.valuation.value ||
      data.investors.lead ||
      data.investors.other
    )
  }

  return (
    <Box>
      <Grid mt={4} gap={0} columns={'50% 50%'}>
        {Object.keys(mapTitles).map(t => {
          if (!mapTitles[t as keyof typeof mapTitles]) return null

          const title = `${mapTitles[t as keyof typeof mapTitles]}:`
          let detail = data[t as keyof typeof data]
          if (!detail) return null

          detail =
            (detail as ValueCurrency).value && (detail as ValueCurrency).currency
              ? formatMoney((detail as ValueCurrency).value, (detail as ValueCurrency).currency)
              : detail.toString()

          if (detail === '[object Object]') return null

          return <CompanyDetailInline key={title} title={title} detail={detail} />
        })}
      </Grid>
      {data.fundingRounds && data.fundingRounds.length > 0 && (
        <Box mt={!isInvestment ? 5 : 0}>
          {!isInvestment && (
            <TotalFunding
              isExternalViewDetail={data.isExternalViewDetail}
              fundingRounds={data.fundingRounds}
            />
          )}
          <Paragraph bold>{copy.fundingRounds.heading}</Paragraph>
          <Grid sx={{ p: 5 }} mt={4} columns={'1fr 1fr 1fr 1fr 1fr 1fr'}>
            {tableKeys.map((t, index) => (
              <Paragraph sx={{ gridColumn: index + 1 }} key={t.key} bold>
                {copy.fundingRounds[t.key as FundingRoudsKeys]}
              </Paragraph>
            ))}
          </Grid>
          {data.fundingRounds
            .slice()
            .sort((a, b) => SortByDate(a, b, 'date', 'descending'))
            .filter(f => !!showFundingRound(f))
            .map((item, line) => {
              const f = {
                ...item,
                valuation_usd: item.valuation,
                investment_usd: item.investment,
              }
              return (
                <Grid
                  sx={{
                    p: 5,
                    backgroundColor: line % 2 === 0 ? 'gray03' : 'transparent',
                    borderRadius: 10,
                  }}
                  key={line}
                  mt={4}
                  columns={'1fr 1fr 1fr 1fr 1fr 1fr'}
                >
                  {tableKeys.map((t, index) => {
                    // @ts-ignore
                    const value = f[t.key] || ''

                    return t.format ? (
                      <Box sx={{ gridColumn: index + 1 }} key={index}>
                        {t.format(value)}
                      </Box>
                    ) : (
                      <Paragraph sx={{ gridColumn: index + 1 }} key={index}>
                        {value || '-'}
                      </Paragraph>
                    )
                  })}
                </Grid>
              )
            })}
        </Box>
      )}
    </Box>
  )
}

export default CompanyDetailFinancials
