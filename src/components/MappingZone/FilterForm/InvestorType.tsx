import React, { useState } from 'react'
import { MultipleAutocomplete } from '../..'
import { Paragraph } from '../../primitives'
import { investor } from '../../../pages/CompanyForm/mock'
import { FormOption } from '../../../types'

type InvestorTypeProps = {
  state: FormOption[]
  onChange(state: FormOption[]): void
}

const InvestorType = ({ state, onChange }: InvestorTypeProps) => {
  const [options, setOptions] = useState<FormOption[]>([...investor])

  return (
    <>
      <Paragraph sx={{ pt: 4, pb: 3 }} bold>
        Investor Type
      </Paragraph>
      <MultipleAutocomplete
        placeholder="All"
        name="investor"
        options={options}
        state={state}
        onChange={onChange}
        fetchRequested={value => {
          setOptions(
            investor.filter(({ label }) => label.toUpperCase().indexOf(value.toUpperCase()) > -1)
          )
        }}
      />
    </>
  )
}

export default InvestorType
