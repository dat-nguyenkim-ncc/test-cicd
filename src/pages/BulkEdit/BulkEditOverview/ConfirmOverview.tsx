import { Box, Grid } from '@theme-ui/components'
import React from 'react'
import { Paragraph } from '../../../components/primitives'
import strings from '../../../strings'
import { FileState } from '../../../types'
import { EnumExpandStatusId } from '../../../types/enums'
import { FieldNameKeys, FormFieldsState, LocationFields } from '../../CompanyForm/helpers'
import { fields, LocationState } from '../BulkEditOverview'
import { bulkEditOptions, EBulkEditOptions, getFctStatus } from '../helpers'

type Props = {
  selected: FieldNameKeys[]
  formState: FormFieldsState
  reasonState: FormFieldsState
  isSelectedHeadquarter: boolean
  reasonHQ: LocationFields
  headquarterState: LocationFields
  isSelectedLocation: boolean
  locationState: LocationState[]
  isSelectedAttachment: boolean
  attachmentOption: EBulkEditOptions
  attachmentType?: string
  fileState: FileState[]
}

const GRID = '0.4fr 0.4fr 1fr 0.5fr'

const ConfirmOverview = ({
  selected,
  formState,
  reasonState,
  reasonHQ,
  isSelectedHeadquarter,
  headquarterState,
  isSelectedLocation,
  locationState,
  isSelectedAttachment,
  attachmentOption,
  attachmentType,
  fileState,
}: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const getFields = () => {
    let arr: any = [...selected]
    if (isSelectedHeadquarter) {
      arr.push('headquarter')
    }
    if (isSelectedLocation) {
      arr = [...arr, ...locationState.map((item, index) => `operation${index}`)]
    }
    arr.push('attachment')
    return arr
  }

  const fieldsArr = getFields()

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Grid sx={{ p: 2, width: '100%', borderRadius: 10 }} columns={GRID} gap={2}>
          <Paragraph sx={{ lineHeight: 1.6 }} bold>{`Field Name`}</Paragraph>
          <Paragraph sx={{ lineHeight: 1.6 }} bold>{`Field Action`}</Paragraph>
          <Paragraph sx={{ lineHeight: 1.6 }} bold>{`Field Value`}</Paragraph>
          <Paragraph sx={{ lineHeight: 1.6 }} bold>{`Reason`}</Paragraph>
        </Grid>
        {selected.map((item, index) => {
          const field = fields.find(e => e.name === item)
          return field ? (
            <Grid
              key={index}
              sx={{
                p: 2,
                width: '100%',
                bg: index % 2 === 0 ? 'gray03' : 'none',
                borderRadius: 10,
              }}
              columns={GRID}
              gap={2}
            >
              <Paragraph sx={{ lineHeight: 1.6 }}>{copy.fields[field.key] || ''}</Paragraph>
              <Paragraph sx={{ lineHeight: 1.6 }}>{`Change to`}</Paragraph>
              <Paragraph sx={{ lineHeight: 1.6 }}>
                {formState[field.name]
                  ? item === 'fct_status_id'
                    ? getFctStatus(formState[field.name] as EnumExpandStatusId)
                    : formState[field.name]
                  : ''}
              </Paragraph>
              <Paragraph sx={{ lineHeight: 1.6 }}>{reasonState[field.name] || ''}</Paragraph>
            </Grid>
          ) : undefined
        })}
        {isSelectedHeadquarter && (
          <Grid
            sx={{
              p: 2,
              width: '100%',
              borderRadius: 10,
              bg: selected.length % 2 === 0 ? 'gray03' : 'none',
            }}
            columns={GRID}
            gap={2}
          >
            <Paragraph sx={{ lineHeight: 1.6 }}>{`Headquarter`}</Paragraph>
            <Paragraph sx={{ lineHeight: 1.6 }}>{`Change to`}</Paragraph>
            <Paragraph sx={{ lineHeight: 1.6 }}>
              {!headquarterState.country
                ? `Unfollow`
                : [headquarterState.country, headquarterState.city].filter(t => t).join(', ')}
            </Paragraph>
            <Paragraph sx={{ lineHeight: 1.6 }}>
              {!headquarterState.country
                ? ``
                : [reasonHQ.country, reasonHQ.city].filter(t => t).join(', ')}
            </Paragraph>
          </Grid>
        )}
        {isSelectedLocation &&
          locationState.map(({ location, option }, index) => {
            return (
              <Grid
                key={index}
                sx={{
                  p: 2,
                  width: '100%',
                  borderRadius: 10,
                  bg: fieldsArr.indexOf(`operation${index}`) % 2 === 0 ? 'gray03' : 'none',
                }}
                columns={GRID}
                gap={2}
              >
                <Paragraph sx={{ lineHeight: 1.6 }}>
                  {index === 0 ? `Other location` : ''}
                </Paragraph>
                <Paragraph sx={{ lineHeight: 1.6 }}>{`${
                  bulkEditOptions.find(({ value }) => value === option)?.label || ''
                }`}</Paragraph>
                <Paragraph sx={{ lineHeight: 1.6 }}>
                  {[location.country, location.city].filter(t => t).join(', ')}
                </Paragraph>
              </Grid>
            )
          })}
        {isSelectedAttachment && (
          <Grid
            sx={{
              p: 2,
              width: '100%',
              borderRadius: 10,
              bg: fieldsArr.indexOf(`attachment`) % 2 === 0 ? 'gray03' : 'none',
            }}
            columns={GRID}
            gap={2}
          >
            <Paragraph sx={{ lineHeight: 1.6 }}>{`Attachment`}</Paragraph>
            <Paragraph sx={{ lineHeight: 1.6 }}>{`${
              bulkEditOptions.find(({ value }) => value === attachmentOption)?.label || ''
            }`}</Paragraph>
            <Box>
              {attachmentOption === EBulkEditOptions.CLEAR_ALL ? (
                <Paragraph sx={{ lineHeight: 1.6 }}>{attachmentType || ''}</Paragraph>
              ) : (
                fileState.map((item, index) => (
                  <Paragraph sx={{ mb: index + 1 < locationState.length ? 2 : 0, lineHeight: 1.6 }}>
                    {item.name}
                  </Paragraph>
                ))
              )}
            </Box>
          </Grid>
        )}
      </Box>
    </>
  )
}

export default ConfirmOverview
