import { Box, Flex, Text } from '@theme-ui/components'
import React from 'react'
import { Button, Icon, Modal } from '..'
import { Heading } from '../primitives'
import MarkDown from 'markdown-to-jsx'
import { SxStyleProp } from 'theme-ui'
import { errorModalZIndex } from '../../utils/consts'

type Props = {
  title?: string
  message: string
  onOK: (e?: React.MouseEvent) => void
  sx?: SxStyleProp
}

const ErrorModal = (props: Props) => {
  return (
    <Modal sx={{ p: 6, maxHeight: '80vh', minWidth: 500 }} zIndex={errorModalZIndex}>
      <Flex sx={{ width: '100%', justifyContent: 'center' }}>
        <Icon icon="alert" size="small" background="red" color="white" />
        <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
          {props.title || 'Error'}
        </Heading>
      </Flex>
      <Box sx={{ mt: 3, textAlign: 'center', ...props.sx }}>
        <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
          <MarkDown>{typeof props.message === 'string' ? props.message : ''}</MarkDown>
        </Text>
      </Box>
      <Box mt={4}>
        <Button sx={{ m: '0 auto' }} label="OK" onPress={props.onOK} />
      </Box>
    </Modal>
  )
}

export default ErrorModal
