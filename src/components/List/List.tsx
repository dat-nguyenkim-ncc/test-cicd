import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { Checkbox } from '..'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

export type ListType = {
  id?: string
  label: string | React.ReactElement
}
type ListProps = ViewInterface<{
  label?: string
  list: ListType[]
  selection?: {
    selectedList: ListType[]
    onClick(i: ListType): void
  }
}>
const List = ({ sx, label, list, selection }: ListProps) => {
  return (
    <Box sx={{ textAlign: 'start', ...sx }}>
      {label && (
        <Paragraph sx={{ my: 16 }} bold>
          {label}
        </Paragraph>
      )}
      <Box sx={{ maxHeight: '25vh', overflowY: 'auto' }}>
        {list.map((item, index) => (
          <Flex key={index} sx={{ ml: 1, mt: 3, alignItems: 'center', gap: 2 }}>
            {!selection && (
              <Box
                sx={{
                  borderStyle: 'solid',
                  borderColor: 'primary',
                  backgroundColor: 'primary',
                  width: 5,
                  height: 5,
                  borderRadius: '100%',
                  cursor: 'pointer',
                }}
              />
            )}
            {selection && (
              <Checkbox
                size={'tiny'}
                checked={selection.selectedList.some(s => s.id === item.id)}
                onPress={() => {
                  selection.onClick(item)
                }}
              />
            )}
            <Flex sx={{ alignItems: 'center' }}>
              {typeof item.label === 'string' ? <Paragraph>{item.label}</Paragraph> : item.label}
            </Flex>
          </Flex>
        ))}
      </Box>
    </Box>
  )
}

export default List
