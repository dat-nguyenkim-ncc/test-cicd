import React from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Checkbox, Icon } from '../../../components'
import { Paragraph } from '../../../components/primitives'

const BlockHeader = ({
  expanded,
  setExpanded,
  onCheck,
  checked,
  disabled,
  ...props
}: {
  expanded: boolean
  setExpanded(b: boolean): void
  label: string
  onCheck(): void
  checked: boolean
  disabled?: boolean
}) => {
  return (
    <Flex
      onClick={() => setExpanded(!expanded)}
      sx={{
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Box onClick={e => e.stopPropagation()}>
        <Checkbox
          sx={{ mr: 3 }}
          square
          checked={checked}
          onPress={e => {
            e.stopPropagation()
            onCheck()
          }}
          disabled={disabled}
        />
      </Box>
      <Paragraph sx={{ flex: 1 }} bold>
        {props.label}
      </Paragraph>
      <Icon
        sx={{ transform: expanded ? 'rotate(180deg) translateY(4px)' : 'translateY(4px)' }}
        icon="arrow"
        color="text"
        size="tiny"
      />
    </Flex>
  )
}

export default BlockHeader
