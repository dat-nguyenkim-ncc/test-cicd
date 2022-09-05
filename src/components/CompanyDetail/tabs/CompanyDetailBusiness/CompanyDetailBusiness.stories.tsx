import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailBusiness, { CompanyDetailBusinessProps } from './CompanyDetailBusiness'
import { companyPeople } from '../../../../__mock__'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailBusiness',
  component: CompanyDetailBusiness,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailBusinessProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailBusiness {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyPeople(),
} as CompanyDetailBusinessProps
