import React, { useState } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TagsSection, { TagsSectionProps } from './TagsSection'
import { ListRandomTags } from '../../__mock__'
import { Section } from '../primitives'
import {
  CompanyTypeSector,
  StateOpenedTags,
  StateSelectedTags,
  TagContainerParent,
  TagData,
} from '../../types'
import { DimensionType, EnumCompanyTypeSector, EnumDimensionType } from '../../types/enums'

export default {
  title: 'Taxonomy/TagsSection',
  component: TagsSection,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const tags = ListRandomTags()
type Tabs = 'primary' | 'aux'

const Template: Story<TagsSectionProps> = args => {
  const [tabActive] = useState<Tabs>('primary')
  const [selectedTags, setSelectedTags] = useState<StateSelectedTags>()
  const [openedTags, setOpenedTags] = useState<StateOpenedTags>()
  const [selectedMap] = useState<Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>>(
    EnumCompanyTypeSector.FIN
  )

  const onSelectTags = (type: string, tags: TagData[]) => {
    setSelectedTags({ ...selectedTags, [tabActive]: { [type]: tags } })
    console.log(JSON.stringify(tags))
  }

  const onOpenTags = (type: string, dimension: DimensionType, parents: TagContainerParent) => {
    setOpenedTags({ ...openedTags, [tabActive]: { [type]: parents } })
  }

  return (
    <Section sx={{ m: 4 }}>
      <TagsSection
        dimension={EnumDimensionType.SECTOR}
        type={EnumCompanyTypeSector.FIN}
        tags={tags}
        onSelectTags={onSelectTags}
        onOpenTags={onOpenTags}
        selected={
          selectedTags && selectedTags[tabActive] && selectedTags[tabActive]![selectedMap]
            ? selectedTags[tabActive]![selectedMap]
            : []
        }
        openedTags={
          openedTags &&
          openedTags[tabActive] &&
          openedTags[tabActive]![selectedMap]![EnumDimensionType.SECTOR]
            ? openedTags[tabActive]![selectedMap]![EnumDimensionType.SECTOR]
            : { parent: [], tags: [] }
        }
        onClickUndo={() => {}}
      />
    </Section>
  )
}

export const Default = Template.bind({})
