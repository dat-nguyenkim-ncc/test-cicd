import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Button, { ButtonProps } from './Button'
import { variant } from '../../../.storybook/argTypes'

export default {
  title: 'Buttons/Button',
  component: Button,
  argTypes: {
    onPress: { action: 'clicked' },
    size: {
      control: {
        type: 'inline-radio',
        values: ['normal', 'big', 'small'],
      },
    },
    variant,
  },
} as Meta

const Template: Story<ButtonProps> = args => <Button {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Button Label',
} as ButtonProps

export const Secondary = Template.bind({})
Secondary.args = {
  ...Primary.args,
  variant: 'secondary',
} as ButtonProps

export const Outline = Template.bind({})
Outline.args = {
  ...Primary.args,
  variant: 'outline',
} as ButtonProps

export const Icon = Template.bind({})
Icon.args = {
  icon: 'download',
  variant: 'primary',
} as ButtonProps

export const LabelIcon = Template.bind({})
LabelIcon.args = {
  icon: 'download',
  label: 'Button Label',
  variant: 'primary',
} as ButtonProps
