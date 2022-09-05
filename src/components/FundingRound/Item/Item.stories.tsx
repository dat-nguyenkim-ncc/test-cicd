import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import Item, { Props } from './Item'
import { action } from '@storybook/addon-actions'
export default {
  title: 'FundingRound/FundingRoundItem',
  component: Item,
} as Meta

const Template: Story<Props> = args => {
  return (
    <Item
      buttons={[
        {
          label: 'Edit',
          action: action('Edit'),
          type: 'secondary',
        },
      ]}
      pendingCR={[]}
      funding={funding}
      unfollowFundingRound={action('unfollowFundingRound')}
      viewHistory={action('viewHistory')}
      viewHistoryFn={() => undefined}
      viewPendingCQFn={() => undefined}
      handleAppendDataCQAction={action('handleAppendDataCQAction')}
      getNumPending={iden => 0}
    />
  )
}

export const Default = Template.bind({})

const funding = {
  expandStatus: 'Following',
  id: '',
  round: {
    roundType1: 'Equity Financing',
    roundType2: 'Unattributed VC',
    investment: '0',
    date: '01/01/2019',
    source: 'dealroom',
    valuation: '',
    comment:
      'Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet Lorem ipsum dolot siamet ',
    apiAppend: 1,
  },
  investors: [
    {
      investor_id: '404',
      external_investor_id: '1241048',
      expand_status_id: '1',
      investor_name: 'ILabs Capital',
      investor_type: 'fund',
      source: 'dealroom',
      isEdit: true,
      isLead: false,
    },
    {
      investor_id: '404',
      external_investor_id: '1241048',
      expand_status_id: '1',
      investor_name: 'ILabs Capital',
      investor_type: 'fund',
      source: 'dealroom',
      isEdit: true,
      isLead: true,
    },
  ],
}
