import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { companyPeople } from '../../../../__mock__'
import { Section } from '../../../primitives'
import { CompanyDetailPeopleProps } from '../CompanyDetailPeople/CompanyDetailPeople'
import CompanyDetailAcquirees from './CompanyDetailAcquirees'

export default {
  title: 'Company Details/CompanyDetailAcquirees',
  component: CompanyDetailAcquirees,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailPeopleProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailAcquirees {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: companyPeople(),
} as CompanyDetailPeopleProps
