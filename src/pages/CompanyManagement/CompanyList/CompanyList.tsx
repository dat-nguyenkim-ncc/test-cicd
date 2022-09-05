import { Box, Flex, Text } from '@theme-ui/components'
import React, { useState } from 'react'
import { Button, Checkbox, CompanyLogo, Popover, Tooltip } from '../../../components'
import { Paragraph } from '../../../components/primitives'
import { Palette } from '../../../theme'
import { FormOption } from '../../../types'
import { EnumExpandStatusId, EnumExpandStatus, Routes } from '../../../types/enums'
import { CheckList } from '../CompanyFilter'
import {
  CompanyManagementResult,
  columnOptions,
  DimensionTypeResult,
} from '../CompanyFilter/helpers'

type CompanyListProps = {
  data: CompanyManagementResult[]
  columnList: FormOption[]
  columnsFilter: FormOption[]
  companySelected: number[]
  setCompanySelected(state: number[]): void
  setColumns(state: FormOption[]): void
  applyColumns(): void
  isSelectedAll: boolean
  canBulkEdit: boolean
}

const maxWidth = 222

const CompanyList = ({
  data,
  columnList,
  columnsFilter,
  companySelected,
  setCompanySelected,
  setColumns,
  applyColumns,
  isSelectedAll,
}: CompanyListProps) => {
  const [isOpen, setOpen] = useState<boolean>(false)

  const getFctStatus = (value?: EnumExpandStatusId) => {
    return value === EnumExpandStatusId.FOLLOWING
      ? EnumExpandStatus.FOLLOWING
      : value === EnumExpandStatusId.DUPLICATED
      ? EnumExpandStatus.DUPLICATED
      : ''
  }
  const sortColumn = () => {
    let list = []
    if (columnList.find(c => c.value === 'website_url')) {
      list.push(columnList.find(c => c.value === 'website_url'))
    }
    if (columnList.find(c => c.value === 'country')) {
      list.push(columnList.find(c => c.value === 'country'))
    }
    return [
      ...list,
      ...columnList.filter(c => c.value !== 'website_url' && c.value !== 'country'),
    ] as FormOption[]
  }

  const isSelectedAllOnPage =
    data.filter(({ company_id }) => companySelected.includes(company_id)).length === data.length
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Flex>
                <Checkbox
                  sx={{ mr: 3 }}
                  onPress={() => {
                    if (
                      (!isSelectedAll && isSelectedAllOnPage) ||
                      (isSelectedAll &&
                        !!data.filter(({ company_id }) => companySelected.includes(company_id))
                          .length)
                    ) {
                      setCompanySelected(
                        companySelected.filter(
                          id => !data.some(({ company_id }) => company_id === id)
                        )
                      )
                    } else
                      setCompanySelected([
                        ...companySelected.filter(
                          id => !data.some(({ company_id }) => company_id === id)
                        ),
                        ...data.map(({ company_id }) => company_id),
                      ])
                  }}
                  checked={
                    isSelectedAll
                      ? !data.filter(({ company_id }) => companySelected.includes(company_id))
                          .length
                      : isSelectedAllOnPage
                  }
                  square
                />
                <Paragraph bold>Name</Paragraph>
              </Flex>
            </th>
            {sortColumn().map(({ label }, index) => (
              <th
                key={index}
                style={{
                  textAlign: 'left',
                  padding: 12,
                  minWidth: 175,
                  maxWidth: maxWidth,
                }}
              >
                <Paragraph bold>{label}</Paragraph>
              </th>
            ))}
            <td
              style={{
                textAlign: 'left',
                width: 48,
                backgroundColor: 'white',
                right: 0,
                position: 'sticky',
              }}
            >
              <Box
                sx={{
                  padding: 12,
                  borderRadius: '50% 0 0 50%',
                  borderLeft: `2px solid ${Palette.gray03}`,
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
                            setColumns(columnList)
                            setOpen(false)
                          }}
                          variant="invert"
                        />
                        <Button
                          sx={{ py: 2, px: 3, fontWeight: 'normal', borderRadius: 4 }}
                          label="Apply"
                          disabled={
                            JSON.stringify(
                              columnList.sort((a: FormOption, b: FormOption) =>
                                `${a.value}`.localeCompare(`${b.value}`)
                              )
                            ) ===
                            JSON.stringify(
                              columnsFilter.sort((a: FormOption, b: FormOption) =>
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
                        list={columnOptions}
                        listCheck={columnsFilter}
                        onChange={setColumns}
                      />
                    </Box>
                  }
                >
                  <Button icon="plus" size="tiny" iconSx={{ mt: '2px', ml: '2px' }} />
                </Popover>
              </Box>
            </td>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            return (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? Palette.gray03 : 'white',
                }}
              >
                <td
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    minWidth: 222,
                    maxWidth: maxWidth,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : 'white',
                    boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Checkbox
                      sx={{ mr: 3 }}
                      square
                      checked={
                        isSelectedAll
                          ? !companySelected.includes(c.company_id)
                          : companySelected.includes(c.company_id)
                      }
                      onPress={() => {
                        if (!companySelected.includes(c.company_id)) {
                          setCompanySelected([...companySelected, c.company_id])
                        } else setCompanySelected(companySelected.filter(id => id !== c.company_id))
                      }}
                    />
                    <Text
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 14,
                        '&:hover': { color: 'primary' },
                      }}
                      onClick={() =>
                        window.open(
                          Routes.COMPANY.replace(':id', `${c.company_id}`),
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          '& img': { width: '25px', height: '25px', borderRadius: '4px' },
                        }}
                      >
                        <CompanyLogo src={c.logo_bucket_url}></CompanyLogo>
                        <Text>{`${c.name}`}</Text>
                      </Box>
                    </Text>
                  </Flex>
                </td>
                {sortColumn().map(({ value }, index) => {
                  return (
                    <td
                      key={index}
                      style={{
                        textAlign: 'left',
                        padding: 12,
                        maxWidth: maxWidth,
                        overflowWrap: 'break-word',
                      }}
                    >
                      {['sector', 'value_chain', 'risk', 'cluster', 'category'].includes(
                        `${value}`
                      ) ? (
                        <>
                          {(c[value as keyof CompanyManagementResult] as DimensionTypeResult[])
                            ?.filter(e => e.is_primary)
                            .map((e, i) => (
                              <Paragraph key={i} sx={{ color: 'primary', mb: 1 }}>
                                {e.name}
                              </Paragraph>
                            ))}
                          {(c[value as keyof CompanyManagementResult] as DimensionTypeResult[])
                            ?.filter(e => !e.is_primary)
                            .map((e, i) => (
                              <Paragraph key={i} sx={{ mb: 1 }}>
                                {e.name}
                              </Paragraph>
                            ))}
                        </>
                      ) : (
                        <Tooltip
                          sx={{ ml: -3, maxWidth: 514 }}
                          content={`${c[value as keyof CompanyManagementResult] || ''}`}
                          id={`${value}-${i}`}
                        >
                          <Paragraph
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {value === 'fct_status_id'
                              ? getFctStatus(c.fct_status_id)
                              : `${c[value as keyof CompanyManagementResult] || ''}`}
                          </Paragraph>
                        </Tooltip>
                      )}
                    </td>
                  )
                })}
                <td
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    minWidth: 48,
                    maxWidth: 48,
                    borderRight: `2px solid ${Palette.gray03}`,
                    backgroundColor: i % 2 === 0 ? Palette.gray03 : 'white',
                  }}
                ></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}

export default CompanyList
