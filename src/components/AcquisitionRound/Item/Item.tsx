import React, { PropsWithChildren } from 'react'
import { Box, Flex, Grid, Label } from 'theme-ui'
import { UpdateStatusInput1 } from '../../../pages/CompanyForm/graphql'
import { TableNames, validateMoney } from '../../../pages/CompanyForm/helpers'
import strings from '../../../strings'
import { FinancialItemHeaderProps, ViewInterface } from '../../../types'
import {
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumReverseCompanySource,
} from '../../../types/enums'
import { formatMoneyView } from '../../../utils/helper'
import FinanceItemWrapper from '../../FinanceItemWrapper'
import { InvestorListView } from '../../InvestorListView/InvestorListView'
import { Paragraph } from '../../primitives'
import { AcquisitionForm } from '../AcquisitionRound'
import { Props as FCTStatusActionProps } from '../../FCTStatusAction/FCTStatusAction'
import { HasPendingCQField } from '../../../pages/CompanyForm/CompanyForm'
import { CompanyLink } from '../..'
import Pill from '../../Pill'

export type Props = ViewInterface<{
  acquisition: AcquisitionForm
  unfollowAcquisitionRound(input: UpdateStatusInput1): void
  pendingCR: HasPendingCQField[]
}> &
  FinancialItemHeaderProps &
  Pick<
    FCTStatusActionProps,
    'handleAppendDataCQAction' | 'viewPendingCQFn' | 'viewHistoryFn' | 'getNumPending'
  >

export default ({ acquisition, ...props }: Props) => {
  return (
    <FinanceItemWrapper
      {...props}
      item={{
        id: acquisition.acquisition_id || '',
        expandStatus: (acquisition.expandStatus || '') as EnumExpandStatus,
        selfDeclared: !!acquisition.selfDeclared,
        tableName: TableNames.ACQUISITIONS,
        source: acquisition.source || '',
      }}
      label={
        acquisition.company ? (
          <Flex sx={{ py: 3, flex: 1, alignItems: 'center' }}>
            <CompanyLink sx={{ flex: 1 }} company={acquisition.company} />
            {(acquisition.company.fct_status_id === +EnumExpandStatusId.DUPLICATED ||
              acquisition.company.category) && (
              <Pill
                sx={{ mr: 2 }}
                icon={
                  acquisition.company.fct_status_id === +EnumExpandStatusId.DUPLICATED
                    ? EnumExpandStatus.DUPLICATED
                    : acquisition.company.category
                }
                variant={
                  acquisition.company.fct_status_id === +EnumExpandStatusId.DUPLICATED
                    ? 'out'
                    : undefined
                }
              />
            )}
          </Flex>
        ) : (
          'Acquisition Round'
        )
      }
      unfollowItem={props.unfollowAcquisitionRound}
    >
      <ItemInfoContainer>
        <Box>
          <RoundInfo acquisition={acquisition} />
        </Box>
        <Box sx={{ width: '1px', height: '100%', bg: 'gray01', mx: 'auto' }} />
        <InvestorListView investors={acquisition.investors} />
      </ItemInfoContainer>
    </FinanceItemWrapper>
  )
}

const {
  pages: {
    addCompanyForm: { acquisitions: copy },
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

const ROUND_INFO_GRID = ['1fr 1fr 1fr']

const RoundInfo = ({ acquisition }: Pick<Props, 'acquisition'>) => (
  <Grid columns={ROUND_INFO_GRID}>
    {[
      { name: copy.fields.acquisition_date, value: acquisition?.acquisition_date },
      {
        name: copy.fields.source,
        value:
          EnumReverseCompanySource[acquisition?.source as keyof typeof EnumReverseCompanySource] ||
          acquisition?.source ||
          '',
      },
      {
        name: copy.fields.apiAppend,
        value:
          acquisition?.api_append === '0'
            ? 'False'
            : EnumReverseCompanySource[
                acquisition?.api_append as keyof typeof EnumReverseCompanySource
              ] ||
              acquisition?.api_append ||
              '',
      },
      {
        name: copy.fields.sourcePrice,
        value:
          acquisition?.sourcePrice && acquisition?.priceCurrency
            ? formatMoneyView(+acquisition.sourcePrice, acquisition.priceCurrency as string)
            : acquisition?.sourcePrice || '',
      },
      { name: copy.fields.priceCurrency, value: acquisition?.priceCurrency },
      { name: copy.fields.price, value: validateMoney(acquisition?.price) },
      { name: copy.fields.status, value: acquisition?.status },

      { name: copy.fields.comment, value: acquisition?.comment },
    ].map((item, index) => (
      <Box
        key={index}
        mb={4}
        sx={{
          ...(item.name === copy.fields.comment ? { gridColumnStart: 2, gridColumnEnd: 4 } : {}),
          wordBreak: 'break-word',
        }}
      >
        <Label mb={1}>{item.name}</Label>
        <Paragraph>{item.value || ''}</Paragraph>
      </Box>
    ))}
  </Grid>
)
