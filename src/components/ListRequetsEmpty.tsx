import React from 'react'
import { Box } from '@theme-ui/components'
import { Heading, Paragraph } from './primitives'

const ListRequestEmpty = () => (
  <Box sx={{ py: 100, mb: 6, textAlign: 'center' }}>
    <Heading sx={{ color: 'darkGray' }} as="h3">
      List of requests is empty
    </Heading>
    <Paragraph sx={{ py: 3, color: 'darkGray' }}>Currently there is no request to view</Paragraph>
  </Box>
)

export default ListRequestEmpty
