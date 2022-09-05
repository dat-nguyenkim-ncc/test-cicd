import React from 'react'
import { Box, Grid as G } from 'theme-ui'
import { ViewInterface } from '../../../types'

export type GridProps = ViewInterface<{
  wrapper?: boolean
}>

const GRID_SIZE = 48
const SIDES = 8
const GAP = 0
const MAX_WIDTH = 1024
const CELL_SIZE = MAX_WIDTH / (GRID_SIZE - SIDES * 2)

const Grid = ({ children, sx, wrapper = true }: GridProps) => {
  return (
    <G
      gap={GAP}
      columns={`
        [left] repeat(${SIDES}, 1fr) 
        [center] repeat(${GRID_SIZE - SIDES * 2}, ${CELL_SIZE}px)
        [right] repeat(${SIDES}, 1fr)`}
      sx={sx}
    >
      {wrapper && <Box sx={{ gridColumn: 'center / right' }}>{children}</Box>}
      {!wrapper && children}
    </G>
  )
}

export default Grid
