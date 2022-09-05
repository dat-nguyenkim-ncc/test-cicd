import React from 'react'
import { Box, Flex } from 'theme-ui'
import { motion } from 'framer-motion'
import { Palette } from '../../theme'
import { ViewInterface } from '../../types'

const Motion = motion.custom(Box)

export type SwitchProps = ViewInterface<{
  checked: boolean
  onToggle(): void
  disabled?: boolean
  hide?: boolean
}>

const Switch = ({ checked = false, disabled = false, onToggle, sx }: SwitchProps) => {
  return (
    <Flex
      sx={{
        minWidth: '53px',
        height: '26px',
        backgroundColor: checked ? Palette.primary : Palette.gray04,
        justifyContent: checked ? 'flex-end' : 'flex-start',
        borderRadius: '999px',
        cursor: 'pointer',
        p: '3px',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        ...sx,
      }}
      onClick={onToggle}
    >
      <Motion
        sx={{
          backgroundColor: Palette.white,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
        }}
        layout
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 30,
        }}
      />
    </Flex>
  )
}

export default Switch
