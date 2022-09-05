import { Box, Flex, Text } from '@theme-ui/components'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { Button, Pill, Popover, Tooltip } from '..'
import { ETLRunTimeContext } from '../../context'
import { transformViewDate } from '../../pages/CompanyForm/helpers'
import { CheckList } from '../../pages/CompanyManagement/CompanyFilter'
import { FindFintechsCompanyDetails } from '../../pages/FindFintechs/helpers'
import strings from '../../strings'
import { Palette } from '../../theme'
import { FormOption } from '../../types'
import { EPageKey, Routes } from '../../types/enums'
import { convertToInternationalCurrencySystem, localstorage, LocalstorageFields } from '../../utils'
import { TOOLTIP_SX } from '../../utils/consts'
import { Paragraph } from '../primitives'
import { Info } from '../Tag/helpers'

type CompanyListProps = {
  data: FindFintechsCompanyDetails[]
  columns: FormOption[]
  selectedColumns: FormOption[]
  setSelectedColumns(state: FormOption[]): void
  applyColumns(): void
}

export const findFintechColumns = {
  SOURCE: 'source',
  COMPANY_NAME: 'company_name',
  URL: 'url',
  SHORT_DESCRIPTION: 'short_description',
  LONG_DESCRIPTION: 'long_description',
  HQ_COUNTRY: 'hq_country',
  FOUNDED_YEAR: 'founded_year',
  STATUS: 'status',
  FTES_RANGE: 'ftes_range',
  FTES_EXACT: 'ftes_exact',
  TOTAL_EQUITY_FUNDING_USD: 'total_equity_funding_USD',
  LAST_FUNDING_DATE: 'last_funding_date',
  SUGGESTED_MAPPING: 'suggested_mapping',
  SCORE_DELTA: 'score_delta',
  EXTERNAL_TAGS: 'external_tags',
}

const allColumns: FormOption[] = [
  { label: 'Website', value: findFintechColumns.URL },
  { label: 'Total Equity Funding', value: findFintechColumns.TOTAL_EQUITY_FUNDING_USD },
  { label: 'Source', value: findFintechColumns.SOURCE },
  { label: 'Founded year', value: findFintechColumns.FOUNDED_YEAR },
  { label: 'Status', value: findFintechColumns.STATUS },
  { label: 'FTEs range', value: findFintechColumns.FTES_RANGE },
  { label: 'FTEs exact', value: findFintechColumns.FTES_EXACT },
  { label: 'Short description', value: findFintechColumns.SHORT_DESCRIPTION },
  { label: 'Long description', value: findFintechColumns.LONG_DESCRIPTION },
  { label: 'Last funding date', value: findFintechColumns.LAST_FUNDING_DATE },
  { label: 'Suggested mapping', value: findFintechColumns.SUGGESTED_MAPPING },
  { label: 'Score delta', value: findFintechColumns.SCORE_DELTA },
  { label: 'External tags', value: findFintechColumns.EXTERNAL_TAGS },
]

const maxWidth = 222

const FindFintechsList = ({
  data,
  columns,
  selectedColumns,
  setSelectedColumns,
  applyColumns,
}: CompanyListProps) => {
  const history = useHistory()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [isOpen, setOpen] = useState<boolean>(false)

  const showColumns = React.useMemo(() => {
    return allColumns.filter(c => columns.map(({ value }) => value).includes(c.value))
  }, [columns])

  const gotoDetail = React.useCallback((id: string, source: string) => {
    window.open(
      Routes.COMPANY_NEW.replace(':id', `${id}`).replace(':source', source.toString()),
      '_blank',
      'noopener,noreferrer'
    )
  }, [])

  const gotoSearch = React.useCallback(
    (name: string, id: string) => {
      if (!checkTimeETL()) return
      localstorage.set(
        LocalstorageFields.COMPANY_AGGREGATE,
        JSON.stringify({
          internal: {},
          external: { [id]: true },
        })
      )
      history.push(
        Routes.SEARCH_QUERY.replace(':query', encodeURIComponent(name)).concat(
          `?page=${EPageKey.FIND_FINTECHS}`
        )
      )
    },
    [checkTimeETL, history]
  )

  const handleColumns = (column: string | number, value: string | number): string => {
    switch (column) {
      case findFintechColumns.TOTAL_EQUITY_FUNDING_USD:
        return convertToInternationalCurrencySystem((value || '0').toString())
      case findFintechColumns.LAST_FUNDING_DATE:
        return transformViewDate((value || '').toString())
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
                minWidth: 222,
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
                  {value === findFintechColumns.SCORE_DELTA && (
                    <Tooltip
                      content={strings.scoreDeltaTooltip}
                      isShow
                      sx={TOOLTIP_SX}
                      containerSx={{ left: '-20px', top: '12px' }}
                    >
                      <Flex sx={{ ml: 1 }}>
                        <Info />
                      </Flex>
                    </Tooltip>
                  )}
                </Flex>
              </th>
            ))}
            <td
              style={{
                width: 84,
                backgroundColor: 'white',
                right: 0,
                position: 'sticky',
              }}
            >
              <Flex sx={{ justifyContent: 'end' }}>
                <Box
                  sx={{
                    padding: 12,
                    borderRadius: '50% 0 0 50%',
                    borderLeft: `2px solid ${Palette.gray03}`,
                    width: 'fit-content',
                  }}
                >
                  <Popover
                    open={isOpen}
                    setOpen={setOpen}
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
                              setOpen(false)
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
                              setOpen(false)
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
            </td>
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
                      <Box sx={{ minWidth: 41 }}>
                        {c.countryCode && (
                          <Pill
                            sx={{ height: 28, width: 28, m: 0 }}
                            alt={c.company_name}
                            flag={c.countryCode}
                          />
                        )}
                      </Box>
                      <Text
                        sx={{
                          flex: 1,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: 14,
                          '&:hover': { color: 'primary' },
                        }}
                        onClick={() => {
                          gotoDetail(c.external_id, c.source)
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '& img': { width: '25px', height: '25px', borderRadius: '4px' },
                          }}
                        >
                          <Text>{`${c.company_name}`}</Text>
                        </Box>
                      </Text>
                    </Flex>
                  </Box>
                </td>
                {showColumns.map(({ value }, index) => {
                  const text = handleColumns(value, c[value as keyof FindFintechsCompanyDetails])
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
                    textAlign: 'left',
                    width: 84,
                    borderRight: `2px solid ${Palette.gray03}`,
                    position: 'sticky',
                    right: 0,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                    padding: 0,
                  }}
                >
                  <Box sx={{ bg: 'white' }}>
                    <Flex
                      sx={{
                        backgroundColor: i % 2 === 0 ? Palette.gray03 : Palette.gray02,
                        borderRadius: '0 10px 10px 0',
                        py: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        onPress={() => {
                          gotoSearch(c.company_name, c.external_id)
                        }}
                        sx={{ color: 'primary', px: 4, py: 2, bg: 'white', mr: 8 }}
                        variant="outline"
                        label={'Add'}
                        color="black50"
                      />
                    </Flex>
                  </Box>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}

export default FindFintechsList
