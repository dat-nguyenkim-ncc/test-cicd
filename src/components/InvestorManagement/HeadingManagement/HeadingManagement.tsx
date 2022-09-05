import { Button, Flex } from '@theme-ui/components'
import React, { MouseEvent } from 'react'
import { Size, Variants, ViewInterface } from '../../../types'
import { sizeStyle } from '../../Button/helpers'
import Path from '../../Icon/Paths'
import { Heading } from '../../primitives'

type HeadingManagementProps = ViewInterface<{
  heading: string
  variant?: Variants
  size?: Size
  onPress?(e?: MouseEvent): void
  disabled?: boolean
  active?: boolean
}>

const Back = Path.back

const HeadingManagement = ({
  heading,
  size = 'normal',
  variant = 'invert',
  onPress,
  disabled = false,
  active = true,
  sx,
}: HeadingManagementProps) => {
  return (
    <Flex sx={{ alignItems: 'center', mb: 4, mt: 2 }}>
      <Button
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          ...sizeStyle(size),
          pointerEvents: disabled || !active ? 'none' : 'visible',
          opacity: disabled ? 0.5 : 1,
          p: 0,
          ...sx,
        }}
        onClick={async (e: MouseEvent) => {
          onPress && (await onPress(e))
        }}
        variant={variant}
      >
        <Back />
      </Button>
      <Heading sx={{ ml: 3, fontWeight: 600 }} as={'h4'}>
        {heading}
      </Heading>
    </Flex>
  )
}
export default HeadingManagement
