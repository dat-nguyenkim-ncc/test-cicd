import React, { useState } from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Dropdown, Icon, Switch } from '../../../components'
import { getYearList } from '../../../components/MappingZone/FilterForm/helpers'
import { Paragraph } from '../../../components/primitives'
import { FormOption } from '../../../types'
import { RangeType } from './helpers'

type YearRangeProps = {
  isRange: boolean
  setIsRange(state: boolean): void
  state: RangeType
  onChange(state: RangeType): void
  disabled?: boolean
}

const YearRange = ({ state, isRange, setIsRange, onChange, disabled }: YearRangeProps) => {
  const [years] = useState<FormOption[]>(getYearList(2000).map(y => ({ label: `${y}`, value: y })))

  return (
    <>
      <Flex
        sx={{
          mb: 3,
          alignItems: 'center',
        }}
      >
        <Switch
          checked={isRange}
          onToggle={() => {
            setIsRange(!isRange)
          }}
          disabled={disabled}
        />
        <Paragraph sx={{ ml: 3, opacity: disabled ? 0.5 : 1 }}>Year range</Paragraph>
      </Flex>
      <Box>
        {isRange ? (
          <Flex>
            <Dropdown
              sx={{ flex: 1 }}
              name="from"
              value={state?.from}
              options={[...years, { value: 1, label: 'Pre 2000' }]}
              onChange={({ target: { value } }) => {
                onChange({ ...state, from: value, to: +value > +state.to ? '' : state.to })
              }}
              disabled={disabled}
            />
            <Icon sx={{ px: 3 }} icon="minus" />
            <Dropdown
              sx={{ flex: 1 }}
              name="to"
              value={state?.to}
              options={years.filter(({ value }) => +value > +state.from)}
              onChange={({ target }) => {
                onChange({ ...state, to: target.value })
              }}
              disabled={disabled}
            />
          </Flex>
        ) : (
          <Dropdown
            name="range"
            value={state?.from}
            options={[...years, { value: 1, label: 'Pre 2000' }]}
            onChange={({ target }) => {
              onChange({ from: target.value, to: target.value })
            }}
            disabled={disabled}
          />
        )}
      </Box>
    </>
  )
}
export default YearRange
