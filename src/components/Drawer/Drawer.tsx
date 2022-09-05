import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { ViewInterface } from '../../types'
import { drawerZIndex } from '../../utils/consts'

type DrawProps = ViewInterface<{ visible: boolean; isLeft?: boolean; width?: string }>

const Drawer = ({ children, visible, isLeft, width = '400px' }: DrawProps) => {
  return (
    <Flex
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: visible ? '100%' : 0,
        height: visible ? '100%' : 0,
        backgroundColor: 'black50',
        zIndex: drawerZIndex,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: visible ? width : 0,
          position: 'fixed',
          zIndex: 1,
          top: 0,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          bg: 'white',
          overflowX: 'hidden',
          transition: '0.5s',
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}

export default Drawer
