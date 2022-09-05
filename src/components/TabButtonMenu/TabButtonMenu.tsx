import { Flex } from '@theme-ui/components'
import React from 'react'
import { SxStyleProp } from 'theme-ui'
import { Button } from '..'
import { ViewInterface } from '../../types'

type Props = ViewInterface<{
  buttons: {
    label: string
    active: boolean
    onPress(): void
    disabled?: boolean
    sx?: SxStyleProp
  }[]
  bold?: boolean
}>

const TabButtonMenu = ({ buttons, sx, bold = false }: Props) => {
  return (
    <Flex sx={sx}>
      {buttons.map((b, index) => (
        <Button
          key={index}
          sx={{
            width: `calc(${100 / buttons.length}% + 10px)`,
            ml: index > 0 ? '-10px' : 0,
            zIndex: b.active ? 10 : 0,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            paddingY: '14px',
            ...(b.sx || {}),
          }}
          label={b.label}
          variant={b.active ? 'primary' : 'muted'}
          onPress={b.onPress}
          disabled={b.disabled}
          bold={bold}
        />
      ))}
    </Flex>
  )
}

export default TabButtonMenu
