import { Box } from '@theme-ui/components'
import React from 'react'
import { TextField } from '..'
import strings from '../../strings'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

const MAX_REASON_LENGTH = 700

type Props = ViewInterface<{
  reason: string
  setReason: (value: string) => void
  required?: boolean
  label?: string
}>

export type { Props as ReasonTextFieldProps }

export default function ({ required, reason, setReason, sx, label }: Props) {
  const isError = reason?.length > MAX_REASON_LENGTH

  return (
    <Box sx={{ mt: 5, ...sx }}>
      <TextField
        label={label || strings.common.enterReason}
        required={required}
        type="textarea"
        name="reason"
        id="reason"
        value={reason}
        onChange={event => {
          setReason(event.target.value)
        }}
        error={isError ? `Max length is ${MAX_REASON_LENGTH} character` : ''}
        fieldState={isError ? 'error' : 'default'}
        maxLength={MAX_REASON_LENGTH}
      />
      <Paragraph
        sx={{ color: isError ? 'red' : 'rgba(0, 0, 0, 0.5)' }}
      >{`${reason?.length}/${MAX_REASON_LENGTH}`}</Paragraph>
    </Box>
  )
}
