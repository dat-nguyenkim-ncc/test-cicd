import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailInline, { CompanyDetailInlineProps } from './CompanyDetailInline'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailInline',
  component: CompanyDetailInline,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailInlineProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailInline {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  title: '',
  detail: '',
} as CompanyDetailInlineProps
