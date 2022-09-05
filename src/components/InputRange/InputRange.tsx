import { Flex } from '@theme-ui/components'
import React, { useState } from 'react'
import { Icon, TextField } from '..'
import { RangeType } from '../../pages/CompanyManagement/CompanyFilter/helpers'
import { ChangeFieldEvent } from '../../types'

const InputRange = ({
  state,
  onChange,
}: {
  state: RangeType
  onChange(state: RangeType): void
}) => {
  const [localState, setLocalState] = useState<RangeType>(state)

  const onChangeField = (e: ChangeFieldEvent) => {
    const { name, value } = e.target
    setLocalState({ ...localState, [name]: value })
    onChange({ ...state, [name]: value })
  }

  return (
    <Flex>
      <TextField name="from" placeholder="From" value={state?.from} onChange={onChangeField} />
      <Icon sx={{ px: 3 }} icon="minus" />
      <TextField name="to" placeholder="To" value={state?.to} onChange={onChangeField} />
    </Flex>
  )
}
export default InputRange
