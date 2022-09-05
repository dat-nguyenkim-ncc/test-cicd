import React from 'react'
import { Section } from '../../components/primitives'
import { ListTaxonomyChangeRequestsContainer } from '../../container'
import ChangeRequestFilters from './ChangeRequetFilters'
import { StateFilterBy } from './ChangeRequestFilter'
import { IPagination, ISortBy } from '../../types'
import { FormEvent } from 'react-router/node_modules/@types/react'
import { ESortFields } from './helpers'
import { useChangeRequestManagement } from './provider/ChangeRequestManagementProvider'

const INIT_FILTER_BY = { isSelfDeclared: '' }

const TaxonomyChangeRequestsManagement = () => {
  const {
    searchText,
    setSearchText,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
  } = useChangeRequestManagement()
  const [filterVisible, setFilterVisible] = React.useState(false)
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })
  const [keyword, setKeyword] = React.useState<string>(searchText || '')

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    gotoPage({ ...pagination, page: 1 }, { sortBy, filterBy, keyword: searchText })
  }
  const onSearchChange = (v: string) => {
    setSearchText(v || '')
  }

  const onSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const names = {
      sortByDirection: 'direction',
      sortByField: 'field',
    }
    const name = names[e.currentTarget.name as keyof typeof names]
    if (name) {
      const newSortBy = { ...sortBy, [name]: e.currentTarget.value as ESortFields }
      gotoPage({ ...pagination, page: 1 }, { sortBy: newSortBy, filterBy })
    }
  }

  const resetFilter = (): void => {
    setFilterBy(INIT_FILTER_BY)
    setFilterVisible(false)
    gotoPage({ ...pagination, page: 1 }, { sortBy, filterBy: INIT_FILTER_BY })
  }

  const applyFilter = (_filterBy: StateFilterBy): void => {
    setFilterVisible(false)
    gotoPage({ ...pagination, page: 1 }, { sortBy, filterBy: _filterBy || filterBy })
  }

  const gotoPage = (
    pagination: IPagination,
    input: { sortBy: ISortBy<ESortFields>; filterBy: StateFilterBy; keyword?: string }
  ) => {
    const { sortBy, filterBy, keyword = searchText } = input
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    setSortBy(sortBy)
    setFilterBy(filterBy)
    setKeyword(keyword)
  }

  return (
    <>
      <Section sx={{ mt: 5, p: 5, maxWidth: '100%' }}>
        <ListTaxonomyChangeRequestsContainer
          showTotal={true}
          sortBy={sortBy}
          filterBy={{
            isSelfDeclared: !filterBy?.isSelfDeclared ? null : filterBy?.isSelfDeclared === 'true',
          }}
          keyword={keyword}
          FilterComponent={
            <ChangeRequestFilters
              searchValue={searchText}
              onSearch={onSearch}
              onSearchChange={onSearchChange}
              sortBy={sortBy}
              onSortByChange={onSortByChange}
              filterVisible={filterVisible}
              setFilterVisible={setFilterVisible}
              filterBy={filterBy}
              setFilterBy={setFilterBy}
              resetFilter={resetFilter}
              applyFilter={applyFilter}
            />
          }
        />
      </Section>
    </>
  )
}
export default TaxonomyChangeRequestsManagement
