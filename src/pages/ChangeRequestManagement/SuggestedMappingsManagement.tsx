import { useLazyQuery } from '@apollo/client'
import moment from 'moment'
import React, { FormEvent, useRef, ChangeEvent } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Divider, Flex, Label, Box } from 'theme-ui'
import {
  Button,
  Dropdown,
  FilterTemplate,
  Icon,
  Pagination,
  Popover,
  Radio,
  Search,
  SuggestedMappingList,
  Updating,
} from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { FormOption, IPagination, ISortBy } from '../../types'
import { GET_ALL_SUGGESTED_MAPPING } from './graphql'
import ListRequestEmpty from '../../components/ListRequetsEmpty'
import { ESortFields } from './helpers'
import { EnumBoolean, SortDirection } from '../../types/enums'
import strings from '../../strings'
import { SearchProps } from '../../components/Search'
import { popoverZIndex } from '../../utils/consts'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export type ResultType = {
  id: string
  companyId: string
  companyName: string
  currentMapping: string
  suggestedMapping: string
  isPrimary: string
  inputUser: string
  createdDate: string
  reviewed: boolean
  reviewer: string
  reviewedDate: string
}

export type FilterBy = {
  isSelfDeclared: string | boolean | null
}

const formatValue = (value: string) => {
  const date = moment(value).format(DEFAULT_VIEW_DATE_FORMAT)
  return date !== 'Invalid date' ? date : ''
}

export const sortByOptions: FormOption[] = [
  { label: 'Create Date', value: ESortFields.CREATED_DATE },
  { label: 'Company Name', value: ESortFields.COMPANY_NAME },
]

type FilterState = {
  reviewed: number
}

const sortByDefault = {
  field: ESortFields.CREATED_DATE,
  direction: SortDirection.DESC,
}

const optionAll = { label: 'All', value: -2 }
const reviewedOptions: FormOption[] = [
  { ...optionAll },
  {
    label: 'Not Reviewed',
    value: EnumBoolean.FALSE,
  },
  {
    label: 'Reviewed',
    value: EnumBoolean.TRUE,
  },
]

const filterByDefault = { reviewed: EnumBoolean.FALSE }

type SortBy = ISortBy<ESortFields>

let timer: any

const SuggestedMappingsManagement = () => {
  const isFirstRun = useRef(true)

  const [searchText, setSearchText] = React.useState<string>('')
  const [sortBy, setSortBy] = React.useState<SortBy>(sortByDefault)
  const [filterBy, setFilterBy] = React.useState<FilterState>({ ...filterByDefault })
  const [filterVisible, setFilterVisible] = React.useState(false)
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })

  const [suggestedData, setSuggestedData] = useState<ResultType[]>()

  const [getData, { data, loading }] = useLazyQuery(GET_ALL_SUGGESTED_MAPPING, {
    fetchPolicy: 'network-only',
    onCompleted() {
      setSuggestedData(
        data?.getAllSuggestedMappings.data?.map((cr: any) => ({
          ...cr,
          isPrimary: cr.isPrimary === 1 ? 'true' : 'false',
          createdDate: formatValue(cr.createdDate),
          reviewedDate: formatValue(cr.reviewedDate),
        })) || []
      )
    },
  })

  const refetchAPI = (
    newSortBy: SortBy = sortBy,
    newFilterBy: FilterState = filterBy,
    newPagination: IPagination = pagination,
    keyword: string | undefined = searchText
  ) => {
    getData({
      variables: {
        input: {
          sortBy: newSortBy,
          filterBy: {
            ...newFilterBy,
            reviewed:
              newFilterBy.reviewed === optionAll.value
                ? [EnumBoolean.FALSE, EnumBoolean.TRUE]
                : newFilterBy.reviewed,
          },
          ...newPagination,
          keyword,
        },
      },
    })
  }

  const resetFilter = (): void => {
    setFilterBy(filterByDefault)
    setFilterVisible(false)
    gotoPage({ ...pagination, page: 1 }, sortBy, filterByDefault)
  }

  const onChangeFilter = (_filterBy: FilterState): void => {
    setFilterBy(_filterBy)
    clearTimeout(timer)
    timer = setTimeout(() => {
      setFilterVisible(false)
      gotoPage({ ...pagination, page: 1 }, sortBy, _filterBy || filterBy)
    }, 500)
  }

  useEffect(() => {
    if (isFirstRun.current) {
      refetchAPI()
      isFirstRun.current = false
    }
  })

  const gotoPage = (pagination: IPagination, sortBy: SortBy, filterBy: FilterState) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    setSortBy(sortBy)
    setFilterBy(filterBy)
    refetchAPI(sortBy, filterBy, newPagination)
  }

  const onChangeSearch = (search: string) => {
    setSearchText(search)
  }

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    gotoPage({ ...pagination, page: 1 }, sortBy, filterBy)
  }

  const onSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const names = {
      sortByDirection: 'direction',
      sortByField: 'field',
    }
    const name = names[e.currentTarget.name as keyof typeof names]
    if (name) {
      const newSortBy = { ...sortBy, [name]: e.currentTarget.value as ESortFields }
      gotoPage({ ...pagination, page: 1 }, newSortBy, filterBy)
    }
  }

  return (
    <>
      <Section sx={{ mt: 5, p: 5, maxWidth: '100%' }}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h4" sx={{ fontWeight: 'bold' }}>
            {`${data?.getAllSuggestedMappings?.total || 0} Pending Requests`}
          </Heading>
        </Flex>
        <Divider opacity={0.3} my={5} />

        <Filter
          searchValue={searchText || ''}
          onSearch={onSearch}
          onSearchChange={onChangeSearch}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          loading={loading}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          filterBy={filterBy}
          onChangeFilter={onChangeFilter}
          resetFilter={resetFilter}
          sortByOptionsProps={sortByOptions}
        />
        {loading ? (
          <Updating sx={{ py: 6 }} loading />
        ) : (
          <>
            {!suggestedData?.length ? (
              <ListRequestEmpty />
            ) : (
              <SuggestedMappingList data={suggestedData || []} refetchAPI={refetchAPI} />
            )}
            {data?.getAllSuggestedMappings.total && (
              <Pagination
                sx={{ justifyContent: 'center' }}
                currentPage={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={Math.ceil(data?.getAllSuggestedMappings.total / pagination.pageSize)}
                changePage={page => {
                  gotoPage({ ...pagination, page }, sortBy, filterBy)
                }}
                changePageSize={pageSize => {
                  gotoPage({ page: 1, pageSize }, sortBy, filterBy)
                }}
              />
            )}
          </>
        )}
      </Section>
    </>
  )
}

export default SuggestedMappingsManagement

type FilterProps = {
  searchValue: string
  onSearchChange(value?: string): void
  sortBy: ISortBy<ESortFields>
  onSortByChange(event: ChangeEvent<HTMLSelectElement | HTMLInputElement>): void
  loading?: boolean
  filterVisible: boolean
  setFilterVisible: React.Dispatch<React.SetStateAction<boolean>>
  filterBy: FilterState
  onChangeFilter(filter: FilterState): void
  sortByOptionsProps?: FormOption[]
  resetFilter(): void
} & Pick<SearchProps, 'onSearch'>

const Filter = ({
  searchValue,
  onSearch,
  onSearchChange,
  sortBy,
  onSortByChange,
  filterVisible,
  setFilterVisible,
  filterBy,
  onChangeFilter,
  resetFilter,
  sortByOptionsProps,
}: FilterProps) => {
  const { companyManagement } = strings

  return (
    <Flex sx={{ justifyContent: 'space-between', mb: 6 }}>
      <form>
        <Search
          onSearch={onSearch}
          onChange={onSearchChange}
          sx={{ py: 0, px: 3, bg: 'gray03', minWidth: 300, height: '100%' }}
          size="tiny"
          value={searchValue}
          placeholder="Search Company Name"
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
        <Popover
          isToggle
          open={filterVisible}
          setOpen={setFilterVisible}
          padding={1}
          onClickOutSide={() => setFilterVisible(false)}
          zIndex={popoverZIndex}
          content={
            <Box
              sx={{
                overflow: 'auto',
                minWidth: 300,
                maxWidth: 375,
                maxHeight: 500,
              }}
            >
              <FilterTemplate onClose={() => setFilterVisible(false)} resetFilter={resetFilter}>
                <Box sx={{}}>
                  <Paragraph bold>Reviewed</Paragraph>
                  <Box sx={{ my: 3, mx: 2 }}>
                    {reviewedOptions.map((item, index) => {
                      const isSelected = filterBy.reviewed === item.value
                      return (
                        <Radio
                          key={index}
                          sx={{ mt: index > 0 ? 3 : 0 }}
                          label={item.label}
                          selected={isSelected}
                          onClick={() =>
                            onChangeFilter({
                              ...filterBy,
                              reviewed: +item.value,
                            })
                          }
                          size="tiny"
                        />
                      )
                    })}
                  </Box>
                </Box>
              </FilterTemplate>
            </Box>
          }
        >
          <Button
            onPress={() => setFilterVisible((prev: boolean): boolean => !prev)}
            sx={{ color: 'primary', ml: 3, px: 18 }}
            icon="filter"
            variant="outline"
            label={companyManagement.buttons.filter}
            color="black50"
            iconLeft
          />
        </Popover>
      </Flex>
    </Flex>
  )
}
