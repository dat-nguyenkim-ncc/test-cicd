import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Icon, Tag } from '..'
import { TagData, ViewInterface } from '../../types'
import { EnumDimensionType } from '../../types/enums'
import { Paragraph } from '../primitives'

export type TagContainerProps = ViewInterface<{
  tags: TagData[]
  title: string
  selected: TagData[]
  openedTags: TagData[]
  unselectable?: TagData[]
  onSelect(tag: TagData): void
  onOpen(tag: TagData): void
}>

const TagContainer = ({
  onSelect,
  onOpen,
  title,
  tags,
  openedTags,
  selected,
  sx,
  unselectable = [],
}: TagContainerProps) => {
  const [opened, setOpened] = useState(true)

  const onCheckTag = (tag: TagData) => {
    if (
      unselectable.filter(
        ut =>
          ut.id === tag.id &&
          ut.parent?.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id ===
            tag.parent?.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id
      ).length > 0
    )
      return
    onSelect(tag)
  }
  const onOpenTag = (tag: TagData) => {
    onOpen(tag)
  }

  return (
    <Box
      sx={{
        width: '100%',
        border: '1px solid black',
        p: 4,
        pb: opened ? 3 : 4,
        borderRadius: '10px',
        ...sx,
      }}
    >
      <Flex sx={{ cursor: 'pointer' }} onClick={() => setOpened(!opened)}>
        <Paragraph sx={{ flex: 1 }} bold>
          {title.toUpperCase()}
        </Paragraph>
        <Icon size="tiny" icon={opened ? 'indicatorUp' : 'indicatorDown'} />
      </Flex>

      {opened && (
        <Flex sx={{ mt: 3, flexWrap: 'wrap' }}>
          {tags.map((tag, index) => (
            <Tag
              opened={openedTags.some(t => t.id === tag.id)}
              onCheck={onCheckTag}
              checked={selected.some(
                t =>
                  t.id === tag.id &&
                  t.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id ===
                    tag.parent.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id
              )}
              onOpen={onOpenTag}
              tag={tag}
              sx={{ mr: 3, mb: 3 }}
              key={index}
              unselectable={unselectable.some(
                ut =>
                  ut.id === tag.id &&
                  ut.parent?.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id ===
                    tag.parent?.find(item => item.dimensionType === EnumDimensionType.SECTOR)?.id
              )}
              isLastSelected={selected[selected.length - 1]?.id === tag.id}
            />
          ))}
        </Flex>
      )}
    </Box>
  )
}

export default TagContainer
