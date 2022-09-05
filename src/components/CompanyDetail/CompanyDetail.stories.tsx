import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetail, { CompanyDetailProps } from './CompanyDetail'
import { Box } from 'theme-ui'
import {
  companyFinancials,
  companyOverview,
  companyPeople,
  mappingSummary,
} from '../../__mock__'

export default {
  title: 'Company Details/CompanyDetail',
  component: CompanyDetail,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailProps> = args => (
  <Box sx={{ p: 7, backgroundColor: 'gray03', width: '100%' }}>
    <CompanyDetail {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  overview: companyOverview(),
  financials: companyFinancials(),
  business: companyPeople(),
  people: companyPeople(),
  mapping: mappingSummary,
} as CompanyDetailProps
