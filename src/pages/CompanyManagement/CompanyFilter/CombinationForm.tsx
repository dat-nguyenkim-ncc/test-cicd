import { Flex } from '@theme-ui/components'
import React from 'react'
import { Radio } from '../../../components'
import { ViewInterface } from '../../../types'
import { combinationOptions, ECombination } from './helpers'

type Props = ViewInterface<{
  state: ECombination
  disabled?: boolean
  onChange(v: ECombination): void
}>
export default ({ sx, state, disabled, onChange }: Props) => {
  return (
    <Flex sx={{ mt: 3, ...sx }}>
      {combinationOptions.map((item, index) => (
        <Radio
          key={item.value}
          sx={{ mr: 4 }}
          label={item.label}
          selected={state === item.value}
          onClick={() => {
            onChange(item.value)
          }}
          size="tiny"
          disabled={disabled}
        />
      ))}
    </Flex>
  )
}
