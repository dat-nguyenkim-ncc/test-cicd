import React from 'react'
import { Flex } from 'theme-ui'
import { Tooltip } from '..'
import { TagData, ViewInterface } from '../../types'
import { EnumDimensionType } from '../../types/enums'
import { TOOLTIP_SX } from '../../utils/consts'
import { Paragraph } from '../primitives'
import { Ellipsis, Check, Info } from './helpers'

export type TagProps = ViewInterface<{
  tag: TagData
  opened?: boolean
  checked?: boolean
  unselectable?: boolean
  onOpen?(tag: TagData): void
  onCheck?(tag: TagData): void
  isLastSelected?: boolean
}>

const Tag = ({
  tag,
  onCheck,
  onOpen,
  opened,
  checked,
  sx,
  unselectable,
  isLastSelected = false,
}: TagProps) => {
  const onClickEllipsis = () => {
    onOpen && onOpen(tag)
  }

  const onClickCheck = () => {
    onCheck && onCheck(tag)
  }

  const highlight = opened || isLastSelected

  return (
    <Flex
      sx={{
        borderColor: checked || highlight ? 'primary' : 'text',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '25px',
        alignItems: 'center',
        bg: highlight ? 'primary' : 'transparent',
        px: 3,
        py: 2,
        ...sx,
      }}
    >
      <Paragraph sx={{ mr: 3, color: highlight ? 'white' : checked ? 'primary' : 'text' }}>
        {tag.label}
      </Paragraph>
      <Flex>
        {tag.description && (
          <Tooltip
            id={`tag-${tag.id}`}
            content={tag.description}
            sx={TOOLTIP_SX}
            isShow
            containerSx={{ left: '-27px' }}
          >
            <Flex sx={{ alignItems: 'center', mr: 2 }}>
              <Info
                bg={highlight && !opened ? 'transparent' : highlight ? 'white' : 'transparent'}
                color={highlight && !opened ? 'white' : highlight || checked ? 'primary' : 'text'}
              />
            </Flex>
          </Tooltip>
        )}
        {tag.children && (
          <Flex
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
              mr: 2,
            }}
            onClick={onClickEllipsis}
          >
            <Ellipsis
              bg={highlight && !opened ? 'transparent' : highlight ? 'white' : 'transparent'}
              color={highlight && !opened ? 'white' : highlight || checked ? 'primary' : 'text'}
            />
          </Flex>
        )}
        {tag.endpoint && tag.dimensionType !== EnumDimensionType.SECTOR && (
          <Flex
            sx={{
              alignItems: 'center',
              cursor: unselectable ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => !unselectable && onClickCheck()}
          >
            {unselectable ? (
              <Check bg={'gray04'} color={'white'} stroke={'gray04'} />
            ) : (
              <Check
                bg={
                  highlight && checked ? 'white' : checked || highlight ? 'primary' : 'transparent'
                }
                color={highlight && checked ? 'primary' : checked || highlight ? 'white' : 'text'}
                stroke={!highlight && checked ? 'primary' : undefined}
              />
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export default Tag
