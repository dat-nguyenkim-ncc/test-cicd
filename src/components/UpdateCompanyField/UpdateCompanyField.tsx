import React from 'react'
import { Box, Flex, Grid, SxStyleProp } from 'theme-ui'
import { Variants } from '../../types'
import Button from '../Button'
import { Paths } from '../Icon'
import { Paragraph } from '../primitives'
import ReasonTextField from './ReasonTextField'

export type ButtonType = {
  label: string
  action(): void
  type: Variants
  disabled?: boolean
  icon?: Paths
}

type Props = {
  reasonRequired?: boolean
  oldValue?: string | number | any
  newValue?: string | number | any
  buttons?: ButtonType[]
  buttonsStyle?: SxStyleProp
  reason?: string
  hasReason?: boolean
  warning?: string
  setReason: (value: string) => void
}

const valueStyle: SxStyleProp = {
  wordBreak: 'break-all',
}

const UpdateCompanyField = ({
  oldValue,
  newValue,
  buttons,
  buttonsStyle,
  reason = '',
  hasReason = true,
  warning,
  setReason,
  reasonRequired,
}: Props) => {
  return (
    <Box
      sx={{
        overflow: 'auto',
        minWidth: 320,
        maxWidth: 320,
        maxHeight: 500,
      }}
    >
      <Grid gap={2} columns={['1fr 1fr']}>
        <Box>
          <Paragraph bold sx={{ mb: 2 }}>
            Current value
          </Paragraph>
          <Paragraph sx={{ ...valueStyle }}>{`${oldValue || ''}`}</Paragraph>
        </Box>
        <Box>
          <Paragraph bold sx={{ mb: 2, color: !newValue ? 'red' : 'black' }}>
            New value
          </Paragraph>
          <Paragraph sx={{ ...valueStyle, color: 'primary' }}>{`${newValue || ''}`}</Paragraph>
        </Box>
      </Grid>

      {hasReason && (
        <ReasonTextField reason={reason} setReason={setReason} required={reasonRequired} />
      )}

      {warning && <Paragraph sx={{ mt: 4, color: 'rgba(0, 0, 0, 0.5)' }}>{warning}</Paragraph>}

      <Flex sx={{ mt: 5, ...buttonsStyle }}>
        {buttons?.map((b, index) => (
          <Button
            key={index}
            sx={{ ml: index === 0 ? 0 : 4 }}
            variant={b.type}
            label={b.label}
            onPress={b.action}
            disabled={b.disabled}
            icon={b.icon}
          />
        ))}
      </Flex>
    </Box>
  )
}

export default UpdateCompanyField
