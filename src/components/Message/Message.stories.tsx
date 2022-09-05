import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Message, { MessageProps } from './Message'

export default {
  title: 'Primitives/Message',
  component: Message,
} as Meta

const Template: Story<MessageProps> = args => <Message {...args} />

export const Default = Template.bind({})
Default.args = {
  variant: 'check',
  body: 'The APIX results are currently unavailable at this time',
} as MessageProps
