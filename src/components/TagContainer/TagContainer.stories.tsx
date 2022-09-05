import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TagContainer, { TagContainerProps } from './TagContainer'
import { Section } from '../primitives'
import { ListRandomTags } from '../../__mock__'
import { TagData } from '../../types'

export default {
  title: 'Taxonomy/TagContainer',
  component: TagContainer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<TagContainerProps> = args => (
  <Section>
    <TagContainer {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  title: 'SECTOR',
  tags: ListRandomTags(),
  selected: [] as TagData[],
  openedTags: [] as TagData[],
  unselectable: [] as TagData[],
} as TagContainerProps
