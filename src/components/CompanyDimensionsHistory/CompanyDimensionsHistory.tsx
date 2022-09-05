import { Box, Flex, Grid } from '@theme-ui/components'
import moment from 'moment'
import React from 'react'
import { Tooltip, Updating } from '..'
import { CompanyDimensionsOverridesHistory } from '../../graphql/query/getCompanyDimensionsOverridesHistory'
import { Value2LabelPipe } from '../../pages/CompanyForm/helpers'
import { expandStatus } from '../../pages/CompanyForm/mock'
import { Palette } from '../../theme'
import { EnumExpandStatusId } from '../../types/enums'
import { CELL_SIZE, DIMENSION_TYPE, TAXONOMY_HISTORY_DATE_FORMAT } from '../../utils/consts'
import { AppTable } from '../AppTable/AppTable'
import { Paragraph } from '../primitives'

type TCellData = CompanyDimensionsOverridesHistory

export enum EViewBy {
  SEQ = 'sequence',
  DEFAULT = 'default',
}

type Props = {
  data: TCellData[]
  loading?: boolean
  viewBy: EViewBy
}

export type { Props as CompanyDimensionHistoryProps }

const OVERRIDES_GRID = `
[user] repeat(6, ${CELL_SIZE}) [user-end] ${CELL_SIZE} 
[old] repeat(5, ${CELL_SIZE}) [old-end] ${CELL_SIZE} 
[new] repeat(5, ${CELL_SIZE}) [new-end] ${CELL_SIZE} 
[dimension] repeat(2, ${CELL_SIZE}) [dimension-end] ${CELL_SIZE} 
[isPrimary] repeat(2, ${CELL_SIZE}) [isPrimary-end] ${CELL_SIZE} 
[inputSource] repeat(2, ${CELL_SIZE}) [inputSource-end] ${CELL_SIZE} 
[selfDeclared] repeat(2, ${CELL_SIZE}) [selfDeclared-end] ${CELL_SIZE} 
[reason] repeat(4, ${CELL_SIZE}) [reason-end] ${CELL_SIZE}`

export default function CompanyDimensionHistory({
  data,
  loading = false,
  viewBy = EViewBy.DEFAULT,
}: Props) {
  const RENDER_FIELDS: { field: keyof TCellData; gridColumn: string; header: string }[] = [
    { field: 'user', header: 'User', gridColumn: `user /user-end` },
    { field: 'name', header: viewBy === EViewBy.SEQ ? 'Old' : 'Name', gridColumn: `old /old-end` },
    {
      field: 'new_value',
      header: viewBy === EViewBy.SEQ ? 'New' : 'Status',
      gridColumn: `new /new-end`,
    },
    { field: 'dimension', header: 'Type', gridColumn: `dimension /dimension-end` },
    { field: 'is_primary', header: 'Primary', gridColumn: `isPrimary /isPrimary-end` },
    { field: 'input_source', header: 'Input Source', gridColumn: `inputSource /inputSource-end` },
    {
      field: 'self_declared',
      header: 'Self Declared',
      gridColumn: `selfDeclared /selfDeclared-end`,
    },
    { field: 'comment', header: 'Reason', gridColumn: `reason /reason-end` },
  ]

  const cellProps = (item: TCellData) => {
    return { p: 8, opacity: item.new_value === EnumExpandStatusId.UNFOLLOWED ? 0.6 : undefined }
  }

  const renderCell = (field: keyof TCellData, gridColumn: string) => (
    item: TCellData,
    idx: number
  ) => {
    let value: string = `${item[field] || ''}`
    if (field === 'new_value') {
      value = `${Value2LabelPipe(expandStatus, item[field] || '') || ''}`
    } else if (field === 'is_primary') {
      value = item[field] === 1 ? 'Primary' : 'Auxiliary'
    }
    if (field === 'self_declared') {
      value = item[field] === 1 ? 'Yes' : 'No'
    }
    if (field === 'dimension') {
      if (item.category && item.dimension) value = DIMENSION_TYPE[item.category][item.dimension]
      else value = 'Category'
    }
    return (
      <Flex sx={{ gridColumn, ...cellProps(item), alignItems: 'center', gap: 1, width: '100%' }}>
        {field === 'user' ? (
          <Tooltip
            sx={{ ml: -3, maxWidth: 514 }}
            divSx={{ width: '100%' }}
            content={value}
            id={`${value}-${idx}`}
            isWhite
          >
            <Paragraph sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {value}
            </Paragraph>
          </Tooltip>
        ) : (
          <Paragraph>{value}</Paragraph>
        )}
      </Flex>
    )
  }

  const columns = RENDER_FIELDS.map(({ field, gridColumn }) => ({
    render: renderCell(field, gridColumn),
  }))

  const headers = RENDER_FIELDS.map(({ header, gridColumn }) => ({
    render: () => <Paragraph sx={{ gridColumn, color: 'grey', p: 8 }}>{header}</Paragraph>,
  }))

  const getDataToShow = (data: TCellData[], date: string) => {
    const dataByDate = data.filter(d => d.audit_timestamp === date)
    if (viewBy === EViewBy.DEFAULT) return dataByDate
    else if (viewBy === EViewBy.SEQ) {
      const unfollowItem = dataByDate.find(d => d.new_value === EnumExpandStatusId.UNFOLLOWED)
      const followItem = dataByDate.find(d => d.new_value === EnumExpandStatusId.FOLLOWING)
      const show =
        followItem && unfollowItem
          ? { ...unfollowItem, new_value: followItem?.name || '--' }
          : followItem && !unfollowItem
          ? { ...followItem, new_value: followItem?.name, name: '--' }
          : { ...(unfollowItem || {}), new_value: '--' }

      return [show]
    }
    return []
  }

  const dates = Array.from(new Set(data.map(d => d.audit_timestamp))).sort(
    (a, b) => +new Date(b!) - +new Date(a!)
  )

  if (loading) {
    return (
      <Box sx={{ minWidth: 500 }}>
        <Updating loading noPadding sx={{ p: 6, bg: Palette.mint, borderRadius: 12, my: 0 }} />
      </Box>
    )
  }

  return (
    <>
      <Grid gap={'1px'} columns={OVERRIDES_GRID} sx={{ alignItems: 'center' }}>
        {headers.map((h, idx) => (
          <React.Fragment key={idx}>{h.render()}</React.Fragment>
        ))}
      </Grid>
      <Box sx={{ maxHeight: '60vh', overflow: 'auto', pr: 10 }}>
        {dates.map((date, idx) => {
          return (
            <Box key={idx}>
              <Paragraph sx={{ p: 8, bg: Palette.gray03 }}>
                {moment(date).format(TAXONOMY_HISTORY_DATE_FORMAT)}
              </Paragraph>
              <AppTable
                grid={OVERRIDES_GRID}
                headers={[]}
                columns={columns}
                data={getDataToShow(data, date)}
              />
            </Box>
          )
        })}
      </Box>
    </>
  )
}
