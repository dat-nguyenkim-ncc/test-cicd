import React from 'react'
import { Heading as H } from 'theme-ui'
import { ViewInterface } from '../../../types'

export type HeadingProps = ViewInterface<{
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
  center?: boolean
}>

const Heading = ({ children, as, center = false, sx }: HeadingProps) => (
  <H sx={{ textAlign: center ? 'center' : 'inherit', ...sx }} as={as} variant={`text.${as}`}>
    {children}
  </H>
)

export default Heading
