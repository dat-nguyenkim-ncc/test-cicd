import { Box, BoxProps } from '@theme-ui/components'
import React from 'react'

/**
 * This component use for support automation test detect the location of Element
 * @param props
 * @returns <Box></Box>
 */

const SupportAutomationTestingWrapper = (props: BoxProps) => {
  return <Box {...props}>{props.children}</Box>
}

export default SupportAutomationTestingWrapper
