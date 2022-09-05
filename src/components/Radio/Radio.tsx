import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Palette } from '../../theme'
import { MapVariantToSize, Size, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

export type RadioProps = ViewInterface<{
  selected?: boolean
  label: string
  value?: string
  size?: Size
  disabled?: boolean
  onClick?(value: string): void
}>

const sizes: MapVariantToSize = {
  big: 80,
  small: 24,
  tiny: 16,
  normal: 40,
}

const Radio = ({ selected, value, label, sx, size, disabled, onClick }: RadioProps) => {
  const onClickRadio = () => {
    onClick && onClick(value || '')
  }

  return (
    <Flex
      sx={{
        alignItems: 'center',
        cursor: disabled ? undefined : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...sx,
      }}
      onClick={() => {
        !disabled && onClickRadio()
      }}
    >
      <Box
        sx={{
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: selected ? 'primary' : 'gray04',
          width: size ? sizes[size] : sizes.small,
          height: size ? sizes[size] : sizes.small,
          minWidth: size ? sizes[size] : sizes.small,
          borderRadius: '100%',
        }}
      >
        {selected && (
          <Flex
            sx={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: size ? +sizes[size] * 0.6 : +sizes.small * 0.6,
                height: size ? +sizes[size] * 0.6 : +sizes.small * 0.6,
                borderRadius: '100%',
                background: Palette.primary,
              }}
            />
          </Flex>
        )}
      </Box>
      <Paragraph sx={{ ml: 2 }}>{label}</Paragraph>
    </Flex>
  )
}

export default Radio
