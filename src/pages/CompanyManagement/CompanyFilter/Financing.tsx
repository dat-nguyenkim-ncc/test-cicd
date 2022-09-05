import React, { useCallback, useState } from 'react'
import { CheckList, CollapseHeader, SearchBox } from '.'
import { Box, Divider, Flex } from '@theme-ui/components'
import { Checkbox, Chips, Collapse, InputRange, Popover, Updating } from '../../../components'
import { FormOption, RoundTypesOption } from '../../../types'
import {
  blankId,
  blankText,
  ECombination,
  FinancingFilterType,
  getUniqueValue,
  RangeType,
} from './helpers'
import { investor } from '../../CompanyForm/mock'
import { YearRange } from '.'
import { reasonPopverZIndex } from '../../../utils/consts'
import { Paragraph } from '../../../components/primitives'
import { searchInvestorByName } from '../../CompanyForm/graphql'
import { useLazyQuery } from '@apollo/client'
import { InvestorItemType } from '../../../components/InvestorForm'
import { Palette } from '../../../theme'
import CombinationForm from './CombinationForm'

type FinancingProps = {
  state: FinancingFilterType
  roundTypes: RoundTypesOption
  onChange(state: FinancingFilterType): void
}

const RoundFilter = ({
  label,
  state,
  onChange,
  roundTypes,
}: {
  label: string
  state: {
    round1Amount: RangeType
    round1Type: FormOption[]
    round2Amount: RangeType
    round2Type: FormOption[]
    round1TypeCombination?: ECombination
    round2TypeCombination?: ECombination
  }
  onChange(name: string, value: RangeType | FormOption[] | ECombination): void
  roundTypes: RoundTypesOption
}) => {
  const { roundType1, roundType2 } = roundTypes
  const getRoundType2 = (round1: FormOption[]) => {
    let round2 = [] as FormOption[]
    for (const item of round1.filter(({ value }) => value !== blankId.value)) {
      round2 = [...round2, ...roundType2[item.value]]
    }
    return !round2.length
      ? Object.values(roundType2).reduce((acc: FormOption[], cur: any) => {
          return [...acc, ...cur]
        }, [] as FormOption[])
      : round2
  }
  return (
    <>
      <Collapse
        sx={{ mt: 3 }}
        header={collapseState => (
          <CollapseHeader
            {...collapseState}
            label={`${label} Round Amount`}
            shrink="indicatorDown"
            expand="indicatorUp"
            sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
          />
        )}
      >
        <Box sx={{ mx: 2, my: 3 }}>
          <InputRange
            state={state.round1Amount}
            onChange={newValue => {
              onChange(`${label.toLowerCase()}ExpandRound1Amount`, newValue)
            }}
          />
        </Box>
      </Collapse>
      <Collapse
        sx={{ mt: 3 }}
        header={collapseState => (
          <CollapseHeader
            {...collapseState}
            label={`${label} Round 1 Type`}
            shrink="indicatorDown"
            expand="indicatorUp"
            sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
          />
        )}
      >
        <Box sx={{ mx: 2, my: 3 }}>
          <CheckList
            list={[blankId, ...roundType1]}
            listCheck={state.round1Type}
            onChange={newValue => {
              onChange(`${label.toLowerCase()}ExpandRound1Type`, newValue)
            }}
          />
        </Box>
      </Collapse>
      <Collapse
        sx={{ mt: 3 }}
        header={collapseState => (
          <CollapseHeader
            {...collapseState}
            label={`${label} Round 2 Type`}
            shrink="indicatorDown"
            expand="indicatorUp"
            sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
          />
        )}
      >
        <Box sx={{ mx: 2, my: 3 }}>
          <CheckList
            list={[blankId, ...getRoundType2(state.round1Type)]}
            listCheck={state.round2Type}
            onChange={newValue => {
              onChange(`${label.toLowerCase()}ExpandRound2Type`, newValue)
            }}
            disabled={
              state.round1Type.length === 1 &&
              state.round1Type.some(({ value }) => value === blankId.value)
            }
          />
          {state.round2TypeCombination && (
            <CombinationForm
              state={state.round2TypeCombination}
              onChange={newValue => {
                onChange(`${label.toLowerCase()}ExpandRound2TypeCombination`, newValue)
              }}
              disabled={
                state.round1Type.length === 1 &&
                state.round1Type.some(({ value }) => value === blankText.value)
              }
            />
          )}
        </Box>
      </Collapse>
    </>
  )
}

const SearchInvestor = ({
  options,
  loading,
  error,
  searchInvestor,
  onChange,
  disabled,
}: {
  options: FormOption[]
  loading: boolean
  error?: string
  searchInvestor({
    variables: { name, getCR },
  }: {
    variables: { name: string; getCR: boolean }
  }): void
  onChange(investor: FormOption): void
  disabled?: boolean
}) => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <Popover
      disabled={disabled}
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
                <Paragraph>{error}</Paragraph>
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
                      onChange(item)
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
        disabled={disabled}
      />
    </Popover>
  )
}
const Financing = ({ state, onChange, roundTypes }: FinancingProps) => {
  const [options, setOptions] = useState<FormOption[]>([])

  // GRAPHQL
  const [searchInvestor, { data, loading, error }] = useLazyQuery(searchInvestorByName, {
    onCompleted() {
      setOptions(
        data.searchInvestorByName.data.map((item: InvestorItemType) => ({
          label: item.investor_name,
          value: item.investor_id,
        }))
      )
    },
  })

  const checkSelectBlank = useCallback((arr1: FormOption[], arr2: FormOption[]) => {
    return getUniqueValue(
      arr1.map(e => `${e.value}`),
      arr2.map(e => `${e.value}`)
    ).includes(blankText.value)
  }, [])

  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Financing" />}>
        <Box sx={{ mx: 2, my: 3 }}>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Total Funding"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <InputRange
                state={state.totalFunding}
                onChange={totalFunding => {
                  onChange({ ...state, totalFunding })
                }}
              />
            </Box>
          </Collapse>
          <RoundFilter
            label="Latest"
            state={{
              round1Amount: state.latestExpandRound1Amount,
              round1Type: state.latestExpandRound1Type,
              round2Amount: state.latestExpandRound2Amount,
              round2Type: state.latestExpandRound2Type,
            }}
            onChange={(name, value) => {
              onChange({
                ...state,
                latestExpandRound2Type:
                  name === 'latestExpandRound1Type' &&
                  !checkSelectBlank(value as FormOption[], state.latestExpandRound1Type)
                    ? []
                    : state.latestExpandRound2Type,
                [name]: value,
              })
            }}
            roundTypes={roundTypes}
          />
          <RoundFilter
            label="All"
            state={{
              round1Amount: state.allExpandRound1Amount,
              round1Type: state.allExpandRound1Type,
              round2Amount: state.allExpandRound2Amount,
              round2Type: state.allExpandRound2Type,
              round1TypeCombination: state.allExpandRound1TypeCombination,
              round2TypeCombination: state.allExpandRound2TypeCombination,
            }}
            onChange={(name, value) => {
              onChange({
                ...state,
                allExpandRound2Type:
                  name === 'allExpandRound1Type' &&
                  !checkSelectBlank(value as FormOption[], state.allExpandRound1Type)
                    ? []
                    : state.allExpandRound2Type,
                [name]: value,
              })
            }}
            roundTypes={roundTypes}
          />
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Funding Year"
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
                checked={state.isBlankFundingYear}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankFundingYear: !state.isBlankFundingYear,
                  })
                }}
              />
              <YearRange
                isRange={state.fundingYear.isRange}
                setIsRange={isRange => {
                  onChange({ ...state, fundingYear: { ...state.fundingYear, isRange } })
                }}
                state={state.fundingYear}
                onChange={(fundingYear: any) => {
                  onChange({ ...state, fundingYear })
                }}
                disabled={state.isBlankFundingYear}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Investor"
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
                checked={state.isBlankInvestor}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankInvestor: !state.isBlankInvestor,
                  })
                }}
              />
              <SearchInvestor
                options={options}
                error={error?.message}
                loading={loading}
                searchInvestor={searchInvestor}
                onChange={investor => {
                  if (!state.investors.find(item => item.value === investor.value))
                    onChange({ ...state, investors: [...state.investors, investor] })
                }}
                disabled={state.isBlankInvestor}
              />
              <Flex>
                {state.investors.map((item, index) => (
                  <Chips
                    key={index}
                    label={item.label}
                    onClose={() => {
                      onChange({
                        ...state,
                        investors: state.investors.filter(ins => ins.value !== item.value),
                      })
                    }}
                    disabled={state.isBlankInvestor}
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
                label="Investor Type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={[blankText, ...investor]}
                listCheck={state.investorTypes}
                onChange={investorTypes => {
                  onChange({ ...state, investorTypes })
                }}
              />
              <CombinationForm
                state={state.investorTypesCombination}
                onChange={investorTypesCombination => {
                  onChange({ ...state, investorTypesCombination })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Lead Investor"
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
                checked={state.isBlankLeadInvestor}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankLeadInvestor: !state.isBlankLeadInvestor,
                  })
                }}
              />
              <SearchInvestor
                options={options}
                error={error?.message}
                loading={loading}
                searchInvestor={searchInvestor}
                onChange={investor => {
                  if (!state.leadInvestors.find(item => item.value === investor.value))
                    onChange({ ...state, leadInvestors: [...state.leadInvestors, investor] })
                }}
                disabled={state.isBlankLeadInvestor}
              />
              <Flex sx={{ flexWrap: 'wrap' }}>
                {state.leadInvestors.map((item, index) => (
                  <Chips
                    key={index}
                    label={item.label}
                    onClose={() => {
                      onChange({
                        ...state,
                        leadInvestors: state.leadInvestors.filter(ins => ins.value !== item.value),
                      })
                    }}
                    disabled={state.isBlankLeadInvestor}
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
                label="Lead Investor Type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={[blankText, ...investor]}
                listCheck={state.leadInvestorType}
                onChange={leadInvestorType => {
                  onChange({ ...state, leadInvestorType })
                }}
              />
              <CombinationForm
                state={state.leadInvestorTypesCombination}
                onChange={leadInvestorTypesCombination => {
                  onChange({ ...state, leadInvestorTypesCombination })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Number of Investors"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <InputRange
                state={state.numOfInvestors}
                onChange={numOfInvestors => {
                  onChange({ ...state, numOfInvestors })
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

export default Financing
