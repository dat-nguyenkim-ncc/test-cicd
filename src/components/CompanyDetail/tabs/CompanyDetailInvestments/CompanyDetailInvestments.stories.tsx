import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { companyPeople } from '../../../../__mock__'
import { Section } from '../../../primitives'
import { CompanyDetailPeopleProps } from '../CompanyDetailPeople/CompanyDetailPeople'
import CompanyDetailInvestments from '.'

export default {
  title: 'Company Details/CompanyDetailInvestments',
  component: CompanyDetailInvestments,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailPeopleProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailInvestments {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyPeople(),
} as CompanyDetailPeopleProps
