import React from 'react'
import { Box, Grid } from 'theme-ui'
import { CompanyAcquisitions, CompanyAcquisitionsDetail, ValueCurrency } from '../../../../types'
import { Paragraph } from '../../../primitives'
import moment from 'moment'
import { formatMoney } from '../../../../utils'
import ShowText from '../../../ShowText'
import strings from '../../../../strings'
import { Investor } from '../../../InvestorForm'
import { EnumReverseCompanySource } from '../../../../types/enums'
import { SortByDate } from '../../../../pages/CompanyForm/helpers'
import { CompanyLink } from '../../..'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../../utils/consts'

export type CompanyDetailAcquisitionsProps = {
  data: CompanyAcquisitionsDetail
  isAcquirees?: boolean
}

const GRID = '1fr .5fr 1fr 1fr 1.5fr'

const CompanyDetailAcquisitions = ({
  data,
  isAcquirees = false,
}: CompanyDetailAcquisitionsProps) => {
  const {
    companyDetail: { acquisitions: copy },
  } = strings

  const tableKeys = React.useMemo(
    () => [
      {
        key: 'acquisition_date',
        format: (v: string | number) =>
          moment(v).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' ? (
            <Paragraph>{moment(v).format(DEFAULT_VIEW_DATE_FORMAT)}</Paragraph>
          ) : (
            <Paragraph>Not available</Paragraph>
          ),
      },
      {
        key: 'source',
        format: (v: string) => (
          <Paragraph>
            {EnumReverseCompanySource[v as keyof typeof EnumReverseCompanySource] || v}
          </Paragraph>
        ),
      },
      {
        key: data.isExternalViewDetail ? 'price' : 'price_usd',
        format: (v: ValueCurrency) =>
          v && v.value && v.currency ? (
            <Paragraph>{formatMoney(v.value, v.currency)}</Paragraph>
          ) : (
            <Paragraph>Not available</Paragraph>
          ),
      },
      isAcquirees
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
            format: (other: Investor[]) =>
              (other || []).map((item: Investor) => item.investor_name).join(', '),
          },

      {
        key: 'comment',
        format: (value: string) => <ShowText value={value} max={120} />,
      },
    ],
    [data.isExternalViewDetail, isAcquirees]
  )

  const showable = (item: CompanyAcquisitions) => {
    return (
      moment(item.acquisition_date).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date' ||
      item.source.length ||
      item.price ||
      item.investors
    )
  }

  return (
    <Box mt={5}>
      <Grid sx={{ p: 5 }} mt={4} columns={GRID}>
        {data.acquisitionRounds.length > 0 &&
          tableKeys.map((t, index) => (
            <Paragraph sx={{ gridColumn: index + 1 }} key={t.key} bold>
              {copy[t.key as keyof typeof copy]}
            </Paragraph>
          ))}
      </Grid>
      {data.acquisitionRounds
        .map(item => ({ ...item, price_usd: item.price }))
        .slice()
        .sort((a, b) => SortByDate(a, b, 'acquisition_date', 'descending'))
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
                  investment: {
                    value: +((data.isExternalViewDetail ? item.price : item.price_usd) || 0),
                    currency: item.currency,
                  },
                } as CompanyAcquisitions

                const value =
                  // @ts-ignore
                  formattedItem[['price', 'price_usd'].includes(t.key) ? 'investment' : t.key] || ''

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
        )}
    </Box>
  )
}

export default CompanyDetailAcquisitions
