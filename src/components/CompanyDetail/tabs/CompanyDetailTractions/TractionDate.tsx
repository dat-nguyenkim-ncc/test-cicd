import moment from 'moment'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Switch } from '../../..'
import { ColumnNames, validateDateTraction } from '../../../../pages/CompanyForm/helpers'
import { CompanyTractionsFilterType } from '../../../../pages/FindFintechs/helpers'
import { ChangeFieldEvent } from '../../../../types'
import { isDate } from '../../../../utils'
import { INVALID_DATE, TRACTION_DATE_FORMAT } from '../../../../utils/consts'
import Icon from '../../../Icon'
import Paragraph from '../../../primitives/Paragraph/Paragraph'
import TextField from '../../../TextField'

type TractionDateProps = {
  title: string
  currentFilter: CompanyTractionsFilterType
  setCurrentFilter: (state: CompanyTractionsFilterType) => void
  errorForm: string[]
  setErrorForm(form: string[]): void
}

const defaultErrorFields = {
  date: false,
  dateFrom: false,
  dateTo: false,
}

const TractionDate = ({
  title,
  currentFilter,
  setCurrentFilter,
  errorForm,
  setErrorForm,
}: TractionDateProps) => {
  const [errorFields, setErrorFields] = useState(defaultErrorFields)

  const checkValidDateInput = (
    event: ChangeFieldEvent,
    fieldName: keyof typeof defaultErrorFields
  ) => {
    const value = event.target.value
    const isValidDateValue = isDate(value) || !value
    let hasError = false
    let newErrors = { ...errorFields }
    if (!isValidDateValue || validateDateTraction(value) === INVALID_DATE) {
      newErrors = { ...newErrors, [fieldName]: true }
      hasError = true
    }
    if (isValidDateValue && currentFilter.isRange) {
      const dateFrom =
        fieldName === ColumnNames.DATE_FROM
          ? moment(value, TRACTION_DATE_FORMAT)
          : moment(currentFilter?.dateFrom, TRACTION_DATE_FORMAT)
      const dateTo =
        fieldName === ColumnNames.DATE_TO
          ? moment(value, TRACTION_DATE_FORMAT)
          : moment(currentFilter?.dateTo, TRACTION_DATE_FORMAT)

      if (dateFrom.isValid() && dateTo.isValid() && dateFrom > dateTo) {
        newErrors = { ...newErrors, [fieldName]: true }
        hasError = true
      }
    }
    if (hasError) {
      setErrorFields(newErrors)
      if (!errorForm.includes(fieldName)) {
        setErrorForm([...errorForm, fieldName])
      }
    } else {
      setErrorFields({ ...errorFields, [fieldName]: false })
      if (errorForm.includes(fieldName)) {
        setErrorForm(errorForm.filter(errorFieldName => errorFieldName !== fieldName))
      }
    }
  }

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 4, pb: 3 }}>
        <Paragraph bold>{title || 'Traction Date'}</Paragraph>
        <Flex sx={{ alignItems: 'center' }}>
          <Paragraph sx={{ mr: 2 }}>Date range</Paragraph>
          <Switch
            onToggle={() => {
              setCurrentFilter({ ...currentFilter, isRange: !currentFilter.isRange })
            }}
            checked={currentFilter.isRange}
          />
        </Flex>
      </Flex>
      <Box>
        {currentFilter.isRange ? (
          <Flex>
            <TextField
              name="range"
              type="input"
              value={currentFilter?.dateFrom}
              formattedValue={validateDateTraction(currentFilter?.dateFrom)}
              placeholder={TRACTION_DATE_FORMAT}
              onChange={e => {
                checkValidDateInput(e, ColumnNames.DATE_FROM as 'date' | 'dateFrom' | 'dateTo')
                setCurrentFilter({ ...currentFilter, dateFrom: e.target.value })
              }}
              fieldState={errorFields.dateFrom ? 'error' : 'default'}
            />
            <Icon sx={{ px: 3 }} icon="minus" />
            <TextField
              name="range"
              type="input"
              value={currentFilter?.dateTo}
              formattedValue={validateDateTraction(currentFilter?.dateTo)}
              placeholder={TRACTION_DATE_FORMAT}
              onChange={e => {
                checkValidDateInput(e, ColumnNames.DATE_TO as 'date' | 'dateFrom' | 'dateTo')
                setCurrentFilter({ ...currentFilter, dateTo: e.target.value })
              }}
              fieldState={errorFields.dateTo ? 'error' : 'default'}
            />
          </Flex>
        ) : (
          <TextField
            name="range"
            type="input"
            value={currentFilter?.date}
            formattedValue={validateDateTraction(currentFilter?.date)}
            placeholder={TRACTION_DATE_FORMAT}
            onChange={e => {
              checkValidDateInput(e, ColumnNames.DATE as 'date' | 'dateFrom' | 'dateTo')
              setCurrentFilter({ ...currentFilter, date: e.target.value })
            }}
            fieldState={errorFields.date ? 'error' : 'default'}
          />
        )}
      </Box>
    </>
  )
}

export default TractionDate
