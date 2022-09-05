import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Updating, { UpdatingProps } from './Updating'

export default {
  title: 'Primitives/Updating',
  component: Updating,
} as Meta

const Template: Story<UpdatingProps> = args => <Updating {...args} />

export const Default = Template.bind({})
Default.args = {} as UpdatingProps
