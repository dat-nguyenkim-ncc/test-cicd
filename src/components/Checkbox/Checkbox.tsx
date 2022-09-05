import React, { MouseEvent } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { MapVariantToSize, Size, ViewInterface } from '../../types'
import { Icon } from '../'
// import { Paragraph } from '../primitives'
import { Palette } from '../../theme'

const sizes: MapVariantToSize = {
  big: 80,
  small: 24,
  tiny: 16,
  normal: 40,
}

export type CheckboxProps = ViewInterface<{
  checked?: boolean
  onPress?(e: MouseEvent): void
  label?: string
  square?: boolean
  disabled?: boolean
  size?: Size
  gap?: number
  prefix?: React.ReactElement
}>

const Checkbox = ({
  checked,
  onPress,
  label,
  square = false,
  disabled = false,
  sx,
  size,
  gap,
  prefix,
}: CheckboxProps) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        cursor: onPress ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'unset',
        ...sx,
      }}
      onClick={(e: MouseEvent<any>) => {
        if (!disabled) onPress && onPress(e)
      }}
    >
      <Box
        sx={{
          borderWidth: checked ? 0 : '1px',
          borderStyle: 'solid',
          borderColor: 'gray04',
          width: size ? sizes[size] : square ? sizes.tiny : sizes.small,
          height: size ? sizes[size] : square ? sizes.tiny : sizes.small,
          borderRadius: square ? '3px' : '100%',
          background: Palette.white,
        }}
        className={checked ? 'checkbox checked' : 'checkbox'}
      >
        <Icon
          icon={'tick'}
          background={'primary'}
          color="white"
          size={size || (square ? 'tiny' : 'small')}
          iconSize={size === 'tiny' ? 10 : undefined}
          sx={{
            borderRadius: square ? '3px' : '100%',
            opacity: checked ? 1 : 0,
          }}
        />
      </Box>
      {prefix}
      {label && (
        <Text
          as="p"
          sx={{
            pl: gap || (square ? 3 : 4),
            maxWidth: `calc(100% - ${square ? sizes.tiny : sizes.small}px)`,
            fontWeight: !square && checked ? 'bold' : 'body',
          }}
          variant="body"
        >
          {label}
        </Text>
      )}
    </Flex>
  )
}

export default Checkbox
