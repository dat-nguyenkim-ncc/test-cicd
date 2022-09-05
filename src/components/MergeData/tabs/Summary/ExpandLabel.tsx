import React from 'react'
import { Paragraph } from '../../../primitives'
import { Flex } from 'theme-ui'
import { Icon } from '../../..'
import { ViewInterface } from '../../../../types'

type ExpandLabelProps = ViewInterface<{
  label: string
  isExpand: boolean
  onClick(): void
}>

const ExpandLabel = ({ sx, label, isExpand, onClick }: ExpandLabelProps) => {
  return (
    <Flex sx={{ cursor: 'pointer', justifyContent: 'space-between' }} onClick={onClick}>
      <Paragraph sx={{ fontSize: '20px', ...sx }} bold>
        {label}
      </Paragraph>
      <Icon icon={isExpand ? 'minus' : 'plus'} color="darkGray" />
    </Flex>
  )
}

export default ExpandLabel
