import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Radio, { RadioProps } from './Radio'
import { Section } from '../primitives'

export default {
  title: 'Form Elements/Radio',
  component: Radio,
} as Meta

const Template: Story<RadioProps> = args => (
  <Section>
    <Radio {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  label: 'Radio',
} as RadioProps
