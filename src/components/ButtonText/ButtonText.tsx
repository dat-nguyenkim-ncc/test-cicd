import React from 'react'
import { Flex, NavLink, SxStyleProp } from 'theme-ui'
import { Paragraph } from '../primitives'
import strings from '../../strings'
import { Variants, ViewInterface } from '../../types'
import Icon, { IconProps, Paths } from '../Icon'
import { PaletteKeys } from '../../theme'
import { IconColorsMap } from '../Button/helpers'

export type ButtonTextProps = ViewInterface<{
  onPress?(event: any): void
  label?: string
  styleText?: any
  icon?: Paths | React.ReactElement
  iconSx?: SxStyleProp
  iconProps?: IconProps
  color?: PaletteKeys
  variant?: Variants
}>

const ButtonText = ({
  onPress,
  sx,
  styleText,
  label = strings.common.backButton,
  icon,
  iconSx,
  iconProps,
  color,
  variant = 'primary',
}: ButtonTextProps) => {
  return (
    <NavLink
      sx={sx}
      onClick={e => {
        onPress && onPress(e)
      }}
      variant={label ? 'links.text' : 'links.back'}
    >
      <Flex>
        <Paragraph sx={styleText} bold>
          {label}
        </Paragraph>
        {icon && typeof icon === 'string' ? (
          <Icon
            icon={icon}
            sx={{
              ...iconSx,
            }}
            color={color || IconColorsMap[variant]}
            {...iconProps}
          />
        ) : (
          icon
        )}
      </Flex>
    </NavLink>
  )
}

export default ButtonText
