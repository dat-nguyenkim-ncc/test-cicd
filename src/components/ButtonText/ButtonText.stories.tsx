import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import ButtonText, { ButtonTextProps } from './ButtonText'

export default {
  title: 'Buttons/ButtonText',
  component: ButtonText,
} as Meta

const Template: Story<ButtonTextProps> = args => <ButtonText {...args} />

export const Default = Template.bind({})
Default.args = {} as ButtonTextProps
