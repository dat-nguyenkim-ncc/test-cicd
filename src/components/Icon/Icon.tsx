import React from 'react'
import { Flex } from 'theme-ui'
import { MapVariantToSize, Size, ViewInterface } from '../../types'
import { PaletteKeys } from '../../theme'
import Path, { Paths } from './Paths'

const sizes: MapVariantToSize = {
  big: 80,
  small: 24,
  tiny: 16,
  normal: 40,
}

export type IconProps = {
  color?: PaletteKeys
  icon: Paths | null
  background?: PaletteKeys
  isSquare?: boolean
  size?: Size
  iconSize?: number
}

type Props = ViewInterface<IconProps>

const Icon = ({ background, icon, sx, color = 'text', isSquare, size, iconSize }: Props) => {
  const IconPath = icon ? Path[icon] : null

  return (
    <Flex
      as="span"
      sx={{
        backgroundColor: background || 'transparent',
        borderRadius: !isSquare ? '100%' : 'inherit',
        width: background && size ? sizes[size] : 'auto',
        height: background && size ? sizes[size] : 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
    >
      {IconPath && (
        <svg width={iconSize || 16} height={iconSize || 16} viewBox="0 0 16 16" fill="none">
          <IconPath color={color} />
        </svg>
      )}
    </Flex>
  )
}

export default Icon
