import React from 'react'
import { Flex } from '@theme-ui/components'
import { Paragraph } from '../../../components/primitives'
import { Icon } from '../../../components'
import { ViewInterface } from '../../../types'
import { Paths } from '../../../components/Icon'

type CollapseHeaderType = ViewInterface<{
  expanded: boolean
  setExpanded(b: boolean): void
  label: string
  shrink?: Paths
  expand?: Paths
  bold?: boolean
}>
const CollapseHeader = ({
  sx,
  expanded,
  setExpanded,
  label,
  shrink = 'plus',
  expand = 'minus',
  bold = true,
}: CollapseHeaderType) => {
  return (
    <Flex
      sx={{ cursor: 'pointer', justifyContent: 'space-between', ...sx }}
      onClick={() => {
        setExpanded(!expanded)
      }}
    >
      <Paragraph bold={bold}>{label || ''}</Paragraph>
      <Icon icon={expanded ? expand : shrink} color="darkGray" />
    </Flex>
  )
}

export default CollapseHeader
