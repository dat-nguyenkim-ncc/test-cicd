import moment from 'moment'
import React from 'react'
import { Box, Flex, Label, SxStyleProp } from 'theme-ui'
import { Dropdown, Updating, Tooltip, Icon } from '../../../components'
import { Paragraph, Section } from '../../../components/primitives'
import { Palette } from '../../../theme'
import { FormOption } from '../../../types'
import { formatLargeNumber } from '../../../utils'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../utils/consts'
import {
  healthCheckTableThread,
  HealthCheckTableResult,
  formatNumber,
  TABLE_TIME_FRAME_OPTIONS,
  HEALTH_CHECK_TABLE_GROUPS,
  HEALTH_CHECK_TABLE_GROUPS_THREADS,
} from '../helpers'

const TABLE_CELL_STYLES: React.CSSProperties = {
  textAlign: 'center',
  padding: 12,
  minWidth: 175,
  maxWidth: 222,
}
const STATIC_SOURCES = 'Companies with a bcg only source'
const STATIC_OVERVIEW_SOURCES = 'Companies without a crunchbase or dealroom source'

const TABLE_BORDER_STYLE = '1px solid #eaeaea';

const CONVERT_NUMBER = ['mapped_funding', 'unmapped_funding']

const LAST_GROUP_THREAD = Object.keys(HEALTH_CHECK_TABLE_GROUPS_THREADS)[
  Object.keys(HEALTH_CHECK_TABLE_GROUPS_THREADS).length - 1
]

const LAST_COLUMN = HEALTH_CHECK_TABLE_GROUPS_THREADS[LAST_GROUP_THREAD][
  HEALTH_CHECK_TABLE_GROUPS_THREADS[LAST_GROUP_THREAD].length - 1
]

type HealthCheckTableProps = {
  tableData: HealthCheckTableResult[]
  tableLoading: boolean
  timeFrameValue: FormOption['value']
  hanldeTimeFrameOptionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  sx?: SxStyleProp | undefined
}

const HealthCheckHeader = (props: { group: string }) => {
  const columns = HEALTH_CHECK_TABLE_GROUPS_THREADS[props['group']]
  return (
    <>
      {columns.map((column, index) => (
        <th
          key={props['group'] + index + '-col'}
          scope="col"
          style={{
            ...TABLE_CELL_STYLES,
            borderRight:
              column === LAST_COLUMN || column !== columns[columns.length - 1]
                ? 'none'
                : TABLE_BORDER_STYLE,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paragraph bold>
              {healthCheckTableThread[column as keyof HealthCheckTableResult]}
            </Paragraph>
            {column === 'static_overview_sources' || column === 'static_sources' ? (
              <Box ml={2} sx={{ flexShrink: 0 }}>
                <Tooltip
                  content={column === 'static_sources' ? STATIC_SOURCES : STATIC_OVERVIEW_SOURCES}
                  sx={{
                    fontSize: '0.9em',
                    maxWidth: '400px',
                    lineHeight: '1.5em',
                    wordBreak: 'break-word',
                  }}
                  isShow
                >
                  <Icon icon="info" color="white" />
                </Tooltip>
              </Box>
            ) : null}
          </div>
        </th>
      ))}
    </>
  )
}

const HealthCheckList = (props: { group: string; data: HealthCheckTableResult }) => {
  const columns = HEALTH_CHECK_TABLE_GROUPS_THREADS[props['group']]

  return (
    <>
      {columns.map((column, index) => {
        const value = props['data'][column as keyof HealthCheckTableResult]
        return (
          <th
            key={props['group'] + index + '-cell'}
            style={{
              ...TABLE_CELL_STYLES,
              borderRight:
                column === LAST_COLUMN || column !== columns[columns.length - 1]
                  ? 'none'
                  : TABLE_BORDER_STYLE,
            }}
          >
            <Paragraph>
              {CONVERT_NUMBER.includes(column)
                ? formatNumber(value || '')
                : formatLargeNumber(value || '')
              }
            </Paragraph>
          </th>
        )
      })}
    </>
  )
}

const HealthCheckTable = ({
  tableData,
  tableLoading,
  timeFrameValue,
  hanldeTimeFrameOptionChange,
  sx,
}: HealthCheckTableProps) => {
  return (
    <Section sx={{ ...sx }}>
      {/* Time frame */}
      <Flex sx={{ flexDirection: 'row', mb: 3 }}>
        {/* Offset left auto */}
        <Box sx={{ flex: '1 1 auto' }}> </Box>

        {/* Time frame options */}
        <Flex sx={{ flexWrap: 'nowrap' }}>
          <Label htmlFor="tableTimeFrame" sx={{ pt: 3, pr: 3 }}>
            Time frame
          </Label>
          <Dropdown
            // overide minWidth 150px
            sx={{ minWidth: 'auto', mr: 1 }}
            name="tableTimeFrame"
            value={timeFrameValue}
            onChange={hanldeTimeFrameOptionChange}
            options={TABLE_TIME_FRAME_OPTIONS}
          />
        </Flex>
      </Flex>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        {tableLoading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : (
          <table style={{ borderCollapse: 'collapse', display: 'table-cell' }}>
            <thead>
              <tr style={{ backgroundColor: Palette.primary, color: Palette.white }}>
                {/* Sticky data column */}
                <th
                  scope="colgroup"
                  colSpan={1}
                  rowSpan={2}
                  style={{
                    ...TABLE_CELL_STYLES,
                    position: 'sticky',
                    backgroundColor: Palette.primary,
                    left: 0,
                    boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.1)',
                    borderRight: TABLE_BORDER_STYLE,
                  }}
                >
                  <Paragraph bold>Date</Paragraph>
                </th>

                {Object.keys(HEALTH_CHECK_TABLE_GROUPS).map((key, index) => (
                  <th
                    colSpan={HEALTH_CHECK_TABLE_GROUPS_THREADS[key].length}
                    scope="colgroup"
                    key={index + '-colgroup'}
                    style={{
                      ...TABLE_CELL_STYLES,
                      borderRight: key !== LAST_GROUP_THREAD ? TABLE_BORDER_STYLE : 'none',
                      borderBottom: TABLE_BORDER_STYLE,
                    }}
                  >
                    <Paragraph bold>
                      {HEALTH_CHECK_TABLE_GROUPS[key as keyof typeof HEALTH_CHECK_TABLE_GROUPS]}
                    </Paragraph>
                  </th>
                ))}
              </tr>
              <tr
                style={{
                  backgroundColor: Palette.primary,
                  color: Palette.white,
                }}
              >
                {Object.keys(HEALTH_CHECK_TABLE_GROUPS).map((key, index) => (
                  <HealthCheckHeader key={key + index} group={key} />
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr
                  key={index + '-row'}
                  style={{
                    backgroundColor: index % 2 === 0 ? Palette.gray03 : 'white',
                  }}
                >
                  <th
                    style={{
                      ...TABLE_CELL_STYLES,
                      position: 'sticky',
                      left: 0,
                      background: index % 2 === 0 ? Palette.gray03 : 'white',
                      boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.1)',
                      borderRight: TABLE_BORDER_STYLE,
                    }}
                  >
                    <Paragraph>{moment(item.date).format(DEFAULT_VIEW_DATE_FORMAT)}</Paragraph>
                  </th>

                  {Object.keys(HEALTH_CHECK_TABLE_GROUPS).map((key, index) => (
                    <HealthCheckList key={key + index} group={key} data={item} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </Section>
  )
}

export default HealthCheckTable
