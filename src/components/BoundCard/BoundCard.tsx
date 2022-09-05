import React from 'react'
import { Flex } from '@theme-ui/components'
import { Paragraph } from '../primitives'
import { Button } from '..'
import { ButtonProps, ViewInterface } from '../../types'

type Props = ViewInterface<{
  title: string
  buttons: ButtonProps[]
}>

const BoundCard = (props: Props) => {
  return (
    <Flex sx={{ flexDirection: 'column', width: '100%', ...props.sx }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Paragraph bold>{props.title}</Paragraph>
        <Flex sx={{ alignItems: 'center' }}>
          {props.buttons.map((b, index) => (
            <Button
              key={b.label + index}
              sx={{
                p: 0,
                color: 'primary',
                fontWeight: 'normal',
                flexDirection: 'row-reverse',
                fontSize: 16,
                ...b.sx,
              }}
              label={b.label}
              onPress={b.action}
              icon={b.icon}
              color="primary"
              variant="invert"
            />
          ))}
        </Flex>
      </Flex>
      {props.children}
    </Flex>
  )
}

export default BoundCard
