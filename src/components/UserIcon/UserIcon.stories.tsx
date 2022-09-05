import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import UserIcon, { UserIconProps } from './UserIcon'

export default {
  title: 'Primitives/UserIcon',
  component: UserIcon,
} as Meta

const Template: Story<UserIconProps> = args => <UserIcon {...args} />

export const Default = Template.bind({})
Default.args = {} as UserIconProps
