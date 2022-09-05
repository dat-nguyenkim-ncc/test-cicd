import React from 'react'
import { Box, Grid } from 'theme-ui'
import { CompanyIpos, CompanyIposDetail, ValueCurrency } from '../../../../types'
import { Paragraph } from '../../../primitives'
import moment from 'moment'
import { formatMoney } from '../../../../utils'
import strings from '../../../../strings'
import { SortByDate } from '../../../../pages/CompanyForm/helpers'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../../utils/consts'

export type CompanyDetailIposProps = {
  data: CompanyIposDetail
}

const GRID = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr'

const CompanyDetailIpos = ({ data }: CompanyDetailIposProps) => {
  const {
    companyDetail: { ipos: copy },
  } = strings
  const tableKeys = [
    {
      key: 'went_public_on',
      format: (v: string | number) =>
        moment(v).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' ? (
          <Paragraph>{moment(v).format(DEFAULT_VIEW_DATE_FORMAT)}</Paragraph>
        ) : (
          <Paragraph>Not available</Paragraph>
        ),
    },
    {
      key: data.isExternalViewDetail ? 'amount' : 'amount_usd',
      format: (v: ValueCurrency) =>
        v && v.value && v.currency ? (
          <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
        ) : (
          <Paragraph>Not available</Paragraph>
        ),
    },
    {
      key: 'stock_exchange',
      format: (v: string) => <Paragraph>{v.toString()}</Paragraph>,
    },
    {
      key: 'stock_symbol',
      format: (v: string) => <Paragraph>{v.toString()}</Paragraph>,
    },
    {
      key: data.isExternalViewDetail ? 'share_price' : 'share_price_usd',
      format: (v: ValueCurrency) =>
        v && v.value && v.currency ? (
          <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
        ) : (
          <Paragraph>Not available</Paragraph>
        ),
    },
    {
      key: 'shares_outstanding',
      format: (v: string) => <Paragraph>{v.toString()}</Paragraph>,
    },
    {
      key: 'shares_sold',
      format: (v: string) => <Paragraph>{v.toString()}</Paragraph>,
    },
    {
      key: data.isExternalViewDetail ? 'valuation' : 'valuation_usd',
      format: (v: ValueCurrency) =>
        v && v.value && v.currency ? (
          <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
        ) : (
          <Paragraph>Not available</Paragraph>
        ),
    },
  ]

  const showable = (item: CompanyIpos) => {
    return moment(item.went_public_on).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' || item.source.length
  }

  return (
    <Box mt={5}>
      <Grid sx={{ p: 5 }} mt={4} columns={GRID}>
        {data.ipoRounds.length > 0 &&
          tableKeys.map((t, index) => (
            <Paragraph sx={{ gridColumn: index + 1 }} key={t.key} bold>
              {copy[t.key as keyof typeof copy]}
            </Paragraph>
          ))}
      </Grid>
      {data.ipoRounds
        .map(item => ({
          ...item,
          valuation_usd: item.valuation,
          amount_usd: item.amount,
          share_price_usd: item.share_price,
        }))
        .slice()
        .sort((a, b) => SortByDate(a, b, 'went_public_on', 'descending'))
        .map((item, line) =>
          !showable(item) ? null : (
            <Grid
              sx={{
                p: 5,
                backgroundColor: line % 2 === 0 ? 'gray03' : 'transparent',
                borderRadius: 10,
              }}
              key={line}
              mt={4}
              columns={GRID}
            >
              {tableKeys.map((t, index) => {
                const formattedItem = {
                  ...item,
                } as any

                const value = formattedItem[t.key] || ''

                return t.format ? (
                  <div className="tooltip" key={index}>
                    <Box sx={{ gridColumn: index + 1, cursor: 'pointer' }}>
                      {t.format(value).props.children.length > 10
                        ? `${t.format(value).props.children.substring(0, 10)}...`
                        : t.format(value)}
                    </Box>
                    {t.format(value).props.children.length > 10 && (
                      <span className="tooltiptext"> {t.format(value)}</span>
                    )}

                    <style>
                      {`
                        .tooltiptext {
                          visibility: hidden;
                          background-color: black;
                          color: #fff;
                          border-radius: 6px;
                          padding: 5px;
                        
                          /* Position the tooltip */
                          position: absolute;
                          z-index: 1;
                          margin-top: 5px;
                          max-width: 30%;
                          word-break: break-all;
                        }
                        
                        .tooltip:hover .tooltiptext {
                          visibility: visible;
                        }`}
                    </style>
                  </div>
                ) : (
                  <Paragraph sx={{ gridColumn: index + 1 }} key={index}>
                    {value.toString() || '-'}
                  </Paragraph>
                )
              })}
            </Grid>
          )
        )}
    </Box>
  )
}

export default CompanyDetailIpos
