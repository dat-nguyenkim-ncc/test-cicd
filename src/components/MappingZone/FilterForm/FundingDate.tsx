import { Box, Flex } from '@theme-ui/components'
import moment from 'moment'
import React, { useState } from 'react'
import { Icon, Switch, TextField } from '../..'
import { validateDate } from '../../../pages/CompanyForm/helpers'
import { isDate } from '../../../utils'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../utils/consts'
import { Paragraph } from '../../primitives'
import {
  YearRangeType,
} from './helpers'

type FundingDateProps = {
  name: string
  isRange: boolean
  setIsRange(state: boolean): void
  state: {
    date: string
    dateRange: YearRangeType
  }
  onChange(state: { date: string; dateRange: YearRangeType }): void
  title?: string
  errorForm: string[]
  setErrorForm(form: string[]): void
}

const defaultErrorFields = {
  date: false,
  from: false,
  to: false,
}

const FundingDate = ({
  name,
  isRange,
  setIsRange,
  state,
  onChange,
  title,
  errorForm,
  setErrorForm,
}: FundingDateProps) => {
  const [errorFields, setErrorFields] = useState(defaultErrorFields)

  const checkValidDateInput = (value: string, fieldName: keyof typeof defaultErrorFields) => {
    const isValidDateValue = isDate(value) || !value
    let hasError = false
    let newErrors = { ...errorFields }
    if (!isValidDateValue) {
      newErrors = { ...newErrors, [fieldName]: true }
      hasError = true
    }
    if (isValidDateValue && isRange) {
      const dateFrom =
        fieldName === 'from'
          ? moment(value, DEFAULT_VIEW_DATE_FORMAT)
          : moment(state.dateRange.from, DEFAULT_VIEW_DATE_FORMAT)
      const dateTo =
        fieldName === 'to' ? moment(value, DEFAULT_VIEW_DATE_FORMAT) : moment(state.dateRange.to, DEFAULT_VIEW_DATE_FORMAT)
      if (dateFrom.isValid() && dateTo.isValid() && dateFrom > dateTo) {
        newErrors = { ...newErrors, [fieldName]: true }
        hasError = true
      }
    }
    if (hasError) {
      setErrorFields(newErrors)
      if (!errorForm.includes(name)) {
        setErrorForm([...errorForm, name])
      }
    } else {
      setErrorFields({ ...errorFields, [fieldName]: false })
      if (errorForm.includes(name)) {
        setErrorForm(errorForm.filter(errorFieldName => errorFieldName !== name))
      }
    }
  }

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 4, pb: 3 }}>
        <Paragraph bold>{title || 'Funding Date'}</Paragraph>
        <Flex sx={{ alignItems: 'center' }}>
          <Paragraph sx={{ mr: 2 }}>Date range</Paragraph>
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
            <TextField
              name="range"
              type="input"
              value={state?.dateRange.from}
              formattedValue={validateDate(state?.dateRange.from)}
              placeholder={DEFAULT_VIEW_DATE_FORMAT}
              onChange={({ target }) => {
                checkValidDateInput(target.value, 'from')
                onChange({
                  ...state,
                  dateRange: {
                    from: target.value,
                    to: state.dateRange.to,
                  },
                })
              }}
              fieldState={errorFields.from ? 'error' : 'default'}
            />
            <Icon sx={{ px: 3 }} icon="minus" />
            <TextField
              name="range"
              type="input"
              value={state?.dateRange.to}
              formattedValue={validateDate(state?.dateRange.to)}
              placeholder={DEFAULT_VIEW_DATE_FORMAT}
              onChange={({ target }) => {
                checkValidDateInput(target.value, 'to')
                onChange({
                  ...state,
                  dateRange: {
                    from: state.dateRange.from,
                    to: target.value,
                  },
                })
              }}
              fieldState={errorFields.to ? 'error' : 'default'}
            />
          </Flex>
        ) : (
          <TextField
            name="range"
            type="input"
            value={state?.date}
            formattedValue={validateDate(state?.date)}
            placeholder={DEFAULT_VIEW_DATE_FORMAT}
            onChange={({ target }) => {
              checkValidDateInput(target.value, 'date')
              onChange({ ...state, date: target.value })
            }}
            fieldState={errorFields.date ? 'error' : 'default'}
          />
        )}
      </Box>
    </>
  )
}

export default FundingDate
