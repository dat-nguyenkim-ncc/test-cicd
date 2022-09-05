import React, { useState, useEffect } from 'react'
import { Flex, Label } from '@theme-ui/components'
import { FormOption, IPagination } from '../../types'
import { Button, Drawer, Dropdown, FilterTemplate, Icon, Updating, MultiSelect } from '..'
import { SortDirection } from '../../types/enums'
import strings from '../../strings'
import {
  IncorrectMappingFilterType,
  SortBy,
  defaultSortBy,
} from '../../pages/IncorrectMapping/helpers'

export const MappedClusterOptions = [
  'blank',
  'out',
  'trading & investments',
  'lending & crowdfunding',
  'payments',
  'accounts',
  'financial infrastructure',
  'insurtech',
  'regtech',
]

export const SuggestedMappingOptions = [
  'out',
  'trading & investments',
  'lending & crowdfunding',
  'payments',
  'accounts',
  'financial infrastructure',
  'insurtech',
  'regtech',
]

type FilterProps = {
  filter: IncorrectMappingFilterType
  gotoPage(pagination: IPagination, newSortBy: SortBy): void
  onChangeFilter(filter: IncorrectMappingFilterType): void
  resetFilter(): void
  refetchAPI(): void
}

const Filter = ({ gotoPage, filter, onChangeFilter, resetFilter, refetchAPI }: FilterProps) => {
  const { companyManagement: copy } = strings
  const [currentFilter, setCurrentFilter] = useState<IncorrectMappingFilterType>(filter)
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [key, setKey] = useState<number>(0)
  const [errorForm, setErrorForm] = useState<string[]>([])

  const loading = false

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
            options={defaultSortBy}
            onChange={e => {
              const newSortBy = { ...currentFilter.sortBy, field: e.currentTarget.value }
              const newPagination = { ...currentFilter.pagination, page: 1 }
              gotoPage(newPagination, newSortBy)
            }}
          />
          <Dropdown
            sx={{ display: 'none' }}
            disabled
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
            <>
              <MultiSelect
                id="Cluster"
                label={'Cluster'}
                labelSx={{
                  pt: 4,
                  mb: 3,
                }}
                divSx={{
                  mb: 3,
                }}
                bg={'gray03'}
                state={currentFilter.mapped_l1_cluster || []}
                positions={['bottom', 'top']}
                options={
                  (MappedClusterOptions?.map(value => ({ label: String(value), value })) ||
                    []) as FormOption[]
                }
                onChange={values => {
                  setCurrentFilter({
                    ...currentFilter,
                    mapped_l1_cluster: values as string[],
                  })
                }}
              />
              <MultiSelect
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
                state={currentFilter.suggested_l1_cluster || []}
                positions={['bottom', 'top']}
                options={
                  (SuggestedMappingOptions?.map(value => ({ label: String(value), value })) ||
                    []) as FormOption[]
                }
                onChange={values => {
                  setCurrentFilter({
                    ...currentFilter,
                    suggested_l1_cluster: values as string[],
                  })
                }}
              />
            </>
          )}
        </FilterTemplate>
      </Drawer>
    </>
  )
}
export default Filter
