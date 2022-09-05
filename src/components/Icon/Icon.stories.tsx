import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Icon, { IconProps } from './Icon'
import Path from './Paths'

export default {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: {
    icon: {
      control: {
        type: 'inline-radio',
        values: Object.keys(Path),
      },
    },
  },
} as Meta

const Template: Story<IconProps> = args => <Icon {...args} />

export const Default = Template.bind({})
Default.args = {
  icon: 'download',
} as IconProps
