import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TagGroup, { TagGroupProps } from './TagGroup'
import { Section } from '../primitives'
import { TagGroupMock } from '../../__mock__'
import { TagGroupType, Tag } from '../../types'

const tagGroups = TagGroupMock()

export default {
  title: 'Taxonomy/TagGroup',
  component: TagGroup,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<TagGroupProps> = () => {
  const [tagGroupSelected, setTagGroup] = useState<TagGroupType>()
  const [tagGroupChildrenSelected, setTagGroupChildren] = useState<Tag[]>([])

  const onTagGroupChildSelect = (children: Tag[]) => {
    setTagGroupChildren(children)
  }

  const onTagGroupSelect = (tag: TagGroupType) => {
    setTagGroup(tag)
  }

  return (
    <Section sx={{ my: 5, mx: 'auto' }}>
      <TagGroup
        tagGroupSelected={tagGroupSelected}
        tagGroupChildrenSelected={tagGroupChildrenSelected}
        tagGroups={tagGroups}
        onTagGroupSelect={onTagGroupSelect}
        onTagGroupChildSelect={onTagGroupChildSelect}
      />
    </Section>
  )
}

export const Default = Template.bind({})
