import React from 'react'
import { Box } from 'theme-ui'
import { ViewInterface } from '../../../types'

export type SectionProps = ViewInterface<{}>

const Section = ({ children, sx }: SectionProps) => {
  return (
    <Box
      sx={{
        padding: 6,
        backgroundColor: 'background',
        borderRadius: 10,
        maxWidth: 1024,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export default Section
