import { useLazyQuery } from '@apollo/client'
import { Flex, Grid } from '@theme-ui/components'
import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  ButtonText,
  Drawer,
  FooterCTAs,
  Icon,
  Modal,
  Pagination,
  SearchResultBlock,
  Updating,
} from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { formatInternalSearchResult } from '../Merge/helpers'
import { MappingItem } from '../../components'
import { MAPPING_GRID } from '../../components/MappingZone/helpers'
import strings from '../../strings'
import FilterForm from '../../components/MappingZone/FilterForm'
import { FilterType } from '../../components/MappingZone/FilterForm/helpers'
import { getMappingZone } from './graphql'
import { AggregatedItem } from '../../components/MappingZone'
import { SearchExternal, SearchInternal } from '../SearchResults/graphql'
import {
  isCompanyId,
  isGrantedPermissions,
  isURL,
  localstorage,
  LocalstorageFields,
} from '../../utils'
import { SearchResultItem } from '../../types'
import { useHistory } from 'react-router'
import { EPageKey, PERMISSIONS, Routes } from '../../types/enums'
import { ETLRunTimeContext, UserContext } from '../../context'

const initialState: FilterType = {
  geography: {
    region: [],
    region1: [],
    region2: [],
    countries: [],
  },
  fundingAmount: {
    from: '',
    to: '',
  },
  years: {
    year: '',
    yearRange: {
      from: '',
      to: '',
    },
  },
  investorType: [],
  investors: [],
}

let timer: any

const MappingZone = () => {
  const history = useHistory()
  const isFirstRun = useRef(true)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { user } = React.useContext(UserContext)

  const hasPermission = React.useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.COMPANY_EDIT_SOURCE] }, user),
    [user]
  )

  const { mappingZone: copy } = strings

  const [companies, setCompanies] = useState<{
    mapping?: SearchResultItem
    internal: SearchResultItem[]
    external: SearchResultItem[]
  }>({ internal: [], external: [] })

  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 1,
    size: 20,
  })
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [filterState, setFilterState] = useState<FilterType>({ ...initialState })
  const [searchText, setSearchText] = useState<string>('')
  const [isRange, setIsRange] = useState<boolean>(false)
  const [isInMapping, setIsInMapping] = useState<boolean>(false)
  const [errorText, setErrorText] = useState<string>('')

  const [internalCompanies, setInternalCompanies] = useState<SearchResultItem[]>([])
  const isSearchURL = isURL(searchText)
  const isId = isCompanyId(searchText)

  // GRAPHQL
  const [getMapping, { data, loading }] = useLazyQuery(getMappingZone, {
    fetchPolicy: 'network-only',
  })
  const [searchInternal, { loading: queryInternalLoading, data: internalData }] = useLazyQuery(
    SearchInternal,
    {
      fetchPolicy: 'network-only',
      onCompleted() {
        setInternalCompanies(
          formatInternalSearchResult(internalData?.getInternalSearchResults || [])
        )
      },
    }
  )
  const [searchExternal, { loading: queryExternalLoading, data: externalData }] = useLazyQuery(
    SearchExternal
  )

  const refetchAPI = (filter = filterState, page = pagination.page) => {
    getMapping({
      variables: {
        input: {
          sortBy: 'DESC',
          amountFrom: filter.fundingAmount.from,
          amountTo: filter.fundingAmount.to,
          year: isRange ? '' : filter.years.year,
          yearFrom: isRange ? filter.years.yearRange.from : '',
          yearTo: isRange ? filter.years.yearRange.to : '',
          pageIndex: page,
          pageSize: pagination.size,
          region1: filter.geography.region.map(({ name }) => name),
          region2: filter.geography.region1.map(({ name }) => name),
          region3: filter.geography.region2.map(({ name }) => name),
          countries: filter.geography.countries.map(({ name }) => name),
          investorTypes: filter.investorType.map(({ label }) => label),
          investors: filter.investors.map(({ label }) => label),
        },
      },
    })
  }

  useEffect(() => {
    if (isFirstRun.current) {
      const filter = localstorage.get(LocalstorageFields.MAPPING_ZONE_FILTER)
      if (filter) onChangeFilter(JSON.parse(filter))
      else refetchAPI()
      isFirstRun.current = false
    }
  })

  const searchCompany = (name?: string) => {
    searchInternal({
      variables: {
        internal: {
          query: name || searchText,
          limit: 101,
          type: isSearchURL ? 'URL' : isId ? 'ID' : 'NAME',
        },
      },
    })
    searchExternal({
      variables: {
        external: { query: name || searchText, limit: 101, type: isSearchURL ? 'URL' : 'NAME' },
      },
    })
  }

  const onChangeFilter = (value: FilterType) => {
    setFilterState(value)
    setPagination({ ...pagination, page: 1 })
    localstorage.set(LocalstorageFields.MAPPING_ZONE_FILTER, JSON.stringify(value))
    clearTimeout(timer)
    timer = setTimeout(() => {
      refetchAPI(value, 1)
    }, 500)
  }

  const onChangePage = (page: number) => {
    setPagination({ ...pagination, page })
    refetchAPI(undefined, page)
  }

  const onMap = (company: SearchResultItem) => {
    if (!checkTimeETL()) return
    setSearchText(company.companyDetails.companyName)
    setCompanies({ mapping: company, internal: [], external: [] })
    searchCompany(company.companyDetails.companyName)
    setIsInMapping(true)
  }

  const getState = (state: SearchResultItem[]) => {
    let result = {} as any
    for (let i in state) {
      result[state[i].companyDetails.companyId] = true
    }
    return result
  }

  const checkSourceDefault = (state?: SearchResultItem[]) => {
    const companiesDefault = getCompanies(companies.mapping?.company_id)

    const checkDuplicate = companiesDefault?.filter(({ source }) =>
      state?.find(c => c.source === source)
    )
    if (!!checkDuplicate?.length) {
      setErrorText(
        `Warning: An aggregated company can only have one source per data provider - please keep only one ${checkDuplicate
          ?.map(({ source }) => source)
          .join(', ')} company and set the fct status for the other as source-duplicate`
      )
      return false
    }

    return true
  }

  const checkDuplicateSource = (state?: SearchResultItem[]) => {
    const checkDuplicate = [...companies.internal, ...companies.external].filter(({ source }) =>
      state?.find(c => c.source === source)
    )

    return checkDuplicate?.map(({ company_id }) => company_id)
  }

  const getCompanies = (id?: string) => {
    if (!id) return []
    return internalData?.getInternalSearchResults.filter(
      ({ company_id }: SearchResultItem) => company_id === id
    ) as SearchResultItem[]
  }

  return (
    <>
      <Heading sx={{ mb: 5 }} as="h2">
        Mapping Zone
      </Heading>
      {!isInMapping ? (
        <Section>
          <Flex sx={{ justifyContent: 'flex-end' }}>
            <Button
              onPress={() => {
                setFilterVisible(true)
              }}
              sx={{ color: 'primary' }}
              icon="filter"
              variant="outline"
              label={copy.buttons.filter}
              color="black50"
              iconLeft
            />
          </Flex>
          {loading ? (
            <Updating loading noPadding sx={{ p: 6, borderRadius: 12, my: 4 }} />
          ) : !data?.getMappingZone.companies.length ? (
            <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA AVAILABLE</Paragraph>
          ) : (
            <>
              <Grid
                gap={'1px'}
                columns={MAPPING_GRID}
                sx={{
                  alignItems: 'center',
                  borderRadius: 10,
                  my: 3,
                  py: 2,
                }}
              >
                <Paragraph sx={{ gridColumn: 'company / company-end' }} bold>
                  {copy.grid.company}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'url /url-end' }} bold>
                  {copy.grid.website}
                </Paragraph>
                <Paragraph sx={{ justifySelf: 'center', gridColumn: 'amount /amount-end' }} bold>
                  {copy.grid.amount}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'source /source-end' }} bold>
                  {copy.grid.source}
                </Paragraph>
                <Flex sx={{ mr: 2, justifyContent: 'flex-end', gridColumn: 'button' }}></Flex>
              </Grid>

              {data?.getMappingZone.companies &&
                formatInternalSearchResult(data.getMappingZone.companies || []).map((c, index) => {
                  if (!Array.isArray(c.source)) {
                    return (
                      <Flex sx={{ mt: index > 0 ? 2 : 0 }} key={index}>
                        <MappingItem
                          onMap={() => {
                            onMap(c)
                          }}
                          isInDefaultSelected
                          isInReAggregate
                          type="internal"
                          {...c}
                        />
                      </Flex>
                    )
                  }
                  return (
                    <Flex sx={{ mt: index > 0 ? 2 : 0 }} key={index}>
                      <AggregatedItem
                        onMap={() => {
                          onMap(c)
                        }}
                        company={c.companyDetails}
                        sources={c.source}
                        isInDefaultSelected
                        isInReAggregate
                        {...c}
                      />
                    </Flex>
                  )
                })}
              {!!data?.getMappingZone.companies.length && (
                <Pagination
                  sx={{ justifyContent: 'center' }}
                  currentPage={pagination.page}
                  totalPages={Math.ceil(data?.getMappingZone.total / pagination.size)}
                  changePage={page => onChangePage(page)}
                />
              )}
            </>
          )}
        </Section>
      ) : (
        <Section>
          {queryInternalLoading || queryExternalLoading ? (
            <Updating sx={{ py: 7 }} loading />
          ) : (
            <>
              <ButtonText
                sx={{ mb: 5 }}
                onPress={() => {
                  setIsInMapping(false)
                }}
              />
              <SearchResultBlock
                onChange={event => {
                  const companiesFilter = getCompanies(event.companyId)
                  if (!checkSourceDefault(companiesFilter)) {
                    return
                  }
                  const ids = checkDuplicateSource(companiesFilter)

                  const company = internalCompanies.find(
                    (c: any) => c.company_id === event.companyId
                  )
                  if (company?.source === companies.mapping?.source) {
                    return
                  }

                  const isChecked = companies.internal.some(c => c.company_id === event.companyId)
                  const internal = isChecked
                    ? [...companies.internal].filter(e => e.company_id !== event.companyId)
                    : [
                        ...companies.internal.filter(c => !ids?.includes(c.company_id)),
                        ...companiesFilter,
                      ]
                  setCompanies({
                    ...companies,
                    internal,
                    external: companies.external.filter(
                      ex => !internal.some(i => i.source === ex.source)
                    ),
                  })
                }}
                type={'internal'}
                list={
                  companies.mapping
                    ? [
                        companies.mapping,
                        ...internalCompanies.filter(
                          ({ company_id }) => company_id !== companies.mapping?.company_id
                        ),
                      ]
                    : internalCompanies.filter(
                        ({ company_id }) => company_id !== companies.mapping?.company_id
                      )
                }
                state={{
                  [companies.mapping?.company_id || '']: true,
                  ...getState(companies.internal),
                }}
                disabledList={companies.mapping ? [companies.mapping.companyDetails.companyId] : []}
              />
              <SearchResultBlock
                onChange={event => {
                  const company = externalData?.getExternalSearchResults.find(
                    (c: any) => c.companyDetails.companyId === event.companyId
                  )
                  if (!checkSourceDefault([company])) {
                    return
                  }

                  const ids = checkDuplicateSource([company])

                  if (company?.source === companies.mapping?.source) {
                    return
                  }
                  const isChecked = companies.external.some(
                    c => c.companyDetails.companyId === event.companyId
                  )
                  const external = isChecked
                    ? [...companies.external].filter(
                        e => e.companyDetails.companyId !== event.companyId
                      )
                    : [
                        ...companies.external.filter(c => c.source !== company?.source),
                        {
                          ...(company || ({} as SearchResultItem)),
                        },
                      ]
                  setCompanies({
                    ...companies,
                    external,
                    internal: companies.internal.filter(i => !ids?.includes(i.company_id)),
                  })
                }}
                type={'external'}
                sx={{ mt: 6 }}
                list={externalData?.getExternalSearchResults || []}
                state={getState(companies.external)}
              />
            </>
          )}
        </Section>
      )}

      {isInMapping && (
        <FooterCTAs
          buttons={[
            {
              label: copy.buttons.merge,
              onClick: () => {
                localstorage.set(LocalstorageFields.IS_MAPPING_ZONE, '1')
                const internalCompanyMappings = (
                  internalData?.getInternalSearchResults || []
                ).filter((item: SearchResultItem) =>
                  ([companies.mapping, ...companies.internal] as SearchResultItem[])
                    .map(({ company_id }: SearchResultItem) => company_id)
                    .includes(item.company_id)
                )
                if (!companies.external.length) {
                  localstorage.set(
                    LocalstorageFields.COMPANY_MERGE,
                    JSON.stringify(internalCompanyMappings)
                  )
                  history.push(
                    Routes.MERGE_COMPANY.replace(
                      ':query',
                      encodeURIComponent(searchText).concat(`?page=${EPageKey.MAPPING_ZONE}`)
                    )
                  )
                } else {
                  localstorage.set(
                    LocalstorageFields.COMPANY_AGGREGATE,
                    JSON.stringify({
                      internal: { [companies.mapping?.companyDetails.companyId || '']: true },
                      external: getState(companies.external),
                    })
                  )
                  if (!!companies.internal.length) {
                    localstorage.set(
                      LocalstorageFields.COMPANY_MERGE,
                      JSON.stringify([...companies.internal])
                    )
                  } else localstorage.remove(LocalstorageFields.COMPANY_MERGE)
                  history.push(
                    Routes.SEARCH_QUERY.replace(':query', encodeURIComponent(searchText)).concat(
                      `?page=${EPageKey.MAPPING_ZONE}`
                    )
                  )
                }
              },
              disabled:
                !hasPermission ||
                !companies.mapping ||
                (!companies.internal.length && !companies.external.length) ||
                queryInternalLoading ||
                queryExternalLoading,
            },
            {
              label: copy.buttons.map,
              onClick: () => {
                if (companies.mapping?.company_id) {
                  history.push(
                    Routes.EDIT_COMPANY_TAXONOMY.replace(
                      ':id',
                      companies.mapping?.company_id
                    ).concat(`?page=${EPageKey.MAPPING_ZONE}`)
                  )
                }
              },
              disabled:
                !companies.mapping ||
                !!companies.internal.length ||
                !!companies.external.length ||
                queryInternalLoading ||
                queryExternalLoading,
            },
          ]}
        />
      )}
      {!!errorText.length && (
        <Modal
          sx={{
            width: '670px',
            maxWidth: '100%',
            padding: '60px 80px',
          }}
          buttons={[
            {
              label: 'OK',
              type: 'primary',
              action: () => {
                setErrorText('')
              },
            },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Flex>
            <Icon icon="alert" size="small" background="red" color="white" />
            <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
              Error!
            </Heading>
          </Flex>
          <Paragraph center sx={{ mt: 20, lineHeight: '30px' }}>
            {errorText}
          </Paragraph>
        </Modal>
      )}
      <Drawer visible={filterVisible}>
        {filterVisible && (
          <FilterForm
            filterState={filterState}
            isRange={isRange}
            setIsRange={setIsRange}
            setFilterState={(value: FilterType) => onChangeFilter(value)}
            onClose={() => {
              setFilterVisible(false)
            }}
            resetFilter={() => {
              onChangeFilter({ ...initialState })
            }}
          />
        )}
      </Drawer>
    </>
  )
}
export default MappingZone
