import { Flex } from '@theme-ui/components'
import React from 'react'
import { Icon, TextField } from '../..'
import { Paragraph } from '../../primitives'
import { FundingAmountType } from './helpers'

type FundingAmountProps = {
  title?: string
  state: FundingAmountType
  onChange(state: FundingAmountType): void
}
const FundingAmount = ({ title, state, onChange }: FundingAmountProps) => {
  return (
    <>
      <Paragraph sx={{ pt: 4, pb: 3 }} bold>
        {title || 'Funding Amount'}
      </Paragraph>

      <Flex>
        <TextField
          name="from"
          placeholder="From"
          value={state?.from}
          onChange={e => {
            onChange({ ...state, from: e.target.value })
          }}
        />
        <Icon sx={{ px: 3 }} icon="minus" />
        <TextField
          name="to"
          placeholder="To"
          value={state?.to}
          onChange={e => {
            onChange({ ...state, to: e.target.value })
          }}
        />
      </Flex>
    </>
  )
}

export default FundingAmount
