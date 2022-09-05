import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { Icon } from '..'
import { Palette } from '../../theme'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

type ChipsProps = ViewInterface<{
  label: string
  onClose?(): void
  around?: boolean
  disabled?: boolean
  onClick?(): void
}>

const Chips = ({ label, onClose, around, disabled, sx, onClick = () => {} }: ChipsProps) => {
  return (
    <Flex
      sx={{
        mx: 1,
        my: '2px',
        py: 2,
        px: 3,
        border: `solid 1px ${Palette.gray01}`,
        borderRadius: around ? 24 : 4,
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
        textTransform: 'capitalize',
        ...sx,
      }}
      onClick={() => onClick()}
    >
      <Paragraph>{label}</Paragraph>
      {onClose && (
        <Box
          sx={{ ml: 2, cursor: 'pointer' }}
          onClick={e => {
            if (disabled) {
              return
            }
            e.stopPropagation()
            onClose()
          }}
        >
          <Icon icon="remove" size="tiny" color="white" iconSize={10} background="black50" />
        </Box>
      )}
    </Flex>
  )
}
export default Chips
