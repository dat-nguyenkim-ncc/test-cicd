import { Box, Flex, Grid, Label } from '@theme-ui/components'
import React from 'react'
import { SxStyleProp } from 'theme-ui'
import strings from '../../strings'
import { OverridesData, ViewInterface } from '../../types'
import { getSelfDeclared, getValueDate } from '../../utils/helper'
import { CONFIRM_CHANGE_REQUEST } from '../CompanyItem/helpers'
import { mapOverrideHistoryFn } from '../OverridesHistory/OverridesHistory'
import { Paragraph } from '../primitives'
import TextField from '../TextField'
import { handleValue } from './PendingChangeRequest'

const ItemProps = {
  wordBreak: 'break-word',
  p: 2,
  '& > a': { color: 'black50' },
} as SxStyleProp

type Props = ViewInterface<{
  setRejectReason(s: string): void
  rejectReason: string
  itemDeclineds: OverridesData[]
}>

const ItemDeclined = (props: Props) => {
  const { itemDeclineds, sx } = props
  return (
    <Box sx={{ ...sx }}>
      <Label sx={{ fontSize: 16 }}>{strings.rejectedRequests}</Label>
      <Grid
        gap={'1px'}
        columns={CONFIRM_CHANGE_REQUEST}
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
        <Paragraph
          sx={{ gridColumn: 'previous-value /previous-value-end', color: 'grey', ...ItemProps }}
        >
          Previous Value
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'new-value /new-value-end', color: 'grey', ...ItemProps }}>
          New Value
        </Paragraph>
        <Paragraph
          sx={{ gridColumn: 'input-source /input-source-end', color: 'grey', ...ItemProps }}
        >
          Input Source
        </Paragraph>
        <Paragraph
          sx={{ gridColumn: 'self-declared /self-declared-end', color: 'grey', ...ItemProps }}
        >
          Self Declared
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'reason /reason-end', color: 'grey', ...ItemProps }}>
          Reason
        </Paragraph>
      </Grid>
      {(itemDeclineds || []).map(mapOverrideHistoryFn).map((item, index: number) => {
        const oldValue = handleValue(item, item.oldValue)
        const newValue = handleValue(item, item.newValue)
        return (
          <Flex key={index}>
            <Grid
              gap={'1px'}
              columns={CONFIRM_CHANGE_REQUEST}
              sx={{
                alignItems: 'center',
                backgroundColor: index % 2 === 0 ? 'gray03' : 'transparent',
                py: 2,
              }}
            >
              <Paragraph sx={{ gridColumn: 'date /date-end', ...ItemProps }}>
                {getValueDate(item.date)}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'user /user-end', ...ItemProps }}>
                {item.user || ''}
              </Paragraph>
              <Box sx={{ gridColumn: 'previous-value /previous-value-end', ...ItemProps }}>
                {typeof oldValue === 'string' || typeof oldValue === 'number' ? (
                  <Paragraph>{oldValue}</Paragraph>
                ) : (
                  oldValue
                )}
              </Box>
              <Box sx={{ gridColumn: 'new-value /new-value-end', ...ItemProps }}>
                {typeof newValue === 'string' || typeof newValue === 'number' ? (
                  <Paragraph>{newValue}</Paragraph>
                ) : (
                  newValue
                )}
              </Box>
              <Paragraph sx={{ gridColumn: 'input-source /input-source-end', ...ItemProps }}>
                {item.inputSource}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'self-declared /self-declared-end', ...ItemProps }}>
                {getSelfDeclared(item.selfDeclared)}
              </Paragraph>
              <Paragraph sx={{ gridColumn: 'reason /reason-end', ...ItemProps }}>
                {item.comment || ''}
              </Paragraph>
            </Grid>
          </Flex>
        )
      })}
      <TextField
        sx={{ mt: 4 }}
        type="textarea"
        label="Enter the reason to reject"
        name="rejectReason"
        required
        value={props.rejectReason}
        onChange={e => {
          props.setRejectReason(e.target.value as string)
        }}
      />
    </Box>
  )
}

export default ItemDeclined
