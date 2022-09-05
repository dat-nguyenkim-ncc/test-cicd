import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TextField, { TextFieldProps } from './TextField'
import { variant } from '../../../.storybook/argTypes'
import { Section } from '../primitives'

export default {
  title: 'Form Elements/TextField',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant,
  },
} as Meta

const Template: Story<TextFieldProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <TextField {...args} />
  </Section>
)

export const Input = Template.bind({})
Input.args = {
  label: 'Input example',
  name: 'fieldName',
  onChange: e => {
    if (Input.args) Input.args.value = e.currentTarget.value
  },
  placeholder: 'Placeholder',
} as TextFieldProps

export const Textarea = Template.bind({})
Textarea.args = {
  label: 'Textarea example',
  name: 'fieldName',
  onChange: e => {
    if (Textarea.args) Textarea.args.value = e.currentTarget.value
  },
  placeholder: 'Placeholder',
  type: 'textarea',
} as TextFieldProps
