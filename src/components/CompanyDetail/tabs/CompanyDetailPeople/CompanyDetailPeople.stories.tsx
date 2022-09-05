import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailPeople, { CompanyDetailPeopleProps } from './CompanyDetailPeople'
import { companyPeople } from '../../../../__mock__'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailPeople',
  component: CompanyDetailPeople,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailPeopleProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailPeople {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyPeople(),
} as CompanyDetailPeopleProps
