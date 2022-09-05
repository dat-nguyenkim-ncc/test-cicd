import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import Item, { Props } from './Item'
import { IpoForm } from '../IpoRound'
export default {
  title: 'IpoRound/IpoRoundItem',
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
      ipo={ipo}
      pendingCR={[]}
      unfollowIpoRound={action('unfollowFundingRound')}
      viewHistory={action('viewHistory')}
      viewHistoryFn={() => undefined}
      viewPendingCQFn={() => undefined}
      handleAppendDataCQAction={action('handleAppendDataCQAction')}
      getNumPending={iden => 0}
    />
  )
}

export const Default = Template.bind({})

const ipo = {
  ipo_id: 'd3821d57-c5cd-4767-831d-7005942ad710',
  went_public_on: '2010-04-01T00:00:00.000Z',
  amount: '5870000',
  status: 'complete',
  source: 'crunchbase',
  expandStatus: 'Following',
  share_price: '',
  shares_outstanding: '',
  shares_sold: '',
  stock_exchange: '',
  stock_symbol: '',
  valuation: '',
} as IpoForm
