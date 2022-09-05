import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Tag, { TagProps } from './Tag'
import { TagMock } from '../../__mock__'

export default {
  title: 'Taxonomy/Tag',
  component: Tag,
} as Meta

const Template: Story<TagProps> = args => <Tag {...args} />

export const Default = Template.bind({})
Default.args = {
  tag: TagMock(1),
} as TagProps

export const DefaultWithSubs = Template.bind({})
DefaultWithSubs.args = {
  tag: TagMock(2),
} as TagProps

export const DefaultWithSubsEndpoint = Template.bind({})
DefaultWithSubsEndpoint.args = {
  tag: TagMock(2),
} as TagProps
