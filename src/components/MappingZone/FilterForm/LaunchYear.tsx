import { Box, Flex } from '@theme-ui/components'
import React, { useState } from 'react'
import { Dropdown, Icon, Switch } from '../..'
import { FormOption } from '../../../types'
import { Paragraph } from '../../primitives'
import { getYearList, YearRangeType } from './helpers'

type FundingAmountProps = {
  isRange: boolean
  setIsRange(state: boolean): void
  state: {
    year: string
    yearRange: YearRangeType
  }
  onChange(state: { year: string; yearRange: YearRangeType }): void
  title?: string
}

const LaunchYear = ({ isRange, setIsRange, state, onChange, title }: FundingAmountProps) => {
  const [years] = useState<FormOption[]>(getYearList(2000).map(y => ({ label: `${y}`, value: y })))
  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 4, pb: 3 }}>
        <Paragraph bold>{title || 'Launch Year'}</Paragraph>
        <Flex sx={{ alignItems: 'center' }}>
          <Paragraph sx={{ mr: 2 }}>Year range</Paragraph>
          <Switch
            onToggle={() => {
              setIsRange(!isRange)
            }}
            checked={isRange}
          />
        </Flex>
      </Flex>
      <Box>
        {isRange ? (
          <Flex>
            <Dropdown
              sx={{ flex: 1 }}
              name="from"
              value={state?.yearRange?.from}
              options={[...years, { value: 1, label: 'Pre 2000' }]}
              onChange={({ target: { value } }) => {
                onChange({
                  ...state,
                  yearRange: {
                    from: value,
                    to: +value > +state.yearRange.to ? '' : state.yearRange.to,
                  },
                })
              }}
            />
            <Icon sx={{ px: 3 }} icon="minus" />
            <Dropdown
              sx={{ flex: 1 }}
              name="to"
              value={state?.yearRange?.to}
              options={years.filter(({ value }) => +value > +state.yearRange.from)}
              onChange={({ target }) => {
                onChange({ ...state, yearRange: { ...state.yearRange, to: target.value } })
              }}
            />
          </Flex>
        ) : (
          <Dropdown
            name="range"
            value={state?.year}
            options={[...years, { value: 1, label: 'Pre 2000' }]}
            onChange={({ target }) => {
              onChange({ ...state, year: target.value })
            }}
          />
        )}
      </Box>
    </>
  )
}

export default LaunchYear
