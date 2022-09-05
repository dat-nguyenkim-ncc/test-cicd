import React, { useContext, useState } from 'react'
import { Box, Flex, Grid, Image, SxStyleProp } from 'theme-ui'
import { BucketSignUrl, Button, Pill } from '..'
import { CQ_GRID } from '../CompanyItem/helpers'
import { Heading, Paragraph, Section } from '../primitives'
import Updating from '../Updating'
import moment from 'moment'
import { UserContext } from '../../context'
// import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import { IHandleActionPendingCRFn } from '../../hooks/useChangeRequest'
import {
  ColumnNames,
  TableNames,
  transformViewDate,
  Value2LabelPipe,
} from '../../pages/CompanyForm/helpers'
import { expandStatus, leadInvestor, newsStatus } from '../../pages/CompanyForm/mock'
import {
  getFundraisingValue,
  getHashImageFromURL,
  getLogoPublicUrl,
  getSelfDeclared,
} from '../../utils/helper'
import { ENumDataType } from '../../types/enums'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

const ItemProps = {
  wordBreak: 'break-word',
  p: 2,
  '& > a': { color: 'black50' },
} as SxStyleProp

const COLUMN_DATE = ['acquisition_date', 'funding_date', 'went_public_on', 'closed_date']

export const handleValue = (
  data: any,
  value: string | number
): string | number | React.ReactElement => {
  if (COLUMN_DATE.includes(data.columnName)) return transformViewDate(value) || 'NA'
  if (data.columnName === ColumnNames.HASHED_IMAGE) {
    if (value === 'NA') return <Paragraph>{value || ''}</Paragraph>
    if (getHashImageFromURL(String(value)) === 'NA') return <Paragraph>NA</Paragraph>
    if (!value) return <Pill sx={{ width: 'fit-content' }} label={`Empty`} variant="muted" />
    const url =
      data.tableName === TableNames.PEOPLE
        ? String(value)
        : getLogoPublicUrl(`${value}`, data.companyId)

    return <Image src={url} height={50} width={50} />
  }
  if (data.columnName === ColumnNames.FUNDRAISING && data.tableName === TableNames.FUNDRAISING) {
    return getFundraisingValue(+value)
  }
  if (value && value !== 'NA') {
    if (data.columnName === ColumnNames.FCT_STATUS_ID) {
      return Value2LabelPipe(expandStatus, value)
    }
    if (data.columnName === ColumnNames.NEWS_STATUS) {
      return Value2LabelPipe(newsStatus, value)
    }
    if (data.columnName === ColumnNames.LEAD_INVESTOR) {
      return Value2LabelPipe(leadInvestor, value)
    }

    if (data.columnName === ColumnNames.PITCH_DECK_BUCKET_KEY) {
      return <BucketSignUrl dataType={ENumDataType.FUNDRAISING} id={value as string} />
    }
    if (data.columnName === ColumnNames.CERTIFICATION_BUCKET_KEY) {
      return <BucketSignUrl dataType={ENumDataType.TECHNOLOGY} id={value as string} />
    }
    if (data.columnName === ColumnNames.LOGO_BUCKET_URL) {
      return <BucketSignUrl dataType={ENumDataType.USE_CASE} id={value as string} />
    }
    if (data.columnName === ColumnNames.USE_CASE_VALUE && data.isFile) {
      return <BucketSignUrl dataType={ENumDataType.USE_CASE} id={value as string} />
    }
  }
  return value || ''
}

export type IPengdingCQData = {
  dataOverrideId: number
  date: string
  user: string
  comment: string
  oldValue: string
  newValue: string
  tableName: string
  columnName: string
  companyId: number
  rowId: string
  source: string
  selfDeclared: boolean
  inputSource: string
}

type Props = {
  loading: boolean
  data: IPengdingCQData[]
  actionItem(isApproved: boolean, item: IPengdingCQData): void
  isCanApproveOrDecline: boolean
  handleActionPendingCR: IHandleActionPendingCRFn
  handleRejectAll(): void
}

const PendingChangeRequest = (props: Props) => {
  const {
    loading,
    data,
    actionItem,
    isCanApproveOrDecline,
    handleActionPendingCR,
    handleRejectAll,
  } = props

  const [pendingRequests, setPendingRequests] = useState<IPengdingCQData[]>([])

  const dataPending: IPengdingCQData[] = (data || []).filter(
    (item: IPengdingCQData) => !pendingRequests.some(i => item.dataOverrideId === i.dataOverrideId)
  )

  const [hasItemApproved, setHasItemApproved] = useState(false)

  const { user } = useContext(UserContext)

  const handleActions = (isApproved: boolean, data: IPengdingCQData | IPengdingCQData[]) => {
    const norm = (item: IPengdingCQData) => {
      return {
        date: item.date,
        user: item.user,
        oldValue: item.oldValue,
        newValue: item.newValue,
        comment: item.comment,
        dataOverrideId: item.dataOverrideId,
        tableName: item.tableName,
        columnName: item.columnName,
        companyId: +item.companyId,
        rowId: item.rowId,
        source: item.source,
        selfDeclared: item.selfDeclared,
        inputSource: item.inputSource,
      }
    }
    const d = Array.isArray(data) ? data.map(norm) : [norm(data)]

    setPendingRequests([...pendingRequests, ...d])
    d.map((item: IPengdingCQData) => {
      actionItem(isApproved, item)
      return null
    })
  }

  if (loading) {
    return (
      <Section sx={{ bg: 'rgb(240, 251, 247)', width: '100%', flex: 1, borderRadius: 10 }}>
        <Updating loading noPadding />
      </Section>
    )
  }

  if (!data?.length)
    return (
      <Section sx={{ flex: 1, width: '100%' }}>
        <Heading center as="h4" sx={{ opacity: 0.3 }}>
          NO DATA
        </Heading>
      </Section>
    )

  return (
    <Box>
      <Grid
        gap={'1px'}
        columns={CQ_GRID}
        sx={{
          alignItems: 'center',
          py: 2,
        }}
      >
        <Paragraph sx={{ gridColumn: 'date /date-end', color: 'grey', ...ItemProps }}>
          Date
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'user /user-end', color: 'grey', ...ItemProps }}>
          User
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'value /value-end', color: 'grey', ...ItemProps }}>
          Value
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'inputSource /inputSource-end', color: 'grey', ...ItemProps }}>
          Input Source
        </Paragraph>
        <Paragraph
          sx={{ gridColumn: 'selfDeclared /selfDeclared-end', color: 'grey', ...ItemProps }}
        >
          Self Declared
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'reason /reason-end', color: 'grey', ...ItemProps }}>
          Reason
        </Paragraph>

        {isCanApproveOrDecline && (
          <Button
            sx={{
              gridColumn: 'action /action-end',
              justifySelf: 'flex-end',
              color: 'primary',
              ...ItemProps,
            }}
            label="Reject All"
            variant="invert"
            onPress={e => {
              handleRejectAll()
            }}
          />
        )}
      </Grid>
      {(dataPending || []).map((item, index: number) => {
        const newValue = handleValue(item, item.newValue)
        return (
          <Flex key={index}>
            <Grid
              gap={'1px'}
              columns={CQ_GRID}
              sx={{
                alignItems: 'center',
                backgroundColor: index % 2 === 0 ? 'gray03' : 'transparent',
                py: 2,
              }}
            >
              <Paragraph sx={{ gridColumn: 'date /date-end', ...ItemProps }}>
                {moment(item.date).format(DEFAULT_VIEW_DATE_FORMAT)}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'user /user-end', ...ItemProps }}>
                {item.user || ''}
              </Paragraph>
              <Box sx={{ gridColumn: 'value /value-end', ...ItemProps, p: 0 }}>
                {typeof newValue === 'string' || typeof newValue === 'number' ? (
                  <Paragraph>{newValue}</Paragraph>
                ) : (
                  newValue
                )}
              </Box>
              <Paragraph sx={{ gridColumn: 'inputSource /inputSource-end', ...ItemProps }}>
                {item.inputSource || ''}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'selfDeclared /selfDeclared-end', ...ItemProps }}>
                {getSelfDeclared(item.selfDeclared)}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'reason /reason-end', ...ItemProps }}>
                {item.comment || ''}
              </Paragraph>
              <Flex
                sx={{
                  p: '5px 2px',
                  gridColumn: 'action /action-end',
                  justifyContent: 'flex-end',
                  gap: 3,
                }}
              >
                {isCanApproveOrDecline && (
                  <>
                    {!hasItemApproved && (
                      <Button
                        icon="tick"
                        size="small"
                        onPress={e => {
                          handleActions(true, item)
                          setHasItemApproved(true)
                        }}
                      />
                    )}
                    <Button
                      sx={{ bg: 'red' }}
                      color="white"
                      size="small"
                      icon="decline"
                      onPress={e => {
                        handleActions(false, item)
                      }}
                    />
                  </>
                )}
                {!isCanApproveOrDecline && item.user === user.email && (
                  <Button
                    sx={{ bg: 'red' }}
                    color="white"
                    size="small"
                    icon="decline"
                    onPress={e => {
                      handleActionPendingCR(
                        {
                          tableName: item.tableName,
                          columnName: item.columnName,
                          companyId: +item.companyId,
                          rowId: item.rowId,
                          source: item.source,
                        } as IPengdingCQData,
                        [item],
                        '',
                        false
                      )
                    }}
                  />
                )}
              </Flex>
            </Grid>
          </Flex>
        )
      })}
    </Box>
  )
}

export default PendingChangeRequest
