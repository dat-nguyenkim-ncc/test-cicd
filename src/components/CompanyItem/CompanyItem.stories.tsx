import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyItem, { CompanyItemProps } from './CompanyItem'
import { companyDetails } from '../../__mock__'
import { Box } from 'theme-ui'
import { BrowserRouter } from 'react-router-dom'

export default {
  title: 'Search/CompanyItem',
  component: CompanyItem,
} as Meta

const Template: Story<CompanyItemProps> = args => (
  <Box sx={{ p: 6, backgroundColor: 'white' }}>
    <BrowserRouter>
      <CompanyItem {...args} />
    </BrowserRouter>
  </Box>
)

export const Listing = Template.bind({})
Listing.args = {
  companyDetails: companyDetails(),
  source: { label: 'Source: XPTO' },
  type: 'internal',
  onCheck: () => {
    Listing.args!.checked = !!!Listing.args!.checked
  },
} as CompanyItemProps

export const ChangeSource = Template.bind({})
ChangeSource.args = {
  companyDetails: companyDetails(),
  type: 'external',
  source: { label: 'Source: XPTO' },
} as CompanyItemProps
