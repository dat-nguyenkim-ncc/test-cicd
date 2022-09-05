import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailOverview, { CompanyDetailOverviewProps } from './CompanyDetailOverview'
import { companyOverview } from '../../../../__mock__'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailOverview',
  component: CompanyDetailOverview,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailOverviewProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailOverview {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyOverview(),
} as CompanyDetailOverviewProps
