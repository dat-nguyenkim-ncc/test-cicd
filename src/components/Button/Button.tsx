import React, { MouseEvent, useState } from 'react'
import { Button as B, SxStyleProp } from 'theme-ui'
import Icon, { IconProps, Paths } from '../Icon'
import { IconColorsMap, iconStyle, sizeStyle } from './helpers'
import { Size, Variants, ViewInterface } from '../../types'
import { PaletteKeys } from '../../theme'
import { Paragraph } from '../primitives'

export type ButtonProps = ViewInterface<{
  variant?: Variants
  size?: Size
  onPress?(e?: MouseEvent): void
  label?: string
  icon?: Paths | React.ReactElement
  disabled?: boolean
  color?: PaletteKeys
  active?: boolean
  iconLeft?: boolean
  iconSx?: SxStyleProp
  iconProps?: IconProps
  bold?: boolean
}>

const Button = ({
  size = 'normal',
  variant = 'primary',
  onPress,
  label,
  disabled = false,
  active = true,
  icon,
  color,
  sx,
  iconLeft,
  iconSx,
  iconProps,
  bold = false,
}: ButtonProps) => {
  const [disabledState, setDisabledState] = useState(false)

  return (
    <B
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        ...sizeStyle(size),
        ...(!label && icon ? iconStyle(size) : null),
        pointerEvents: disabledState || disabled || !active ? 'none' : 'visible',
        opacity: disabledState || disabled ? 0.5 : 1,
        ...sx,
      }}
      onClick={async (e: MouseEvent) => {
        if (disabledState) return
        setDisabledState(true)
        try {
          onPress && (await onPress(e))
        } finally {
          setDisabledState(false)
        }
      }}
      variant={variant}
    >
      {!iconLeft && <Paragraph bold={bold}>{label || ''}</Paragraph>}
      {icon && typeof icon === 'string' ? (
        <Icon
          icon={icon}
          sx={{
            marginLeft: !iconLeft && label !== undefined ? 3 : 0,
            mr: iconLeft && label !== undefined ? 3 : 0,
            ...iconSx,
          }}
          color={color || IconColorsMap[variant]}
          {...iconProps}
        />
      ) : (
        icon
      )}
      {iconLeft && <Paragraph bold={bold}>{label || ''}</Paragraph>}
    </B>
  )
}

export default Button
