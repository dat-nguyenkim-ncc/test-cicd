import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import RadioGroup, { RadioGroupProps } from './RadioGroup'
import { Section } from '../primitives'

export default {
  title: 'Form Elements/RadioGroup',
  component: RadioGroup,
} as Meta

const Template: Story<RadioGroupProps> = args => (
  <Section>
    <RadioGroup {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  label: 'FinTech Type',
  name: 'fintech_type',
  options: [
    { label: 'Enabler', value: 'enabled' },
    { label: 'Disruptor', value: 'disruptor' },
  ],
} as RadioGroupProps
