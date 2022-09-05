import React from 'react'
import { Box, Flex, Grid, Image, SxStyleProp } from 'theme-ui'
import { OverridesData, ViewInterface } from '../../types'
import { OVERRIDES_GRID } from '../CompanyItem/helpers'
import { Heading, Paragraph, Section } from '../primitives'
import Updating from '../Updating'
import moment from 'moment'
import strings from '../../strings'
import {
  ColumnNames,
  FieldNames,
  TableNames,
  Value2LabelPipe,
} from '../../pages/CompanyForm/helpers'
import { expandStatus, leadInvestor, newsStatus } from '../../pages/CompanyForm/mock'
import { AcquisitionFieldNames } from '../AcquisitionRound/AcquisitionRound'
import { getFundraisingValue, getLogoPublicUrl, getSelfDeclared } from '../../utils/helper'
import { Pill, BucketSignUrl } from '..'
import { ENumDataType } from '../../types/enums'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

type Props = ViewInterface<{
  loading?: boolean
  data?: OverridesData[]
  rowId?: string
}>

const ItemProps = {
  wordBreak: 'break-word',
  p: 2,
  '& > a': { color: 'black50' },
} as SxStyleProp

const dateColumns: string[] = [
  FieldNames?.closed_date,
  AcquisitionFieldNames.acquisition_date,
  'funding_date',
  'went_public_on',
]

export const isDateColumns = (columnName: string) => dateColumns.includes(columnName)

export const mapOverrideHistoryFn = (item: OverridesData) => {
  const date = moment(item.date).format(DEFAULT_VIEW_DATE_FORMAT)

  const normValueFn = (value: string) => {
    return item.columnName === FieldNames.fct_status_id
      ? Value2LabelPipe(expandStatus, value)
      : item.columnName === ColumnNames.NEWS_STATUS
      ? Value2LabelPipe(newsStatus, value)
      : isDateColumns(item.columnName)
      ? moment(value).format(DEFAULT_VIEW_DATE_FORMAT) !== 'Invalid date'
        ? moment(value).format(DEFAULT_VIEW_DATE_FORMAT)
        : ''
      : item.columnName === ColumnNames.LEAD_INVESTOR
      ? Value2LabelPipe(leadInvestor, value)
      : value
  }
  return {
    ...item,
    newValue: normValueFn(item.newValue),
    oldValue: normValueFn(item.oldValue),
    date: date !== 'Invalid date' ? date : item.date,
  }
}

const OverridesHistory = ({ loading, sx, data: propsData, rowId }: Props) => {
  const { overridesHistory: copy } = strings

  const data = (propsData && propsData.length > 0
    ? [
        ...propsData,
        {
          columnName: propsData[propsData.length - 1].columnName,
          date: propsData[propsData.length - 1].date,
          tableName: propsData[propsData.length - 1].tableName,
          user: propsData[propsData.length - 1].user,
          newValue: propsData[propsData.length - 1].oldValue,
          companyId: propsData[propsData.length - 1].companyId,
          isFile: propsData[propsData.length - 1].isFile,
          selfDeclared: false,
          inputSource: '',
          oldValue: '',
          comment: '',
        },
      ]
    : []
  ).map(i => {
    return mapOverrideHistoryFn(i)
  })

  const getNewValue = (item: any) => {
    if (item.columnName === ColumnNames.HASHED_IMAGE) {
      return (
        <Box sx={{ gridColumn: 'value /value-end', ...ItemProps }}>
          {!item.newValue || item.newValue === 'NA' ? (
            <Pill sx={{ width: 'fit-content' }} label={`Empty`} variant="muted" />
          ) : (
            <Image
              src={
                item.tableName === TableNames.PEOPLE
                  ? `${item.newValue}`
                  : getLogoPublicUrl(`${item.newValue}`, item.companyId)
              }
              height={50}
              width={50}
            />
          )}
        </Box>
      )
    }
    if (item.columnName === ColumnNames.FUNDRAISING && item.tableName === TableNames.FUNDRAISING) {
      return (
        <Paragraph sx={{ gridColumn: 'value /value-end', ...ItemProps }}>
          {getFundraisingValue(+item.newValue)}
        </Paragraph>
      )
    }
    if (item.newValue && item.newValue !== 'NA') {
      const sharedProps = {
        sx: { gridColumn: 'value /value-end', ...ItemProps },
        id: item.newValue as string,
      }
      if (item.columnName === ColumnNames.PITCH_DECK_BUCKET_KEY) {
        return <BucketSignUrl dataType={ENumDataType.FUNDRAISING} {...sharedProps} />
      }
      if (item.columnName === ColumnNames.CERTIFICATION_BUCKET_KEY) {
        return <BucketSignUrl dataType={ENumDataType.TECHNOLOGY} {...sharedProps} />
      }
      if (item.columnName === ColumnNames.LOGO_BUCKET_URL) {
        return <BucketSignUrl dataType={ENumDataType.USE_CASE} {...sharedProps} />
      }
      if (item.columnName === ColumnNames.USE_CASE_VALUE && item.isFile) {
        return <BucketSignUrl dataType={ENumDataType.USE_CASE} {...sharedProps} />
      }
    }
    return (
      <Paragraph sx={{ gridColumn: 'value /value-end', ...ItemProps }}>{item.newValue}</Paragraph>
    )
  }

  if (loading)
    return (
      <Section sx={{ bg: 'rgb(240, 251, 247)', width: '100%', flex: 1, borderRadius: 10 }}>
        <Updating loading noPadding />
      </Section>
    )
  if (data?.length === 0)
    return (
      <Section sx={{ flex: 1, width: '100%' }}>
        <Heading center as="h4" sx={{ opacity: 0.3 }}>
          {copy.noData}
        </Heading>
      </Section>
    )
  return (
    <Box>
      <Grid
        gap={'1px'}
        columns={OVERRIDES_GRID}
        sx={{
          alignItems: 'center',
          py: 2,
        }}
      >
        <Paragraph sx={{ gridColumn: 'date /date-end', color: 'grey', ...ItemProps }}>
          {copy.columns.date}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'user /user-end', color: 'grey', ...ItemProps }}>
          {copy.columns.user}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'value /value-end', color: 'grey', ...ItemProps }}>
          {copy.columns.value}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'inputSource /inputSource-end', color: 'grey', ...ItemProps }}>
          {copy.columns.inputSource}
        </Paragraph>
        <Paragraph
          sx={{ gridColumn: 'selfDeclared /selfDeclared-end', color: 'grey', ...ItemProps }}
        >
          {copy.columns.selfDeclared}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'reason /reason-end', color: 'grey', ...ItemProps }}>
          {copy.columns.reason}
        </Paragraph>
      </Grid>
      {data?.map((item, index) => (
        <Flex key={index}>
          <Grid
            gap={'1px'}
            columns={OVERRIDES_GRID}
            sx={{
              alignItems: 'center',
              backgroundColor: index % 2 === 0 ? 'gray03' : 'transparent',
              py: 2,
            }}
          >
            <Paragraph sx={{ gridColumn: 'date /date-end', ...ItemProps }}>{item.date}</Paragraph>
            <Paragraph sx={{ gridColumn: 'user /user-end', ...ItemProps }}>
              {item.user || ''}
            </Paragraph>
            {getNewValue(item)}
            <Paragraph sx={{ gridColumn: 'inputSource /inputSource-end', ...ItemProps }}>
              {item.inputSource || ''}
            </Paragraph>
            <Paragraph sx={{ gridColumn: 'selfDeclared /selfDeclared-end', ...ItemProps }}>
              {getSelfDeclared(item.selfDeclared)}
            </Paragraph>
            <Paragraph sx={{ gridColumn: 'reason /reason-end', ...ItemProps }}>
              {item.comment || ''}
            </Paragraph>
          </Grid>
        </Flex>
      ))}
    </Box>
  )
}

export default OverridesHistory
