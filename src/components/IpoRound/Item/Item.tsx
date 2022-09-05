import React, { PropsWithChildren } from 'react'
import { Box, Grid, Label } from 'theme-ui'
import { UpdateStatusInput1 } from '../../../pages/CompanyForm/graphql'
import { TableNames, validateMoney } from '../../../pages/CompanyForm/helpers'
import strings from '../../../strings'
import {
  FinancialItemHeaderProps,
  SharedFinancialWrapperProps,
  ViewInterface,
} from '../../../types'
import { EnumExpandStatus } from '../../../types/enums'
import { formatMoneyView } from '../../../utils/helper'
import FinanceItemWrapper from '../../FinanceItemWrapper'
import { Paragraph } from '../../primitives'
import { IpoForm } from '../IpoRound'
import { Props as FCTStatusActionProps } from '../../FCTStatusAction/FCTStatusAction'

export type Props = ViewInterface<{
  ipo: IpoForm
  unfollowIpoRound(input: UpdateStatusInput1): void
}> &
  SharedFinancialWrapperProps &
  FinancialItemHeaderProps &
  Pick<
    FCTStatusActionProps,
    'handleAppendDataCQAction' | 'viewPendingCQFn' | 'viewHistoryFn' | 'getNumPending'
  >

export default ({
  ipo,
  unfollowIpoRound,
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
      item={{
        id: ipo.ipo_id as string,
        expandStatus: (ipo.expandStatus || '') as EnumExpandStatus,
        selfDeclared: ipo.selfDeclared,
        tableName: TableNames.IPO,
        source: ipo.source || '',
      }}
      pendingCR={pendingCR}
      isOverride={isOverride}
      sx={sx}
      buttons={buttons}
      unfollowItem={input => unfollowIpoRound(input)}
      label={'IPO Round'}
      viewHistoryFn={viewHistoryFn}
      viewPendingCQFn={viewPendingCQFn}
      handleAppendDataCQAction={handleAppendDataCQAction}
      getNumPending={getNumPending}
    >
      <ItemInfoContainer>
        <RoundInfo ipo={ipo} />
      </ItemInfoContainer>
    </FinanceItemWrapper>
  )
}

const {
  pages: {
    addCompanyForm: { ipos: copy },
  },
} = strings

const ItemInfoContainer = ({ children }: PropsWithChildren<{}>) => (
  <Grid
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

const ROUND_INFO_GRID = ['1fr 1fr 1fr 1fr 1fr 1fr']

const RoundInfo = ({ ipo }: Pick<Props, 'ipo'>) => {
  return (
    <Grid columns={ROUND_INFO_GRID}>
      {[
        {
          name: copy.fields.source_amount,
          value:
            ipo?.sourceAmount && ipo?.amountCurrency
              ? formatMoneyView(+ipo.sourceAmount, ipo.amountCurrency)
              : ipo?.sourceAmount,
        },
        { name: copy.fields.amount_currency, value: ipo?.amountCurrency },
        { name: copy.fields.amount, value: validateMoney(ipo?.amount) },
        { name: copy.fields.share_price, value: validateMoney(ipo?.share_price) },
        { name: copy.fields.shares_outstanding, value: ipo?.shares_outstanding },
        { name: copy.fields.shares_sold, value: ipo?.shares_sold },
        { name: copy.fields.stock_exchange, value: ipo?.stock_exchange },
        { name: copy.fields.stock_symbol, value: ipo?.stock_symbol },
        { name: copy.fields.valuation, value: validateMoney(ipo?.valuation) },
        { name: copy.fields.went_public_on, value: ipo?.went_public_on },
        { name: copy.fields.apiAppend, value: ipo?.api_append === '0' ? 'False' : ipo?.api_append },
      ].map((item, index) => (
        <Box
          key={index}
          mb={4}
          sx={{
            wordBreak: 'break-word',
          }}
        >
          <Label mb={1}>{item.name}</Label>
          <Paragraph>{item.value?.toString() || ''}</Paragraph>
        </Box>
      ))}
    </Grid>
  )
}
