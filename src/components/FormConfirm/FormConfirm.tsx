import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { Button, Icon, SwipeButton } from '..'
import { PaletteKeys } from '../../theme'
import { ViewInterface } from '../../types'
import { Heading } from '../primitives'

type FormConfirmProps = ViewInterface<{
  header?: string
  listConfirm?: {
    label: string
    list: string[]
  }
  color?: PaletteKeys
  bgColor?: PaletteKeys
  textConfirm?: string
  destructive?: boolean
  disabled?: boolean
  onConfirm(): void
  onCancel(): void
}>

const FormConfirm = ({
  children,
  sx,
  header = 'Warning',
  textConfirm,
  color = 'red',
  bgColor = 'bgRed',
  disabled,
  destructive,
  onConfirm,
  onCancel,
}: FormConfirmProps) => {
  const [declineLoading, setDeclineLoading] = React.useState(false)

  return (
    <Box sx={{ px: 4, ...sx }}>
      <Flex sx={{ justifyContent: 'center' }}>
        <Icon icon="alert" size="small" background={color} color="white" />
        <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
          {header}
        </Heading>
      </Flex>
      {children}
      <Box sx={{ pt: 4, width: '100%' }}>
        <SwipeButton
          label={textConfirm}
          color={color}
          bgColor={bgColor}
          endSwipe={async () => {
            setDeclineLoading(true)
            await onConfirm()
            setDeclineLoading(false)
          }}
          destructive={destructive}
          disabled={disabled}
        />
      </Box>
      <Flex sx={{ justifyContent: 'center' }}>
        <Button
          label="Cancel"
          sx={{ mt: 1, mb: 5, color: 'black' }}
          onPress={onCancel}
          variant="invert"
          disabled={declineLoading}
        ></Button>
      </Flex>
    </Box>
  )
}

export default FormConfirm
