import React from 'react'
import { Box, Flex, SxStyleProp } from 'theme-ui'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

export type TabMenuCategoriesProps = ViewInterface<{
  buttons: {
    label: string
    active: boolean
    onClick(): void
  }[]
  buttonSx?: SxStyleProp
}>

const TabMenuCategories = ({ buttons, sx, buttonSx }: TabMenuCategoriesProps) => {
  return (
    <Flex sx={{ width: '100%', ...sx }}>
      {buttons.map((b, index) => (
        <Box
          onClick={b.onClick}
          key={index}
          sx={{
            cursor: 'pointer',
            borderBottomColor: b.active ? 'primary' : 'gray03',
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            width: `${100 / buttons.length}%`,
            textAlign: 'center',
            pb: 5,
            ...buttonSx,
          }}
        >
          <Paragraph bold>{b.label}</Paragraph>
        </Box>
      ))}
    </Flex>
  )
}

export default TabMenuCategories
