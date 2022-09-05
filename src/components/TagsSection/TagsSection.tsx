import React from 'react'
import { Box } from 'theme-ui'
import strings from '../../strings'
import { CompanyTypeSector, TagContainerParent, TagData, ViewInterface } from '../../types'
import { DimensionType, EnumDimensionType } from '../../types/enums'
import ButtonText from '../ButtonText'
import TagContainer from '../TagContainer'

export type TagsSectionProps = ViewInterface<{
  tags: TagData[]
  dimension: DimensionType
  type: Exclude<CompanyTypeSector, 'OUT'>
  selected?: TagData[]
  openedTags?: TagContainerParent
  onOpenTags(
    type: Exclude<CompanyTypeSector, 'OUT'>,
    dimension: DimensionType,
    parents: TagContainerParent
  ): void
  onSelectTags(type: Exclude<CompanyTypeSector, 'OUT'>, tags: TagData[]): void
  onClickUndo(type: Exclude<CompanyTypeSector, 'OUT'>, dimension: DimensionType): void
  unselectable?: TagData[]
  showUndo?: boolean
}>

export type TaxonomyHistory = ViewInterface<{
  selectedTags?: TagData[]
  openedTags?: TagContainerParent
}>

const TagsSection = ({
  sx,
  selected = [],
  openedTags = { tags: [], parent: [] },
  tags,
  dimension,
  type,
  onSelectTags,
  onOpenTags,
  onClickUndo,
  unselectable = [],
  showUndo = true,
}: TagsSectionProps) => {
  const onSelectTag = (tag: TagData) => {
    const newSelected =
      selected.filter(
        s =>
          s.id === tag.id &&
          s.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id ===
            tag.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id
      ).length > 0
        ? selected.filter(
            s =>
              !(
                s.id === tag.id &&
                s.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id ===
                  tag.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id
              )
          )
        : [...selected, { ...tag, link_id: `${Date.now()}` }]
    onSelectTags(type, newSelected)
  }

  const onOpenTag = (tag: TagData) => {
    let newTags = [...openedTags.tags]
    let newParent = [...openedTags.parent]

    // first level
    if (tags.map(t => t.id).includes(tag.id)) {
      newTags = []
      newParent = []
    }

    // second level
    const index = newParent
      .map(a => a?.id || undefined)
      .indexOf(tag.parent[tag.parent.length - 1]?.id)
    if (index > -1) {
      newTags.splice(index, newTags.length - index)
      newParent.splice(index, newParent.length - index)
    }

    newParent.push(tag.parent[tag.parent.length - 1])
    newTags = newTags.map(t => t.id).includes(tag.id)
      ? newTags.filter(t => t.id !== tag.id)
      : [...newTags, tag]

    onOpenTags(type, dimension, { parent: newParent, tags: newTags })
  }

  return (
    <Box sx={sx}>
      <TagContainer
        onSelect={onSelectTag}
        onOpen={onOpenTag}
        selected={selected}
        openedTags={openedTags?.tags || []}
        title={dimension}
        tags={tags}
        unselectable={unselectable}
      />
      {openedTags && openedTags.tags?.length > 0 && (
        <>
          {openedTags.tags.map((t, index) => (
            <TagContainer
              sx={{ mt: 4 }}
              key={index}
              onSelect={onSelectTag}
              onOpen={onOpenTag}
              selected={selected}
              openedTags={openedTags.tags || []}
              title={t.label}
              tags={t.children!}
              unselectable={unselectable}
            />
          ))}
        </>
      )}
      {showUndo && (
        <ButtonText
          onPress={() => {
            onClickUndo(type, dimension)
          }}
          label={strings.common.undoButton}
          sx={{ mt: 4 }}
        />
      )}
    </Box>
  )
}

export default TagsSection
