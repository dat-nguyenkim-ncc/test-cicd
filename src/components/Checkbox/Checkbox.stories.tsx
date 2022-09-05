import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Checkbox, { CheckboxProps } from './Checkbox'
import { Section } from '../primitives'

export default {
  title: 'Form Elements/Checkbox',
  component: Checkbox,
} as Meta

const Template: Story<CheckboxProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <Checkbox {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {} as CheckboxProps
