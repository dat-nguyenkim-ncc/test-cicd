import React from 'react'
import { compiler } from 'markdown-to-jsx'
import { Text, Link, TextProps } from 'theme-ui'
import { ViewInterface } from '../../../types'

export type ParagraphProps = ViewInterface<{
  bold?: boolean
  light?: boolean
  center?: boolean
}> &
  TextProps

const Paragraph = ({
  children,
  bold = false,
  center = false,
  light = false,
  sx,
  ...props
}: ParagraphProps) => {
  return (
    <Text
      as="p"
      sx={{
        textAlign: center ? 'center' : 'inherit',
        opacity: light ? 0.3 : 1,
        fontWeight: bold ? 'bold' : 'body',
        ...sx,
      }}
      variant="body"
      css={props.css}
      onClick={props.onClick}
      title={props.title}
    >
      {compiler((children?.toString() || '') as string, {
        forceInline: true,
        overrides: {
          a: {
            component: Link,
            props: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          },
        },
      })}
    </Text>
  )
}

export default Paragraph
