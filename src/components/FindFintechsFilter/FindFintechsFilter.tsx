import React, { useState, useEffect, useRef } from 'react'
import { Flex, Label, Box } from '@theme-ui/components'
import { FormOption, IPagination } from '../../types'
import { Button, Drawer, Dropdown, FilterTemplate, Icon, Updating, MultiSelect } from '..'
import { SortDirection } from '../../types/enums'
import strings from '../../strings'
import {
  FindFintechsFilterType,
  SortBy,
  IsRangeType,
  defaultSortBy,
  ESortFields,
  keywordOptions,
} from '../../pages/FindFintechs/helpers'
import { FundingAmount, Geography, LaunchYear, FundingDate } from '../MappingZone/FilterForm'
import { useQuery } from '@apollo/client'
import { getGeography } from '../../pages/MappingZone/graphql'
import { FundingAmountType, GeographyType } from '../MappingZone/FilterForm/helpers'
import {
  KeywordFilterType,
  externalSourceOptions,
} from '../../pages/CompanyManagement/CompanyFilter/helpers'
import { ftesRangeWithBlankOptions, status } from '../../pages/CompanyForm/mock'
import { Keyword } from '../../pages/CompanyManagement/CompanyFilter'
import { MappedClusterOptions } from '../IncorrrectMappingFilter/IncorrectMappingFilter'

type FindFintechsProps = {
  filter: FindFintechsFilterType
  gotoPage(pagination: IPagination, newSortBy: SortBy): void
  onChangeFilter(filter: FindFintechsFilterType): void
  resetFilter(): void
  refetchAPI(): void
  isRange: IsRangeType
  setIsRange(props: IsRangeType): void
}
const SuggestedMappingOptions = MappedClusterOptions

const FindFintechsFilter = ({
  gotoPage,
  filter,
  onChangeFilter,
  resetFilter,
  refetchAPI,
  isRange,
  setIsRange,
}: FindFintechsProps) => {
  const filterRefContainer = useRef<HTMLDivElement>(null)
  const { companyManagement: copy } = strings
  const [currentFilter, setCurrentFilter] = useState<FindFintechsFilterType>(filter)
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [key, setKey] = useState<number>(0)
  const [errorForm, setErrorForm] = useState<string[]>([])
  // GRAPHQL
  const { data: geography, loading } = useQuery(getGeography)

  useEffect(() => {
    setCurrentFilter(filter)
  }, [filter])

  return (
    <>
      <Flex sx={{ justifyContent: 'flex-end', mb: 6 }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Icon icon="sort" color="text" sx={{ mr: 2 }} />
          <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Sort by</Label>
          <Dropdown
            sx={{ minWidth: 262, mr: 3 }}
            name="sortBy"
            value={currentFilter.sortBy.field}
            options={[
              ...defaultSortBy,
              ...currentFilter.columns.filter(
                c => !Object.values(ESortFields).includes(c.value as ESortFields)
              ),
            ]}
            onChange={e => {
              const newSortBy = { ...currentFilter.sortBy, field: e.currentTarget.value }
              const newPagination = { ...currentFilter.pagination, page: 1 }
              gotoPage(newPagination, newSortBy)
            }}
          />
          <Dropdown
            name="sortBy"
            options={[
              { label: 'DESC', value: SortDirection.DESC },
              { label: 'ASC', value: SortDirection.ASC },
            ]}
            value={currentFilter.sortBy.direction}
            onChange={e => {
              const newSortBy = { ...currentFilter.sortBy, direction: e.currentTarget.value }
              const newPagination = { ...currentFilter.pagination, page: 1 }
              gotoPage(newPagination, newSortBy)
            }}
          />
          <Button
            onPress={() => {
              setFilterVisible(true)
            }}
            sx={{ color: 'primary', ml: 3, px: 18 }}
            icon="filter"
            variant="outline"
            label={copy.buttons.filter}
            color="black50"
            iconLeft
          />
        </Flex>
      </Flex>
      <Drawer visible={filterVisible}>
        <FilterTemplate
          key={key}
          onClose={() => {
            setFilterVisible(false)
            setCurrentFilter(filter)
          }}
          resetFilter={() => {
            setFilterVisible(false)
            setIsRange({
              foundedYear: false,
              lastFundingDate: false,
            })
            resetFilter()
            setKey(key + 1) // re-render UI when reset filter
            setErrorForm([])
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                const newPagination = { ...currentFilter.pagination, page: 1 }
                onChangeFilter({ ...currentFilter, pagination: newPagination })
                setFilterVisible(false)
              },
              disabled: !!errorForm.length,
              sx: { px: 16, py: 2, borderRadius: 8 },
            },
          ]}
        >
          {loading ? (
            <Updating loading />
          ) : (
            <Box ref={filterRefContainer}>
              <Geography
                geography={geography?.getGeography}
                state={currentFilter.geography || ({} as GeographyType)}
                onChange={(geography: GeographyType) =>
                  setCurrentFilter({ ...currentFilter, geography })
                }
              />
              <Keyword
                isCollapseOpen={false}
                state={currentFilter.keywords as KeywordFilterType}
                keywordOptions={keywordOptions}
                onChange={(keywords: KeywordFilterType) =>
                  setCurrentFilter({ ...currentFilter, keywords })
                }
              />
              <FundingAmount
                title="Total Equity Funding"
                state={currentFilter.fundingAmount}
                onChange={(fundingAmount: FundingAmountType) =>
                  setCurrentFilter({ ...currentFilter, fundingAmount })
                }
              />
              <LaunchYear
                isRange={isRange.foundedYear}
                setIsRange={state => {
                  setIsRange({
                    ...isRange,
                    foundedYear: state,
                  })
                }}
                state={currentFilter.foundedYears}
                onChange={(years: any) =>
                  setCurrentFilter({ ...currentFilter, foundedYears: years })
                }
                title={'Founded year'}
              />
              <FundingDate
                name="fundingdate"
                isRange={isRange.lastFundingDate}
                setIsRange={state => {
                  setIsRange({
                    ...isRange,
                    lastFundingDate: state,
                  })
                }}
                state={currentFilter.lastFundingDates}
                onChange={dates => {
                  setCurrentFilter({
                    ...currentFilter,
                    lastFundingDates: dates,
                  })
                }}
                title={'Last funding date'}
                errorForm={errorForm}
                setErrorForm={setErrorForm}
              />
              <Dropdown
                name="source"
                label="Source"
                value={currentFilter.source}
                options={externalSourceOptions}
                onChange={({ target }) => {
                  setCurrentFilter({ ...currentFilter, source: target.value })
                }}
                labelSx={{ pt: 4, mb: 3 }}
              />
              <MultiSelect
                popoverProps={{ containerParent: filterRefContainer.current || undefined }}
                id="Suggested mapping"
                label={'Suggested mapping'}
                labelSx={{
                  pt: 4,
                  mb: 3,
                }}
                divSx={{
                  mb: 3,
                }}
                bg={'gray03'}
                state={currentFilter.suggestedMapping}
                positions={['bottom', 'top']}
                options={
                  (SuggestedMappingOptions?.map(value => ({ label: String(value), value })) ||
                    []) as FormOption[]
                }
                onChange={values => {
                  setCurrentFilter({
                    ...currentFilter,
                    suggestedMapping: values as string[],
                  })
                }}
              />
              <Dropdown
                name="status"
                label="Status"
                value={currentFilter.status}
                options={status}
                onChange={({ target }) => {
                  setCurrentFilter({ ...currentFilter, status: target.value })
                }}
                labelSx={{ pt: 4, mb: 3 }}
              />
              <MultiSelect
                popoverProps={{ containerParent: filterRefContainer.current || undefined }}
                id="ftes"
                label="FTEs range"
                labelSx={{
                  pt: 4,
                  mb: 3,
                }}
                divSx={{
                  mb: 3,
                }}
                bg={'gray03'}
                positions={['bottom', 'top']}
                state={currentFilter.ftesRange}
                options={ftesRangeWithBlankOptions as FormOption[]}
                onChange={values => {
                  setCurrentFilter({ ...currentFilter, ftesRange: values as string[] })
                }}
              />
            </Box>
          )}
        </FilterTemplate>
      </Drawer>
    </>
  )
}
export default FindFintechsFilter
