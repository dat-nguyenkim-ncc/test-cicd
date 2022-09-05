import React, { useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { Radio } from '..'
import { ViewInterface } from '../../types'

type onChangeEvent = {
  name: string
  value: string
}

export type RadioGroupProps = ViewInterface<{
  label?: string
  name: string
  options: {
    label: string
    value: string
  }[]
  onChange?(e: onChangeEvent | undefined): void
  defaultValue?: string
}>

const RadioGroup = ({ name, sx, label, options, onChange, defaultValue }: RadioGroupProps) => {
  const [selected, setSelected] = useState<string | undefined>(defaultValue)

  const onClickRadio = (value: string) => {
    setSelected(selected === value ? undefined : value)
    onChange && onChange({ name, value })
  }
  return (
    <Box sx={{ flex: 1, ...sx }}>
      {label && <Label>{label}</Label>}
      <Flex>
        {options.map((o, index) => (
          <Radio
            selected={selected === o.value}
            onClick={onClickRadio}
            sx={{ ml: index > 0 ? 6 : 0 }}
            key={index}
            {...o}
          />
        ))}
      </Flex>
    </Box>
  )
}

export default RadioGroup
