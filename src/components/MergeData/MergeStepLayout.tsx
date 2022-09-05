import React, { PropsWithChildren } from 'react'
import { Box } from '@theme-ui/components'
import { Paragraph } from '../primitives'
import { ViewInterface } from '../../types'

type Props = ViewInterface<
  PropsWithChildren<{
    label: string
    isEmpty: boolean
  }>
>

const MergeStepLayout = (props: Props) => {
  return (
    <Box sx={props.sx || { px: 6 }}>
      {props.label && (
        <Paragraph sx={{ fontSize: '20px', mb: 4 }} bold>
          {props.label}
        </Paragraph>
      )}

      {!props.isEmpty ? (
        <>{props.children}</>
      ) : (
        <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA AVAILABLE</Paragraph>
      )}
    </Box>
  )
}

export default MergeStepLayout
