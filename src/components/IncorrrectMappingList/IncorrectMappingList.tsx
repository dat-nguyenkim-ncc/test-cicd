import { Box, Flex } from '@theme-ui/components'
import moment from 'moment'
import { default as React, useState } from 'react'
import { CompanyLink, Switch, Tooltip } from '..'
import { CheckList } from '../../pages/CompanyManagement/CompanyFilter'
import { allColumns, EColumn, IncorrectMappingDetails } from '../../pages/IncorrectMapping/helpers'
import strings from '../../strings'
import { Palette } from '../../theme'
import { FormOption } from '../../types'
import { convertToInternationalCurrencySystem } from '../../utils'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'
import Button from '../Button'
import Popover from '../Popover'
import { Paragraph } from '../primitives'
import { Info } from '../Tag/helpers'

type IncorrectMappingListProps = {
  setMessageModal: (input: {
    type?: 'error' | 'loading' | 'success'
    title?: string
    content?: string
  }) => void
  data: IncorrectMappingDetails[]
  columns: FormOption[]
  selectedColumns: FormOption[]
  setSelectedColumns(state: FormOption[]): void
  applyColumns(): void
  onMap(company: IncorrectMappingDetails): void
  handleToggle(company: IncorrectMappingDetails): void
}

const maxWidth = 222

const IncorrectMappingList = ({
  data,
  columns,
  handleToggle,
  setMessageModal,
  selectedColumns,
  setSelectedColumns,
  applyColumns,
  onMap,
}: IncorrectMappingListProps) => {
  const [isOpenColumnSelect, setOpenColumnSelect] = useState<boolean>(false)

  const showColumns = React.useMemo(() => {
    return allColumns.filter(c => columns.map(({ value }) => value).includes(c.value))
  }, [columns])

  const handleColumns = (column: string | number, value: string | number): string => {
    switch (column) {
      case EColumn.LAST_FUNDING_DATE:
        return (value || '').toString()
          ? moment((value || '').toString()).format(DEFAULT_VIEW_DATE_FORMAT)
          : ''
      case EColumn.TOTAL_EQUITY_FUNDING:
        return convertToInternationalCurrencySystem((value || '0').toString())
      default:
        return (value || '').toString()
    }
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: 12,
                minWidth: 100,
                maxWidth: maxWidth,
                position: 'sticky',
                left: 0,
                background: 'white',
              }}
            >
              <Flex>
                <Paragraph bold>Company</Paragraph>
              </Flex>
            </th>
            {showColumns.map(({ label, value }, index) => (
              <th
                key={index}
                style={{
                  textAlign: 'left',
                  padding: 12,
                  minWidth: 175,
                  maxWidth: maxWidth,
                }}
              >
                <Flex sx={{ alignItems: 'center' }}>
                  <Paragraph bold>{label}</Paragraph>
                  {value === EColumn.SCORE_DELTA && (
                    <Tooltip
                      content={strings.scoreDeltaTooltip}
                      isShow
                      containerSx={{
                        left: '-20px',
                        top: '12px',
                      }}
                    >
                      <Flex sx={{ ml: 1 }}>
                        <Info />
                      </Flex>
                    </Tooltip>
                  )}
                </Flex>
              </th>
            ))}
            <th
              style={{
                padding: 12,
                position: 'sticky',
                right: 125,
                background: 'white',
              }}
            />
            <th
              style={{
                textAlign: 'left',
                padding: 12,
                paddingRight: 0,
                width: 125,
                maxWidth: 125,
                position: 'sticky',
                right: 0,
                background: 'white',
              }}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Paragraph bold sx={{ marginRight: '6px' }}>
                  Reviewed
                </Paragraph>
                <Box
                  sx={{
                    padding: 12,
                    borderRadius: '50% 0 0 50%',
                    borderLeft: `2px solid ${Palette.gray03}`,
                    width: 'fit-content',
                  }}
                >
                  <Popover
                    open={isOpenColumnSelect}
                    setOpen={setOpenColumnSelect}
                    positions={['bottom', 'top']}
                    align="end"
                    noArrow
                    content={
                      <Box
                        sx={{
                          mt: 3,
                          p: 3,
                          bg: 'white',
                          border: `solid 1px ${Palette.gray01}`,
                          borderRadius: 8,
                        }}
                      >
                        <Flex sx={{ alignItems: 'center' }}>
                          <Paragraph sx={{ flex: 1 }} bold>
                            Edit Columns
                          </Paragraph>
                          <Button
                            label="Cancel"
                            sx={{ color: 'black', ml: 4 }}
                            onPress={() => {
                              setSelectedColumns(columns)
                              setOpenColumnSelect(false)
                            }}
                            variant="invert"
                          />
                          <Button
                            sx={{ py: 2, px: 3, fontWeight: 'normal', borderRadius: 4 }}
                            label="Apply"
                            disabled={
                              JSON.stringify(
                                columns.sort((a: FormOption, b: FormOption) =>
                                  `${a.value}`.localeCompare(`${b.value}`)
                                )
                              ) ===
                              JSON.stringify(
                                selectedColumns.sort((a: FormOption, b: FormOption) =>
                                  `${a.value}`.localeCompare(`${b.value}`)
                                )
                              )
                            }
                            onPress={() => {
                              applyColumns()
                              setOpenColumnSelect(false)
                            }}
                          />
                        </Flex>
                        <CheckList
                          list={allColumns}
                          listCheck={selectedColumns}
                          onChange={setSelectedColumns}
                        />
                      </Box>
                    }
                  >
                    <Button icon="plus" size="tiny" iconSx={{ mt: '2px', ml: '2px' }} />
                  </Popover>
                </Box>
              </Flex>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            return (
              <tr key={i}>
                <td
                  style={{
                    textAlign: 'left',
                    minWidth: 222,
                    maxWidth: maxWidth,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                    borderRadius: '10px 0 0 10px',
                  }}
                >
                  <Box sx={{ bg: 'white' }}>
                    <Flex
                      sx={{
                        backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                        borderRadius: '10px 0 0 10px',
                        padding: 12,
                        alignItems: 'center',
                      }}
                    >
                      <CompanyLink
                        company={{
                          company_id: +c.company_id,
                          name: c.name,
                          logo_bucket_url: c.logo_url,
                          website_url: c.website_url,
                        }}
                      />
                    </Flex>
                  </Box>
                </td>
                {showColumns.map(({ value }, index) => {
                  const text = handleColumns(value, c[value as keyof IncorrectMappingDetails])
                  return (
                    <td
                      key={index}
                      style={{
                        textAlign: 'left',
                        padding: 12,
                        maxWidth: maxWidth,
                        overflowWrap: 'break-word',
                        backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                      }}
                    >
                      <Tooltip sx={{ ml: -3, maxWidth: 514 }} content={text} id={`${value}-${i}`}>
                        <Paragraph
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {text}
                        </Paragraph>
                      </Tooltip>
                    </td>
                  )
                })}
                <td
                  style={{
                    position: 'sticky',
                    right: 125,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                    padding: 0,
                  }}
                >
                  <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                      onPress={() => onMap(c)}
                      sx={{ color: 'primary', px: 4, py: 2, bg: 'white' }}
                      variant="outline"
                      label={'Map'}
                      color="black50"
                    />
                  </Flex>
                </td>
                <td
                  style={{
                    textAlign: 'left',
                    width: 125,
                    maxWidth: 125,
                    position: 'sticky',
                    right: 0,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                    padding: 0,
                  }}
                >
                  <Flex sx={{ justifyContent: 'center' }}>
                    <Switch
                      sx={{ width: 'fit-content', marginRight: '36px' }}
                      checked={!!c.reviewed}
                      disabled={!!c.reviewed}
                      onToggle={() => handleToggle(c)}
                    />
                  </Flex>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}

export default IncorrectMappingList
