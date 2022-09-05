import { useLazyQuery } from '@apollo/client'
import React, { useState } from 'react'
import { MultipleAutocomplete } from '../..'
import { searchInvestorByName } from '../../../pages/CompanyForm/graphql'
import { FormOption } from '../../../types'
import { Paragraph } from '../../primitives'

type InvestorProps = {
  state: FormOption[]
  onChange(state: FormOption[]): void
}
const Investor = ({ state, onChange }: InvestorProps) => {
  const [options, setOptions] = useState<FormOption[]>([])

  const [searchInvestor, { data, loading }] = useLazyQuery(searchInvestorByName, {
    onCompleted() {
      setOptions(
        data.searchInvestorByName.data.reduce((acc: FormOption[], item: any) => {
          if (!acc.some(({ value }) => value === item.investor_name)) {
            acc.push({
              value: item.investor_name,
              label: item.investor_name,
            })
          }
          return acc
        }, [])
      )
    },
  })
  return (
    <>
      <Paragraph sx={{ pt: 4, pb: 3 }} bold>
        Investor
      </Paragraph>
      <MultipleAutocomplete
        placeholder="All"
        name="investor"
        options={options}
        state={state}
        loading={loading}
        onChange={onChange}
        fetchRequested={value => {
          searchInvestor({ variables: { name: value } })
        }}
      />
    </>
  )
}

export default Investor
