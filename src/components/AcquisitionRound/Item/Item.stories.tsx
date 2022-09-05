import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import Item, { Props } from './Item'
import { action } from '@storybook/addon-actions'
import { AcquisitionForm } from '../AcquisitionRound'
export default {
  title: 'AcquisitionRound/AcquisitionRoundItem',
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
      acquisition={acquisition}
      unfollowAcquisitionRound={action('unfollowFundingRound')}
      viewHistory={action('View history')}
      viewHistoryFn={() => undefined}
      viewPendingCQFn={() => undefined}
      handleAppendDataCQAction={action('handleAppendDataCQAction')}
      getNumPending={iden => 0}
    />
  )
}

export const Default = Template.bind({})

const acquisition = {
  acquisition_id: 'd3821d57-c5cd-4767-831d-7005942ad710',
  acquisition_date: '2010-04-01T00:00:00.000Z',
  price: '5870000',
  status: 'complete',
  source: 'crunchbase',
  comment: '',
  expandStatus: 'Following',
  currency: '',
  value_usd: '',
  investors: [
    {
      investor_id: '972244',
      external_investor_id: 'bcg_972244',
      expand_status_id: '1',
      investor_name: 'AirAngels',
      investor_type: '',
      source: 'bcg',
    },
    {
      investor_id: '973989',
      external_investor_id: '868d0c54-1f18-d5bc-d48f-6b7b09f71cf1',
      expand_status_id: '1',
      investor_name: 'Alclear LLC',
      investor_type: '',
      source: 'crunchbase',
    },
  ],
} as AcquisitionForm
