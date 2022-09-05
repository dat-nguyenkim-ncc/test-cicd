import React, { useState } from 'react'
import { Box, Flex, Label, SxStyleProp } from 'theme-ui'
import { Button, Checkbox, Drawer, Dropdown, FilterTemplate, TextField } from '../../../components'
import { ChangeFieldEvent, IPagination, RoundTypesOption } from '../../../types'

import {
  BLANK_LABEL,
  DEFAULT_FILTER,
  EMPTY_ROUND_ID,
  FIRST_PAGE,
  FundingRoundMappingColumns,
  getMappingAfterUpdatingRound1OrRound2,
  getRoundTypeOptions,
  ROUND_TYPE_FIELDS,
} from '../helpers'

import { FundingRoundMappingDTO, FundingRoundMappingFilterDTO } from '../types'

type Props = {
  roundTypeOptions: RoundTypesOption
  gotoPage(pagination: IPagination, filterStateInput?: FundingRoundMappingFilterDTO): void
  pagination: IPagination
  setFilterState(filterState: FundingRoundMappingFilterDTO): void
  filterState: FundingRoundMappingFilterDTO
  loading: boolean
  getLocalFilter(): FundingRoundMappingFilterDTO | undefined
}

const useStyle = () => ({
  filterButtonBox: { justifyContent: 'flex-end', mb: 5, alignItems: 'center' } as SxStyleProp,
})

const FundingRoundMappingFilter = ({
  roundTypeOptions,
  gotoPage,
  pagination,
  filterState,
  setFilterState,
  getLocalFilter,
  loading,
}: Props) => {
  const [filterVisible, setFilterVisible] = useState<boolean>(false)

  const styles = useStyle()

  const onChange = (key: string, value: string | number | boolean) => {
    if (key === FundingRoundMappingColumns.IS_BLANK) {
      const sourceValue = value ? '' : filterState.sourceValue
      setFilterState({ ...filterState, [key]: value as boolean, sourceValue })
      return
    }

    if (key === FundingRoundMappingColumns.SOURCE_VALUE) {
      setFilterState({ ...filterState, [key]: value?.toString().trim(), isSourceValueBlank: false })
      return
    }

    const { round1Id, round2Id } = getMappingAfterUpdatingRound1OrRound2(
      key as keyof FundingRoundMappingDTO,
      value as number,
      { round1Id: filterState.round1Id, round2Id: filterState.round2Id } as FundingRoundMappingDTO,
      roundTypeOptions
    )

    setFilterState({
      ...filterState,
      round1Id: +round1Id || EMPTY_ROUND_ID,
      round2Id: +round2Id || EMPTY_ROUND_ID,
    })
  }

  return (
    <>
      <Flex sx={styles.filterButtonBox}>
        <Button
          onPress={() => {
            setFilterVisible(true)
          }}
          sx={{ color: 'primary', ml: 3, px: 18 }}
          icon="filter"
          variant="outline"
          label="Filter"
          color="black50"
          iconLeft
          disabled={loading}
        />
      </Flex>
      <Drawer visible={filterVisible}>
        <FilterTemplate
          onClose={() => {
            setFilterVisible(false)
            setFilterState(getLocalFilter() || DEFAULT_FILTER)
          }}
          resetFilter={() => {
            setFilterVisible(false)
            setFilterState({ ...DEFAULT_FILTER })
            gotoPage({ ...pagination, page: FIRST_PAGE }, DEFAULT_FILTER)
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                gotoPage({ ...pagination, page: 1 })
                setFilterVisible(false)
              },
              sx: { px: 16, py: 2, borderRadius: 8 },
            },
          ]}
        >
          <Label mb={4}>Source Value</Label>
          <TextField
            name={FundingRoundMappingColumns.SOURCE_VALUE}
            onChange={e => {
              onChange(FundingRoundMappingColumns.SOURCE_VALUE, e.target.value)
            }}
            value={filterState.sourceValue}
          ></TextField>
          <Checkbox
            sx={{ py: 1 }}
            label={BLANK_LABEL}
            onPress={() => {
              onChange(FundingRoundMappingColumns.IS_BLANK, !filterState.isSourceValueBlank)
            }}
            square
            checked={filterState.isSourceValueBlank}
          />

          {ROUND_TYPE_FIELDS.map(item => {
            const value = filterState[item.key as keyof FundingRoundMappingFilterDTO] as
              | string
              | number

            const clearable = !!value && +value !== +EMPTY_ROUND_ID

            return (
              <Box key={item.key} sx={{ position: 'relative', mt: 4 }}>
                <Label mb={4}>{item.formLabel}</Label>
                <Dropdown
                  key={item.key}
                  name={'dropdown' + item.key}
                  onChange={(event: ChangeFieldEvent) => onChange(item.key, event.target.value)}
                  value={value}
                  options={getRoundTypeOptions(item.key, filterState.round1Id, roundTypeOptions)}
                  clearable={clearable}
                  onClear={() => {
                    onChange(item.key, EMPTY_ROUND_ID)
                  }}
                />
              </Box>
            )
          })}
        </FilterTemplate>
      </Drawer>
    </>
  )
}

export default FundingRoundMappingFilter
