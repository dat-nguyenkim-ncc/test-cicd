import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Dropdown, { DropdownProps } from './Dropdown'
import { Section } from '../primitives'

export default {
  title: 'Form Elements/Dropdown',
  component: Dropdown,
} as Meta

const Template: Story<DropdownProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <Dropdown {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  name: 'test',
  label: 'Test Label',
  options: [
    { value: 'fintech', label: 'Fintech' },
    { value: 'regtech', label: 'Regtech' },
    { value: 'insuretech', label: 'Insuretech' },
    { value: 'all', label: 'All' },
  ],
} as DropdownProps
