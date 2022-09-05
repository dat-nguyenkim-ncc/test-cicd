import React, { ChangeEvent } from 'react'
import { Flex, Label } from 'theme-ui'
import { Icon, Dropdown } from '../../components'
import Search, { SearchProps } from '../../components/Search'
import { FormOption, ISortBy } from '../../types'
import { SortDirection } from '../../types/enums'
import ChangeRequestFilter, { StateFilterBy, CompanyFilterProps } from './ChangeRequestFilter'
import { ESortFields, sortByOptions } from './helpers'

export const INIT_FILTER_BY = { isSelfDeclared: '' }

type ChangeRequestFiltersProps = {
  searchValue: string
  onSearchChange(value?: string): void
  sortBy: ISortBy<ESortFields>
  onSortByChange(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>): void
  loading?: boolean
  filterVisible: boolean
  setFilterVisible: React.Dispatch<React.SetStateAction<boolean>>
  filterBy: StateFilterBy
  setFilterBy: React.Dispatch<React.SetStateAction<StateFilterBy>>
  sortByOptionsProps?: FormOption[]
  placeholder?: string
} & Pick<CompanyFilterProps, 'resetFilter' | 'applyFilter'> &
  Pick<SearchProps, 'onSearch'>

const ChangeRequestFilters = ({
  searchValue,
  onSearch,
  onSearchChange,
  sortBy,
  onSortByChange,
  loading = false,
  filterVisible,
  setFilterVisible,
  filterBy,
  setFilterBy,
  resetFilter,
  applyFilter,
  sortByOptionsProps,
  placeholder,
}: ChangeRequestFiltersProps) => {
  return (
    <Flex sx={{ justifyContent: 'space-between', mb: 6 }}>
      <form>
        <Search
          onSearch={onSearch}
          onChange={onSearchChange}
          sx={{ py: 0, px: 3, bg: 'gray03', minWidth: 300, height: '100%' }}
          size="tiny"
          value={searchValue}
          placeholder={placeholder || 'Search Company Name'}
          onBlur={(name, e) => {
            onSearchChange(e?.currentTarget?.value?.trim())
          }}
          bindValue
        />
      </form>
      <Flex sx={{ alignItems: 'center' }}>
        <Icon icon="sort" color="text" sx={{ mr: 2 }} />
        <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Sort by</Label>
        <Dropdown
          sx={{ minWidth: 262, mr: 3 }}
          name="sortByField"
          value={sortBy.field}
          options={sortByOptionsProps || sortByOptions}
          onChange={onSortByChange}
        />
        <Dropdown
          name="sortByDirection"
          options={[
            { label: 'DESC', value: SortDirection.DESC },
            { label: 'ASC', value: SortDirection.ASC },
          ]}
          value={sortBy.direction}
          onChange={onSortByChange}
        />
        <ChangeRequestFilter
          loading={loading}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          initFilterBy={INIT_FILTER_BY}
          resetFilter={resetFilter}
          applyFilter={applyFilter}
        />
      </Flex>
    </Flex>
  )
}

export default ChangeRequestFilters
