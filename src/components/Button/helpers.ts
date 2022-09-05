import { SxStyleProp } from 'theme-ui'
import { MapVariantToColor, MapVariantToSize, Size } from '../../types'

export const iconStyle = (size: Size): SxStyleProp => {
  const sizes: MapVariantToSize = {
    big: 80,
    small: 24,
    tiny: 24,
    normal: 40,
  }
  return {
    paddingX: 0,
    paddingY: 0,
    width: sizes[size],
    height: sizes[size],
    borderRadius: '100%',
  }
}

export const sizeStyle = (size: Size): SxStyleProp => {
  const sizes: MapVariantToSize = {
    big: {
      paddingY: 5,
      paddingX: 6,
    },
    small: {
      paddingX: 4,
      paddingY: 3,
    },
    tiny: {
      paddingX: 4,
      paddingY: 3,
    },
    normal: {
      paddingX: 4,
      paddingY: 3,
    },
  }

  return sizes[size] as SxStyleProp
}

export const IconColorsMap: MapVariantToColor = {
  primary: 'white',
  secondary: 'text',
  black: 'white',
  muted: 'white',
  outline: 'text',
  outlineWhite: 'white',
  error: 'red',
  invert: 'text',
}
