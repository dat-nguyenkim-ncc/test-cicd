import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailFinancials, { CompanyDetailFinancialsProps } from './CompanyDetailFinancials'
import { companyFinancials } from '../../../../__mock__'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailFinancials',
  component: CompanyDetailFinancials,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailFinancialsProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailFinancials {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyFinancials(),
} as CompanyDetailFinancialsProps
