import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { CompanyDetailIposProps } from './CompanyDetailIpos'
import { companyIpos } from '../../../../__mock__'
import { Section } from '../../../primitives'
import CompanyDetailIpos from './CompanyDetailIpos'

export default {
  title: 'Company Details/CompanyDetailIpos',
  component: CompanyDetailIpos,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailIposProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailIpos {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: { ipoRounds: companyIpos(), isExternalViewDetail: true },
} as CompanyDetailIposProps
