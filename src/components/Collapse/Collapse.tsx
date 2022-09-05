import { Box } from '@theme-ui/components'
import React, { PropsWithChildren } from 'react'
import { ViewInterface } from '../../types'

type Props = PropsWithChildren<
  ViewInterface<{
    disabled?: boolean
    expanded?: boolean
    header: (state: { expanded: boolean; setExpanded: (e: boolean) => void }) => React.ReactElement
  }>
>

const CollapseHeader = ({ children, ...props }: any) => {
  return (
    <Box sx={{ ...props.sx }} onClick={props.onClick}>
      {children}
    </Box>
  )
}

const CollapseContent = (props: any) => {
  return <Box>{props.children}</Box>
}

export default function Collapse(props: Props) {
  const [expanded, setExpanded] = React.useState(
    typeof props.expanded === 'boolean' ? props.expanded : false
  )

  return (
    <Box sx={{ ...props.sx }}>
      <CollapseHeader sx={{ opacity: !props.disabled ? 1 : 0.5 }}>
        {props.header({
          expanded,
          setExpanded: v => {
            !props.disabled && setExpanded(v)
          },
        })}
      </CollapseHeader>
      {expanded && !props.disabled ? <CollapseContent>{props.children}</CollapseContent> : null}
    </Box>
  )
}
