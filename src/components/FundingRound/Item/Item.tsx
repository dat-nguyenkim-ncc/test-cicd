import React, { PropsWithChildren } from 'react'
import { Box, Flex, Grid, Label } from 'theme-ui'
import { UpdateStatusInput1 } from '../../../pages/CompanyForm/graphql'
import { TableNames, validateMoney } from '../../../pages/CompanyForm/helpers'
import strings from '../../../strings'
import {
  FinancialItemHeaderProps,
  SharedFinancialWrapperProps,
  ViewInterface,
} from '../../../types'
import {
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumReverseCompanySource,
} from '../../../types/enums'
import { formatMoneyView } from '../../../utils/helper'
import FinanceItemWrapper from '../../FinanceItemWrapper'
import { InvestorListView } from '../../InvestorListView/InvestorListView'
import { Paragraph } from '../../primitives'
import { FundingForm } from '../FundingRound'
import { Props as FCTStatusActionProps } from '../../FCTStatusAction/FCTStatusAction'
import { CompanyLink } from '../..'
import Pill from '../../Pill'

export type Props = ViewInterface<{
  funding: FundingForm
  unfollowFundingRound(input: UpdateStatusInput1): void
}> &
  FinancialItemHeaderProps &
  SharedFinancialWrapperProps &
  Pick<
    FCTStatusActionProps,
    'handleAppendDataCQAction' | 'viewPendingCQFn' | 'viewHistoryFn' | 'getNumPending'
  >

export default ({
  isReadOnly,
  funding,
  unfollowFundingRound,
  buttons,
  isOverride,
  sx,
  viewHistoryFn,
  viewPendingCQFn,
  handleAppendDataCQAction,
  getNumPending,
  pendingCR,
}: Props) => {
  return (
    <FinanceItemWrapper
      isReadOnly={isReadOnly}
      sx={sx}
      pendingCR={pendingCR}
      buttons={buttons}
      isOverride={isOverride}
      item={{
        expandStatus: funding.expandStatus as EnumExpandStatus,
        id: funding.id || '',
        tableName: TableNames.FUNDINGS,
        selfDeclared: funding.selfDeclared,
        source: (funding.round.source || '') as string,
      }}
      unfollowItem={input => unfollowFundingRound(input)}
      label={
        funding.company ? (
          <Flex sx={{ py: 3, flex: 1, alignItems: 'center' }}>
            <CompanyLink sx={{ flex: 1 }} company={funding.company} />
            {(funding.company.fct_status_id === +EnumExpandStatusId.DUPLICATED ||
              funding.company.category) && (
              <Pill
                sx={{ mr: 2 }}
                icon={
                  funding.company.fct_status_id === +EnumExpandStatusId.DUPLICATED
                    ? EnumExpandStatus.DUPLICATED
                    : funding.company.category
                }
                variant={
                  funding.company.fct_status_id === +EnumExpandStatusId.DUPLICATED
                    ? 'out'
                    : undefined
                }
              />
            )}
          </Flex>
        ) : (
          String(funding?.round?.roundType1) + ' Funding Round'
        )
      }
      viewHistoryFn={viewHistoryFn}
      viewPendingCQFn={viewPendingCQFn}
      handleAppendDataCQAction={handleAppendDataCQAction}
      getNumPending={getNumPending}
    >
      <ItemInfoContainer>
        <Box>
          <RoundInfo funding={funding} />
        </Box>
        <Box sx={{ width: '1px', height: '100%', bg: 'gray01', mx: 'auto' }} />
        <InvestorListView investors={funding.investors} />
      </ItemInfoContainer>
    </FinanceItemWrapper>
  )
}

const {
  pages: {
    addCompanyForm: { financials: copy },
  },
} = strings

const ItemInfoContainer = ({ children }: PropsWithChildren<{}>) => (
  <Grid
    columns={['1fr 1px 1fr']}
    sx={{
      bg: 'gray03',
      px: 4,
      py: 5,
      borderRadius: '10px',
      width: '100%',
      border: '1px solid',
      borderColor: 'gray01',
    }}
  >
    {children}
  </Grid>
)

const RoundInfo = ({ funding }: Pick<Props, 'funding'>) => (
  <Grid columns={['1fr 1fr 1fr']}>
    {[
      {
        name: copy.fields.roundType1,
        value: funding?.round?.roundType1 || '',
      },
      {
        name: copy.fields.roundType2,
        value: funding?.round?.roundType2 || '',
      },
      { name: copy.fields.date, value: funding?.round?.date },
      {
        name: copy.fields.source_investment,
        value:
          //@ts-ignore
          funding?.round?.sourceInvestment && funding?.round?.investmentCurrency
            ? //@ts-ignore
              formatMoneyView(+funding?.round?.sourceInvestment, funding?.round?.investmentCurrency)
            : //@ts-ignore
              funding?.round?.sourceInvestment || '',
      },
      //@ts-ignore
      { name: copy.fields.investment_currency, value: funding?.round?.investmentCurrency },
      { name: copy.fields.investment, value: validateMoney(funding?.round?.investment) },
      {
        name: copy.fields.source,
        value:
          EnumReverseCompanySource[
            funding?.round?.source as keyof typeof EnumReverseCompanySource
          ] ||
          funding?.round?.source ||
          '',
      },
      {
        name: copy.fields.apiAppend,

        value:
          funding?.round?.apiAppend === '0'
            ? 'False'
            : EnumReverseCompanySource[
                funding?.round?.apiAppend as keyof typeof EnumReverseCompanySource
              ] ||
              funding?.round?.apiAppend ||
              '',
      },
      { name: copy.fields.valuation, value: validateMoney(funding?.round?.valuation) },
      {
        name: copy.fields.comment,
        value: funding?.round?.comment,
      },
    ].map((item, index) => (
      <Box
        key={index}
        mb={4}
        sx={{
          ...(item.name === copy.fields.comment ? { gridColumnStart: 1, gridColumnEnd: 4 } : {}),
          wordBreak: 'break-word',
        }}
      >
        <Label mb={1}>{item.name}</Label>
        <Paragraph>{item.value || ''}</Paragraph>
      </Box>
    ))}
  </Grid>
)
