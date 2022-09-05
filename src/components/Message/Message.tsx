import React from 'react'
import { Flex } from 'theme-ui'
import { ViewInterface } from '../../types'
import Icon, { IconProps } from '../Icon'
import { Paragraph } from '../primitives'

export type MessageProps = ViewInterface<{
  variant: 'check' | 'alert'
  body: string
}>

type IconTypes = Record<'check' | 'alert', IconProps>

const iconTypes: IconTypes = {
  check: {
    icon: 'tick',
    background: 'primary',
    color: 'white',
    size: 'small',
  },
  alert: {
    icon: 'alert',
    background: 'red',
    color: 'white',
    size: 'small',
  },
}

const Message = ({ variant, body, sx }: MessageProps) => {
  return (
    <Flex sx={{ alignItems: 'center', ...sx }}>
      <Icon sx={{ mr: 3 }} {...iconTypes[variant]} />
      <Paragraph bold sx={{ color: variant === 'alert' ? 'red' : 'primary' }}>
        {body.toUpperCase()}
      </Paragraph>
    </Flex>
  )
}

export default Message
