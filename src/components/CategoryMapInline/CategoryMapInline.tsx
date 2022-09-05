import React from 'react'
import { Flex, Text } from 'theme-ui'
import { MapCategory, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

export type CategoryMapInlineProps = ViewInterface<{
  category?: MapCategory
}>

const CategoryMapInline = ({ category, sx }: CategoryMapInlineProps) => {
  return (
    <Flex sx={{ alignItems: 'center', ...sx }}>
      <Paragraph bold>{category ? category.label : 'Uncategorised'}</Paragraph>
      {category && (
        <>
          <Text sx={{ mt: '3px', ml: 2, mr: 3, fontSize: '12px' }}>▶</Text>
          <Paragraph>{category.list[0]}</Paragraph>
        </>
      )}
    </Flex>
  )
}

export default CategoryMapInline
