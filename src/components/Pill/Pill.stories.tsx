import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Pill, { PillProps } from './Pill'

export default {
  title: 'Primitives/Pill',
  component: Pill,
} as Meta

const Template: Story<PillProps> = args => <Pill {...args} />

export const Default = Template.bind({})
Default.args = {
  variant: 'primary',
} as PillProps
