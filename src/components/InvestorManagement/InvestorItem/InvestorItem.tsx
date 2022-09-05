import { Grid, Text } from '@theme-ui/components'
import React from 'react'
import { Checkbox } from '../..'
import { EnumCompanySource, EnumExpandStatusId, EnumInvestorSource } from '../../../types/enums'
import { Investor } from '../../InvestorForm'
import { Paragraph } from '../../primitives'

type InvestorItemProps = {
  disabled?: boolean
  showSource?: boolean
  investor: Investor
  checked?: boolean
  onRemove(): void
  onCheck?(): void
  showCorrespondingCompanyDetail?: boolean
  selectedToRemove?: boolean
}

export const INVESTOR_GRIDS = ['1fr 1fr 0.2fr 0.2fr']

export const INVESTOR_GRID_FOR_CORRESPONDING_DATA = ['1.5fr 1fr 1fr 1fr 0.2fr 0.2fr']

const IS_DUPLICATED: Record<EnumExpandStatusId, string> = {
  [EnumExpandStatusId.FOLLOWING]: 'No',
  [EnumExpandStatusId.UNFOLLOWED]: '',
  [EnumExpandStatusId.CHANGE_REQUEST]: '',
  [EnumExpandStatusId.TO_BE_EVALUATED]: '',
  [EnumExpandStatusId.DUPLICATED]: 'Yes',
}

const InvestorItem = ({
  disabled,
  showSource,
  investor,
  checked,
  onRemove,
  onCheck,
  showCorrespondingCompanyDetail = false,
  selectedToRemove = false,
}: InvestorItemProps) => {
  const canRemove = investor.source !== EnumCompanySource.BCG

  return (
    <>
      <Grid
        columns={
          showCorrespondingCompanyDetail ? INVESTOR_GRID_FOR_CORRESPONDING_DATA : INVESTOR_GRIDS
        }
        sx={{
          alignItems: 'center',
          py: 1,
          height: 32,
        }}
      >
        <Text sx={{ overflowWrap: 'break-word', fontSize: 14 }}>
          {investor.investor_name || ''}
        </Text>
        <Paragraph>
          {showSource
            ? investor.source
              ? EnumInvestorSource[investor.source as keyof typeof EnumInvestorSource]
              : ''
            : investor.investor_type || ''}
        </Paragraph>
        {showCorrespondingCompanyDetail && (
          <>
            <Paragraph>{investor.merged_company_id || ''}</Paragraph>
            <Paragraph>
              {investor.component_company_status
                ? IS_DUPLICATED[investor.component_company_status]
                : ''}
            </Paragraph>
          </>
        )}
        {onCheck && <Checkbox disabled={disabled} onPress={onCheck} checked={checked} />}
        {canRemove && !disabled && (
          <Checkbox disabled={disabled} onPress={onRemove} checked={selectedToRemove} square />
        )}
      </Grid>
    </>
  )
}
export default InvestorItem
