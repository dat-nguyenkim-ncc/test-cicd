import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { Icon } from '..'
import { FileState, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

type Props = ViewInterface<{
  file: FileState
  onDelete(e?: React.MouseEvent): void
  invalid?: boolean
}>

const FileItem = (props: Props) => {
  const color = props.invalid ? 'red' : 'text'
  return (
    <Flex sx={{ gap: 1, alignItems: 'center', ...props.sx }}>
      <Icon icon="file" color={color} />
      <Paragraph sx={{ flex: 1, p: 0, color }}>{props.file.file.name || ''}</Paragraph>
      <Box onClick={props.onDelete} sx={{ borderRadius: '50%' }}>
        <Icon
          icon="close-circle"
          color={color}
          sx={{ width: 14, height: 14, '&: hover': { opacity: 0.8 }, cursor: 'pointer' }}
        />
      </Box>
    </Flex>
  )
}

export default FileItem
