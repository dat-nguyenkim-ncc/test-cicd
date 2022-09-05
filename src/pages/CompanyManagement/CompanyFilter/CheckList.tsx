import React from 'react'
import { Box } from '@theme-ui/components'
import { Checkbox } from '../../../components'
import { FormOption } from '../../../types'

const CheckList = ({
  listCheck,
  list,
  sort,
  disabled,
  onChange,
}: {
  listCheck: FormOption[]
  list: FormOption[]
  sort?: boolean
  disabled?: boolean
  onChange(value: FormOption[]): void
}) => {
  const state = sort
    ? list?.slice().sort(function (a, b) {
        let nameA = a.label.toUpperCase()
        let nameB = b.label.toUpperCase()
        return nameA.localeCompare(nameB)
      })
    : list
  return (
    <Box sx={{ py: 1, maxHeight: 222, overflowY: 'auto' }}>
      {state?.slice().map((item, index) => {
        const isChecked = listCheck.some(e => e.value === item.value)
        return (
          <Checkbox
            key={index}
            sx={{ py: 1 }}
            label={item.label}
            onPress={e => {
              e.stopPropagation()
              let cloneState = [...listCheck]
              if (isChecked) {
                cloneState = cloneState.filter(({ value }) => item.value !== value)
              } else cloneState.push(item)
              onChange(cloneState)
            }}
            square
            checked={isChecked}
            disabled={disabled}
          />
        )
      })}
    </Box>
  )
}

export default CheckList
