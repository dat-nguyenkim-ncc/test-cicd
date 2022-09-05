import React, { useEffect, useRef, useState } from 'react'
import { Divider, Flex } from '@theme-ui/components'
import { FindFintechsList, Icon, Modal, Pagination, Updating } from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { FormOption, IPagination } from '../../types'
import { useLazyQuery } from '@apollo/client'
import { GET_FIND_FINDTECHS } from './graphql'
import { FindFintechsFilter } from '../../components'
import strings from '../../strings'
import {
  defaultColumns,
  defaultPagination,
  FindFintechsFilterType,
  initialFilter,
  SortBy,
  IsRangeType,
} from './helpers'
import { ItemGeographyType } from '../../components/MappingZone/FilterForm/helpers'
import { localstorage, LocalstorageFields } from '../../utils'
import { OperationValueFilterType } from '../CompanyManagement/CompanyFilter/helpers'
import { transformPostDate } from '../CompanyForm/helpers'
import { FILTER_POST_DATE_FORMAT } from '../../utils/consts'

const FindFintechs = () => {
  const { header } = strings
  const isFirstRun = useRef(true)

  const [filterState, setFilterState] = useState<FindFintechsFilterType>({ ...initialFilter })
  const [selectedColumns, setSelectedColumns] = useState<FormOption[]>([...defaultColumns])
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })
  const [totalCompanies, setTotalCompanies] = useState<number>(0)
  const [isRange, setIsRange] = useState<IsRangeType>({
    foundedYear: false,
    lastFundingDate: false,
  })

  // GRAPHQL
  const [getData, { data, loading: dataLoading }] = useLazyQuery(GET_FIND_FINDTECHS, {
    fetchPolicy: 'network-only',
    onCompleted() {
      setTotalCompanies(data?.getFindFintechs.total)
    },
    onError() {
      setTotalCompanies(0)
    },
  })

  const refetchAPI = React.useCallback(
    (filter = filterState) => {
      const mapGeography = (geography: ItemGeographyType[]) => geography.map(item => item.name)

      const lastFundingDateFrom = isRange.lastFundingDate
        ? filter.lastFundingDates.dateRange.from
        : filter.lastFundingDates.date
      const lastFundingDateTo = isRange.lastFundingDate
        ? filter.lastFundingDates.dateRange.to
        : filter.lastFundingDates.date
      const input: any = {
        page: filter.pagination.page,
        pageSize: filter.pagination.pageSize,
        sortBy: filter.sortBy,
        columns: filter.columns.map(({ value }: FormOption) => value),
        region: mapGeography(filter.geography.region),
        region1: mapGeography(filter.geography.region1),
        region2: mapGeography(filter.geography.region2),
        countries: mapGeography(filter.geography.countries),
        totalFundingFrom: filter.fundingAmount.from,
        totalFundingTo: filter.fundingAmount.to,
        foundedYearFrom: isRange.foundedYear
          ? filter.foundedYears.yearRange.from
          : filter.foundedYears.year,
        foundedYearTo: isRange.foundedYear
          ? filter.foundedYears.yearRange.to
          : filter.foundedYears.year,
        lastFundingDateFrom: transformPostDate(lastFundingDateFrom, FILTER_POST_DATE_FORMAT),
        lastFundingDateTo: transformPostDate(lastFundingDateTo, FILTER_POST_DATE_FORMAT),
        source: filter.source,
        keywords: {
          keywords: filter.keywords.keywords.map(({ value }: FormOption) => value),
          operations: filter.keywords.operations.filter(
            ({ value }: OperationValueFilterType) => !!value?.toString().length
          ),
        },
        status: filter.status,
        ftesRange: filter.ftesRange,
        suggestedMapping: filter.suggestedMapping,
      }
      getData({ variables: { input } })
    },
    [getData, filterState, isRange]
  )

  const onChangeFilter = React.useCallback(
    (newFilter: FindFintechsFilterType) => {
      setFilterState(newFilter)
      localstorage.set(LocalstorageFields.FIND_FINTECHS_FILTER, JSON.stringify(newFilter))
      refetchAPI(newFilter)
    },
    [refetchAPI, setFilterState]
  )

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      const filter = localstorage.get(LocalstorageFields.FIND_FINTECHS_FILTER)
      if (filter) {
        setSelectedColumns(JSON.parse(filter).columns)
        onChangeFilter(JSON.parse(filter))
      } else refetchAPI()
      return
    }
  }, [refetchAPI, onChangeFilter])

  const resetFilter = () => {
    onChangeFilter({ ...initialFilter, sortBy: filterState.sortBy })
    setSelectedColumns([...defaultColumns])
  }

  const gotoPage = (pagination: IPagination, sortBy: SortBy) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    onChangeFilter({ ...filterState, pagination: newPagination, sortBy })
  }

  return (
    <>
      <Heading
        sx={{
          ...(filterState.columns.length > 4
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
        as="h2"
      >
        {header.findFintechs}
      </Heading>
      <Section
        sx={{
          mt: 5,
          p: 5,
          ...(filterState.columns.length > 4
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
      >
        {!dataLoading && !!totalCompanies && (
          <>
            <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading as="h4" sx={{ fontWeight: 'bold' }}>
                {totalCompanies ? `${totalCompanies}` : ''} Companies
              </Heading>
            </Flex>
            <Divider opacity={0.3} my={5} />
          </>
        )}
        <FindFintechsFilter
          filter={filterState}
          onChangeFilter={onChangeFilter}
          gotoPage={gotoPage}
          resetFilter={resetFilter}
          refetchAPI={() => {
            gotoPage({ ...filterState.pagination, page: 1 }, filterState.sortBy)
          }}
          isRange={isRange}
          setIsRange={setIsRange}
        />

        {dataLoading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : !data || !data?.getFindFintechs.companies.length ? (
          <Paragraph sx={{ textAlign: 'center', p: 20, my: 40 }}>NO DATA AVAILABLE</Paragraph>
        ) : (
          <>
            <FindFintechsList
              data={data?.getFindFintechs.companies || []}
              columns={filterState.columns}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              applyColumns={() => {
                onChangeFilter({ ...filterState, columns: selectedColumns })
              }}
            />
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={filterState.pagination.page}
              pageSize={filterState.pagination.pageSize}
              totalPages={Math.ceil(totalCompanies / filterState.pagination.pageSize)}
              changePage={page => {
                gotoPage({ ...filterState.pagination, page }, filterState.sortBy)
              }}
              changePageSize={pageSize => {
                gotoPage({ ...defaultPagination, pageSize }, filterState.sortBy)
              }}
            />
          </>
        )}

        {message.title && message.content && (
          <Modal
            sx={{ minWidth: 500 }}
            buttons={[
              {
                label: 'Ok',
                type: 'primary',
                action: () => {
                  setMessage({ title: '', content: '' })
                },
              },
            ]}
          >
            <>
              <Flex>
                <Icon icon="alert" size="small" background="red" color="white" />
                <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                  {message.title}
                </Heading>
              </Flex>
              <Paragraph center sx={{ mt: 3, fontSize: 16, lineHeight: 2 }}>
                {message.content}
              </Paragraph>
            </>
          </Modal>
        )}
      </Section>
    </>
  )
}

export default FindFintechs
