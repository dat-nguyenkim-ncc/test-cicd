import React, { useState } from 'react'
import { CheckList, CollapseHeader, SearchBox, YearRange } from '.'
import { Box, Divider, Flex } from '@theme-ui/components'
import { Checkbox, Chips, Collapse, InputRange, Popover, Updating } from '../../../components'
import { investor } from '../../CompanyForm/mock'
import { blankText, MnAFilterType } from './helpers'
import { reasonPopverZIndex } from '../../../utils/consts'
import { Palette } from '../../../theme'
import { useLazyQuery } from '@apollo/client'
import { searchInvestorByName } from '../../CompanyForm/graphql'
import { FormOption } from '../../../types'
import { InvestorItemType } from '../../../components/InvestorForm'
import { Paragraph } from '../../../components/primitives'
import CombinationForm from './CombinationForm'

type MnAProps = {
  state: MnAFilterType
  onChange(state: MnAFilterType): void
}

const MnA = ({ state, onChange }: MnAProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [options, setOptions] = useState<FormOption[]>([])

  // GRAPHQL
  const [searchInvestor, { data, loading, error }] = useLazyQuery(searchInvestorByName, {
    onCompleted() {
      setOptions(
        data?.searchInvestorByName.data.map((item: InvestorItemType) => ({
          label: item.investor_name,
          value: item.investor_id,
        }))
      )
    },
  })

  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="M&A" />}>
        <Box sx={{ mx: 2, my: 3 }}>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Acquisition Year"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isBlankAcquiredYear}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankAcquiredYear: !state.isBlankAcquiredYear,
                  })
                }}
              />
              <YearRange
                isRange={state.acquiredYear.isRange}
                setIsRange={isRange => {
                  onChange({ ...state, acquiredYear: { ...state.acquiredYear, isRange } })
                }}
                state={state.acquiredYear}
                onChange={(acquiredYear: any) => onChange({ ...state, acquiredYear })}
                disabled={state.isBlankAcquiredYear}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Acquirer"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isBlankAcquirers}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankAcquirers: !state.isBlankAcquirers,
                  })
                }}
              />
              <Popover
                disabled={state.isBlankAcquirers}
                open={open}
                setOpen={setOpen}
                positions={['bottom']}
                noArrow
                content={
                  <>
                    <Box
                      sx={{
                        mt: 2,
                        bg: 'white',
                        border: `solid 1px ${Palette.gray01}`,
                        borderRadius: 8,
                        width: 324,
                      }}
                    >
                      {loading ? (
                        <Updating sx={{ py: 6 }} loading />
                      ) : !!error ? (
                        <Box sx={{ px: 4, py: 4 }}>
                          <Paragraph>{error.message}</Paragraph>
                        </Box>
                      ) : !options.length ? (
                        <Box sx={{ px: 4, py: 4 }}>
                          <Paragraph>This investor is not available yet.</Paragraph>
                        </Box>
                      ) : (
                        <Box sx={{ py: 2, maxHeight: 222, overflowY: 'auto' }}>
                          {options.map((item, index) => (
                            <Flex
                              key={index}
                              onClick={() => {
                                if (
                                  !state.acquirers.find(acquirer => acquirer.value === item.value)
                                )
                                  onChange({
                                    ...state,
                                    acquirers: [...state.acquirers, item],
                                  })
                                setOpen(false)
                              }}
                              sx={{
                                px: 4,
                                py: 2,
                                cursor: 'pointer',
                                '&:hover': {
                                  bg: 'gray03',
                                },
                              }}
                            >
                              <Paragraph>{item.label}</Paragraph>
                            </Flex>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </>
                }
                zIndex={reasonPopverZIndex}
              >
                <SearchBox
                  onChange={name => {
                    searchInvestor({ variables: { name, getCR: false } })
                  }}
                  placeholder="search..."
                  disabled={state.isBlankAcquirers}
                />
              </Popover>
              <Flex sx={{ flexWrap: 'wrap' }}>
                {state.acquirers.map((item, index) => (
                  <Chips
                    key={index}
                    label={item.label}
                    onClose={() => {
                      onChange({
                        ...state,
                        acquirers: state.acquirers.filter(
                          acquirer => acquirer.value !== item.value
                        ),
                      })
                    }}
                    disabled={state.isBlankAcquirers}
                  />
                ))}
              </Flex>
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Acquirer Type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={[blankText, ...investor]}
                listCheck={state.acquirerTypes}
                onChange={acquirerTypes => {
                  onChange({ ...state, acquirerTypes })
                }}
              />
              <CombinationForm
                state={state.acquirerTypesCombination}
                onChange={acquirerTypesCombination => {
                  onChange({ ...state, acquirerTypesCombination })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Latest Acquisition Amount"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <InputRange
                state={state.latestAcquisitionAmount}
                onChange={latestAcquisitionAmount => {
                  onChange({ ...state, latestAcquisitionAmount })
                }}
              />
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default MnA
