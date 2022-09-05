import { Divider, Flex } from '@theme-ui/components'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Button, ButtonText, Icon, Modal, Pagination, Updating } from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { FormOption, IPagination } from '../../types'
import { EnumUserGroups, PERMISSIONS, Routes, SortDirection } from '../../types/enums'
import { useLazyQuery } from '@apollo/client'
import {
  employeeCountOptions,
  OverviewFilterType,
  GeographyFilterType,
  FinancingFilterType,
  MnAFilterType,
  AttachmentFilterType,
  SourceFilterType,
  SortBy,
  ESortFields,
  ECombination,
  IpoFilterType,
  getChildrenCluster,
  CompanyManagementResult,
  KeywordFilterType,
  keywordOptions,
  EKeywordSearch,
} from './CompanyFilter/helpers'
import { GET_COMPANY_MANAGEMENT_DATA, GET_TOTAL_COMPANY_MANAGEMENT } from './graphql'
import CompanyList from './CompanyList'
import CompanyFilter from './CompanyFilter'
import { useHistory } from 'react-router'
import { isGrantedPermissions, localstorage, LocalstorageFields } from '../../utils'
import { GET_BULK_EDIT_DATA } from '../BulkEdit/graphql'
import { GetDimensionsItem } from '../TaxonomyManagement'
import { Text } from 'theme-ui'
import { ETLRunTimeContext, UserContext } from '../../context'
import CompaniesDownload from './CompaniesDownload'

const initialOverview: OverviewFilterType = {
  isBlankFoundedYear: false,
  years: {
    isRange: false,
    from: '',
    to: '',
  },
  isBlankDescription: false,
  description: [],
  descriptionCombination: ECombination.OR,
  categoryCombination: ECombination.OR,
  category: [],
  sector: [],
  valueChain: [],
  risk: [],
  cluster: [],
  tags: [],
  mappingType: null,
  fintechTypes: [],
  fintechTypesCombination: ECombination.OR,
  operationStatuses: null,
  isBlankEmployeesCount: false,
  employeeCount: {
    from: '',
    to: '',
  },
  fctStatusId: 1,
  sectorsCombination: ECombination.OR,
  valueChainsCombination: ECombination.OR,
  risksCombination: ECombination.OR,
  clustersCombination: ECombination.OR,
}
const initialKeyword: KeywordFilterType = {
  keywords: keywordOptions.filter(o => o.value !== EKeywordSearch.NEWS),
  operations: [],
}
const initialGeography: GeographyFilterType = {
  region: [],
  region1: [],
  region2: [],
  countries: [],
  city: [],
  isBlankCity: false,
}
const initialFinancing: FinancingFilterType = {
  totalFunding: {
    from: '',
    to: '',
  },
  latestExpandRound1Amount: {
    from: '',
    to: '',
  },
  latestExpandRound1Type: [],
  latestExpandRound2Amount: {
    from: '',
    to: '',
  },
  latestExpandRound2Type: [],
  allExpandRound1Amount: {
    from: '',
    to: '',
  },
  allExpandRound1Type: [],
  allExpandRound2Amount: {
    from: '',
    to: '',
  },
  allExpandRound2Type: [],
  isBlankFundingYear: false,
  fundingYear: {
    isRange: false,
    from: '',
    to: '',
  },
  isBlankInvestor: false,
  investors: [],
  investorTypes: [],
  isBlankLeadInvestor: false,
  leadInvestors: [],
  leadInvestorType: [],
  numOfInvestors: {
    from: '',
    to: '',
  },
  allExpandRound1TypeCombination: ECombination.OR,
  allExpandRound2TypeCombination: ECombination.OR,
  investorTypesCombination: ECombination.OR,
  leadInvestorTypesCombination: ECombination.OR,
}
const initialMnA: MnAFilterType = {
  isBlankAcquiredYear: false,
  acquiredYear: {
    isRange: false,
    from: '',
    to: '',
  },
  isBlankAcquirers: false,
  acquirers: [],
  acquirerTypes: [],
  latestAcquisitionAmount: {
    from: '',
    to: '',
  },
  acquirerTypesCombination: ECombination.OR,
}
const initialIpo: IpoFilterType = {
  isIpoPublicYearBlank: false,
  ipoPublicYear: {
    isRange: false,
    from: '',
    to: '',
  },
  ipoAmount: {
    from: '',
    to: '',
  },
  ipoValuation: {
    from: '',
    to: '',
  },
  ipoStockExchange: [],
  isIpoStockExchangeBlank: false,
}
const initialAttachment: AttachmentFilterType = {
  isBlankAttachment: false,
  attachmentType: [],
  attachmentTypeCombination: ECombination.OR,
}
const initialSource: SourceFilterType = {
  priority: [],
  all: [],
  allSourceCombination: ECombination.OR,
}

const defaultColumns: FormOption[] = [
  { label: 'Website', value: 'website_url' },
  { label: 'Country', value: 'country_name' },
  { label: 'Category', value: 'category' },
  { label: 'FCT status', value: 'fct_status_id' },
]

export const defaultPagination: IPagination = {
  page: 1,
  pageSize: 10,
}

const defaultSortBy: SortBy = {
  field: ESortFields.NAME,
  direction: SortDirection.ASC,
}

const initialFilterState = {
  filterOverview: { ...initialOverview },
  filterKeyword: { ...initialKeyword },
  filterGeography: {
    ...initialGeography,
  },
  filterFinancing: { ...initialFinancing },
  filterMnA: { ...initialMnA },
  filterIpo: { ...initialIpo },
  filterAttachment: { ...initialAttachment },
  filterSource: { ...initialSource },
  filterColumns: [...defaultColumns],
}

const CompanyManagement = () => {
  const isFirstRun = useRef(true)
  const history = useHistory()
  const { user } = useContext(UserContext)
  const canBulkEdit = React.useMemo(
    () =>
      isGrantedPermissions(
        {
          permissions: PERMISSIONS[Routes.COMPANY_MANAGEMENT]?.filter(
            o => o !== EnumUserGroups.EVS
          ),
        },
        user
      ),
    [user]
  )

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const [filterState, setFilterState] = useState({ ...initialFilterState })
  const [filterOverview, setFilterOverview] = useState<OverviewFilterType>(
    filterState.filterOverview
  )
  const [filterKeyword, setFilterKeyword] = useState<KeywordFilterType>(filterState.filterKeyword)
  const [filterGeography, setFilterGeography] = useState<GeographyFilterType>(
    filterState.filterGeography
  )
  const [filterFinancing, setFilterFinancing] = useState<FinancingFilterType>(
    filterState.filterFinancing
  )
  const [filterMnA, setFilterMnA] = useState<MnAFilterType>(filterState.filterMnA)
  const [filterIpo, setFilterIpo] = useState<IpoFilterType>(filterState.filterIpo)
  const [filterAttachment, setFilterAttachment] = useState<AttachmentFilterType>(
    filterState.filterAttachment
  )
  const [filterSource, setFilterSource] = useState<SourceFilterType>(filterState.filterSource)

  const [filterCompanyIds, setCompanyIds] = useState<number[]>([])
  const [filterColumns, setFilterColumns] = useState<FormOption[]>([...defaultColumns])
  const [sortBy, setSortBy] = useState<SortBy>({ ...defaultSortBy })
  const [pagination, setPagination] = useState<IPagination>({
    ...defaultPagination,
  })
  const [companySelected, setCompanySelected] = useState<number[]>([])
  const [isSelectedAll, setSelectedAll] = useState<boolean>(false)
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })
  const [clustersData, setClustersData] = useState<GetDimensionsItem[]>()
  const [totalCompanies, setTotalCompanies] = useState<number>(0)

  const input = useCallback(
    (
      overview: OverviewFilterType = filterState.filterOverview,
      filterKeyword: KeywordFilterType = filterState.filterKeyword,
      geography: GeographyFilterType = filterState.filterGeography,
      financing: FinancingFilterType = filterState.filterFinancing,
      mnA: MnAFilterType = filterState.filterMnA,
      ipo: IpoFilterType = filterState.filterIpo,
      attachment: AttachmentFilterType = filterState.filterAttachment,
      source: SourceFilterType = filterState.filterSource,
      columnsFilter: FormOption[] = filterState.filterColumns,
      sortByOptions: SortBy = sortBy,
      companyIds: number[] = filterCompanyIds
    ) => {
      return {
        pageNumber: pagination.page,
        pageSize: pagination.pageSize,
        // Overview
        descriptionKeywords: overview.description,
        descriptionKeywordsCombination: overview.descriptionCombination,
        categories: overview.category.map(({ value }) => value),
        categoryCombination: overview.categoryCombination,
        sectors: overview.sector.map(({ value }) => value),
        valueChains: overview.valueChain.map(({ value }) => value),
        risks: overview.risk.map(({ value }) => value),
        clusters: overview.cluster
          .filter(({ value }) => !!value.length)
          .map(item => ({
            combination: item.combination,
            clusterIds:
              item.clusterIds || getChildrenCluster(clustersData || [], item.value[0]?.value),
          })),
        tags: overview.tags
          .filter(({ value }) => !!value.length)
          .map(item => ({
            combination: item.combination,
            id: +item.value[0].value,
            isNot: item.isNot,
          })),
        fintechTypes: overview.fintechTypes.map(({ value }) => value),
        fintechTypesCombination: overview.fintechTypesCombination,
        foundedYearFrom: overview.years.from,
        foundedYearTo: overview.years.to,
        operationStatuses: overview.operationStatuses,
        numOfEmployeesRanges:
          !overview.employeeCount.from.length && !overview.employeeCount.to.length
            ? null
            : employeeCountOptions
                .filter(
                  o =>
                    +o.value >= +overview.employeeCount.from &&
                    +o.value <= +overview.employeeCount.to
                )
                .map(({ label }) => label),
        mappingType: overview.mappingType,
        fctStatusId: overview.fctStatusId ? +overview.fctStatusId : null,
        // Keyword
        keywordSearch: {
          keywords: filterKeyword.keywords.map(({ value }) => value),
          operations: filterKeyword.operations.filter(({ value }) => !!value?.toString().length),
        },
        // Geography
        regions: geography.region.map(({ name }) => name),
        subRegions: geography.region1.map(({ name }) => name),
        subRegion2s: geography.region2.map(({ name }) => name),
        countries: geography.countries.map(({ name }) => name),
        city: geography.city[0],
        isBlankCity: geography.isBlankCity,

        isBlankDescription: overview.isBlankDescription,
        isBlankFoundedYear: overview.isBlankFoundedYear,
        isBlankEmployeesCount: overview.isBlankEmployeesCount,
        isBlankNumberOfInvestor: false,
        isBlankFundingYear: financing.isBlankFundingYear,
        isBlankInvestor: financing.isBlankInvestor,
        isBlankLeadInvestor: financing.isBlankLeadInvestor,
        isBlankAcquiredYear: mnA.isBlankAcquiredYear,
        isBlankAcquirers: mnA.isBlankAcquirers,
        isIpoPublicYearBlank: ipo.isIpoPublicYearBlank,
        isBlankAttachment: attachment.isBlankAttachment,

        totalFundingFrom: financing.totalFunding.from,
        totalFundingTo: financing.totalFunding.to,
        latestExpandRound1AmountFrom: financing.latestExpandRound1Amount.from,
        latestExpandRound1AmountTo: financing.latestExpandRound1Amount.to,
        latestExpandRound1Type: financing.latestExpandRound1Type.map(item => item.value),
        latestExpandRound2Type: financing.latestExpandRound2Type.map(item => item.value),
        allExpandRound1AmountFrom: financing.allExpandRound1Amount.from,
        allExpandRound1AmountTo: financing.allExpandRound1Amount.to,
        allExpandRound1Type: financing.allExpandRound1Type.map(item => item.value),
        allExpandRound2Type: financing.allExpandRound2Type.map(item => item.value),
        fundingYearFrom: financing.fundingYear.from,
        fundingYearTo: financing.fundingYear.isRange
          ? financing.fundingYear.to
          : financing.fundingYear.from,
        investors: financing.investors.map(({ value }) => value),
        investorTypes: financing.investorTypes.map(({ value }) => value),
        leadInvestors: financing.leadInvestors.map(({ value }) => value),
        leadInvestorTypes: financing.leadInvestorType.map(({ value }) => value),
        numberOfInvestorFrom: financing.numOfInvestors.from,
        numberOfInvestorTo: financing.numOfInvestors.to,

        acquiredYearFrom: mnA.acquiredYear.from,
        acquiredYearTo: mnA.acquiredYear.to,
        acquirerTypes: mnA.acquirerTypes.map(({ value }) => value),
        acquirers: mnA.acquirers.map(({ value }) => value),
        latestAcquisitionAmountFrom: mnA.latestAcquisitionAmount.from,
        latestAcquisitionAmountTo: mnA.latestAcquisitionAmount.to,

        ipoPublicYearFrom: ipo.ipoPublicYear.from,
        ipoPublicYearTo: ipo.ipoPublicYear.to,
        ipoAmountFrom: ipo.ipoAmount.from,
        ipoAmountTo: ipo.ipoAmount.to,
        ipoValuationFrom: ipo.ipoValuation.from,
        ipoValuationTo: ipo.ipoValuation.to,
        ipoStockExchange: ipo.ipoStockExchange[0],
        isIpoStockExchangeBlank: ipo.isIpoStockExchangeBlank,

        attachmentTypes: attachment.attachmentType.map(({ value }) => value),

        prioritySource: source.priority.map(({ value }) => value),
        allSource: source.all.map(({ value }) => value),

        orderBy: [{ field: sortByOptions.field, direction: sortByOptions.direction }],
        selectedColumns: [
          'company_id',
          'name',
          'logo_bucket_url',
          ...columnsFilter.map(({ value }) => value),
        ],

        sectorsCombination: overview.sectorsCombination,
        clustersCombination: overview.clustersCombination,
        risksCombination: overview.risksCombination,
        valueChainsCombination: overview.valueChainsCombination,
        allExpandRound1TypeCombination: financing.allExpandRound1TypeCombination,
        allExpandRound2TypeCombination: financing.allExpandRound2TypeCombination,
        investorTypesCombination: financing.investorTypesCombination,
        leadInvestorTypesCombination: financing.leadInvestorTypesCombination,
        acquirerTypesCombination: mnA.acquirerTypesCombination,
        attachmentTypeCombination: attachment.attachmentTypeCombination,
        allSourceCombination: source.allSourceCombination,

        companyIds: companyIds,
      }
    },
    [pagination, filterState, sortBy, filterCompanyIds, clustersData]
  )

  // GRAPHQL
  const [getCompanyData, { data: companyData, loading: companyLoading }] = useLazyQuery(
    GET_COMPANY_MANAGEMENT_DATA,
    {
      fetchPolicy: 'network-only',
      onError(error) {
        setMessage({ title: 'Error', content: error.message })
      },
    }
  )
  const [getTotalCompany, { loading: totalLoading }] = useLazyQuery(GET_TOTAL_COMPANY_MANAGEMENT, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      setTotalCompanies(+res.getTotalCompanyManagement.total)
    },
    onError() {
      setTotalCompanies(0)
    },
  })
  const [getBulkEditData, { loading }] = useLazyQuery(GET_BULK_EDIT_DATA, {
    onCompleted(res) {
      localstorage.set(
        LocalstorageFields.BULK_EDIT,
        JSON.stringify({
          filter: isSelectedAll ? input() : undefined,
          companyIds: companySelected,
        })
      )
      history.push(Routes.BULK_EDIT)
    },
    onError(error) {
      setMessage({
        title: 'Error',
        content: error.message,
      })
    },
  })

  const refetchAPI = useCallback(
    ({ page = pagination.page, pageSize = pagination.pageSize, req = input() }) => {
      getCompanyData({ variables: { input: { ...req, pageNumber: page, pageSize } } })
      getTotalCompany({ variables: { input: { ...req, pageNumber: page, pageSize } } })
    },
    [getCompanyData, getTotalCompany, input, pagination]
  )

  const saveFilterState = useCallback(({ filterState, sortBy, pagination }) => {
    localstorage.set(
      LocalstorageFields.COMPANY_MANAGEMENT,
      JSON.stringify({
        ...filterState,
        sortBy,
        pagination,
      })
    )
  }, [])

  const applyFilter = useCallback(() => {
    const newFilterState = {
      filterOverview: {
        ...filterOverview,
        // selected sectors with childrens for saving to localStorage
        cluster: filterOverview.cluster.map(item => ({
          ...item,
          clusterIds: getChildrenCluster(clustersData || [], item.value[0]?.value),
        })),
      },
      filterKeyword,
      filterGeography,
      filterFinancing,
      filterMnA,
      filterIpo,
      filterAttachment,
      filterSource,
      filterColumns,
    }
    setFilterState(newFilterState)
    saveFilterState({ filterState: newFilterState, sortBy, pagination })
    setPagination({ ...pagination, page: 1 })
    const filter = {
      ...pagination,
      page: 1,
      req: input(
        newFilterState.filterOverview,
        newFilterState.filterKeyword,
        newFilterState.filterGeography,
        newFilterState.filterFinancing,
        newFilterState.filterMnA,
        newFilterState.filterIpo,
        newFilterState.filterAttachment,
        newFilterState.filterSource,
        newFilterState.filterColumns,
        sortBy,
        filterCompanyIds
      ),
    }
    refetchAPI(filter)
    setCompanySelected([])
    setSelectedAll(false)
  }, [
    pagination,
    filterOverview,
    filterKeyword,
    filterGeography,
    filterFinancing,
    filterMnA,
    filterIpo,
    filterAttachment,
    filterSource,
    refetchAPI,
    input,
    filterColumns,
    filterCompanyIds,
    saveFilterState,
    sortBy,
    clustersData,
  ])

  const revertFilterChange = useCallback(
    (state: typeof initialFilterState = filterState) => {
      setFilterOverview(state.filterOverview)
      setFilterGeography(state.filterGeography)
      setFilterFinancing(state.filterFinancing)
      setFilterKeyword(state.filterKeyword)
      setFilterMnA(state.filterMnA)
      setFilterIpo(state.filterIpo)
      setFilterAttachment(state.filterAttachment)
      setFilterSource(state.filterSource)
      setFilterColumns(state.filterColumns)
    },
    [filterState]
  )

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      const filterStr = localstorage.get(LocalstorageFields.COMPANY_MANAGEMENT)
      if (filterStr) {
        const {
          sortBy: savedSortBy = sortBy,
          pagination: savedPagination = pagination,
          ...savedFilterState
        } = JSON.parse(filterStr)

        const copyFilterState = savedFilterState || filterState
        setSortBy(savedSortBy)
        setPagination(savedPagination)
        setFilterState(copyFilterState)
        revertFilterChange(copyFilterState)
        refetchAPI({
          ...savedPagination,
          req: input(
            copyFilterState.filterOverview,
            copyFilterState.filterKeyword,
            copyFilterState.filterGeography,
            copyFilterState.filterFinancing,
            copyFilterState.filterMnA,
            copyFilterState.filterIpo,
            copyFilterState.filterAttachment,
            copyFilterState.filterSource,
            copyFilterState.filterColumns,
            savedSortBy
          ),
        })
      } else refetchAPI({})
      return
    }
  }, [refetchAPI, sortBy, pagination, filterState, revertFilterChange, input])

  const resetFilter = () => {
    setFilterOverview(initialOverview)
    setFilterKeyword(initialKeyword)
    setFilterGeography(initialGeography)
    setFilterFinancing(initialFinancing)
    setFilterMnA(initialMnA)
    setFilterIpo(initialIpo)
    setFilterAttachment(initialAttachment)
    setFilterSource(initialSource)
    setFilterColumns(defaultColumns)
    setPagination({ ...pagination, page: 1 })
    setFilterState({ ...initialFilterState })
    setCompanyIds([])
    refetchAPI({
      ...pagination,
      page: 1,
      req: input(
        initialOverview,
        initialKeyword,
        initialGeography,
        initialFinancing,
        initialMnA,
        initialIpo,
        initialAttachment,
        initialSource,
        defaultColumns,
        sortBy,
        []
      ),
    })
    setCompanySelected([])
    setSelectedAll(false)
    localstorage.remove(LocalstorageFields.COMPANY_MANAGEMENT)
  }

  const gotoPage = (pagination: IPagination, newSortBy: SortBy = sortBy) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    setSortBy(newSortBy)
    saveFilterState({ filterState, sortBy: newSortBy, pagination: newPagination })
    refetchAPI({
      ...newPagination,
      req: input(
        filterOverview,
        filterKeyword,
        filterGeography,
        filterFinancing,
        filterMnA,
        filterIpo,
        filterAttachment,
        filterSource,
        filterColumns,
        newSortBy
      ),
    })
  }

  const totalSelected = React.useMemo(() => {
    return isSelectedAll ? +totalCompanies - companySelected.length : companySelected.length
  }, [isSelectedAll, companySelected, totalCompanies])

  return (
    <>
      <Heading
        sx={{
          ...(filterState.filterColumns.length > 3
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
        as="h2"
      >
        Company Management
      </Heading>
      <Section
        sx={{
          mt: 5,
          p: 5,
          ...(filterState.filterColumns.length > 3
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
      >
        {!companyLoading && !totalLoading && (
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading as="h4" sx={{ fontWeight: 'bold' }}>
              {totalCompanies} Companies
            </Heading>
          </Flex>
        )}
        <Divider opacity={0.3} my={5} />
        <CompanyFilter
          sortBy={sortBy}
          pagination={pagination}
          columnsFilter={filterColumns}
          gotoPage={gotoPage}
          filterOverview={filterOverview}
          filterKeyword={filterKeyword}
          filterGeography={filterGeography}
          filterFinancing={filterFinancing}
          filterMnA={filterMnA}
          filterIpo={filterIpo}
          filterAttachment={filterAttachment}
          filterSource={filterSource}
          setFilterOverview={setFilterOverview}
          setFilterKeyword={setFilterKeyword}
          setFilterGeography={setFilterGeography}
          setFilterFinancing={setFilterFinancing}
          setFilterMnA={setFilterMnA}
          setFilterIpo={setFilterIpo}
          setFilterAttachment={setFilterAttachment}
          setFilterSource={setFilterSource}
          resetFilter={resetFilter}
          revertFilterChange={revertFilterChange}
          refetchAPI={applyFilter}
          setCompanyIds={setCompanyIds}
          setClustersData={setClustersData}
        />

        {(isSelectedAll || !!companySelected.length) && (
          <Flex
            sx={{
              pl: 3,
              py: 3,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Paragraph bold>
              {`${totalSelected} ${totalSelected > 1 ? 'Companies' : 'Company'} Selected`}
            </Paragraph>
            <Flex>
              <CompaniesDownload
                totalCompanies={totalCompanies}
                companiesSelected={companyData?.getCompanyManagementData}
                companyIdsSelected={companySelected}
                isSelectedAll={isSelectedAll}
                filter={input()}
                columnList={filterState.filterColumns}
                setMessage={setMessage}
                filterCompanyIds={filterCompanyIds}
              />
              <Button
                sx={{ fontWeight: 'normal', display: !canBulkEdit ? 'none' : 'flex' }}
                disabled={!canBulkEdit}
                icon="pencil"
                label="Bulk Edit"
                iconLeft
                onPress={() => {
                  try {
                    if (!checkTimeETL()) return
                    getBulkEditData({
                      variables: {
                        input: {
                          filter: isSelectedAll ? input() : undefined,
                          companyIds: companySelected,
                        },
                      },
                    })
                  } catch (error) {
                    console.log('error', error)
                  }
                }}
              />
            </Flex>
          </Flex>
        )}

        {companyLoading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : !companyData || !companyData.getCompanyManagementData?.length ? (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA AVAILABLE</Paragraph>
        ) : (
          <>
            {(isSelectedAll ||
              (companyData?.getCompanyManagementData.filter(
                ({ company_id }: CompanyManagementResult) => companySelected.includes(company_id)
              ).length === companyData?.getCompanyManagementData.length &&
                !!companyData?.getCompanyManagementData.length)) && (
              <Flex sx={{ my: 3, justifyContent: 'center' }}>
                <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
                  All
                  <span style={{ fontWeight: 'bold' }}>{` ${
                    isSelectedAll
                      ? totalSelected
                      : companyData?.getCompanyManagementData.filter(
                          ({ company_id }: CompanyManagementResult) =>
                            companySelected.includes(company_id)
                        ).length
                  } `}</span>
                  companies on this page are selected
                </Text>
                <ButtonText
                  sx={{ ml: 3 }}
                  onPress={() => {
                    setSelectedAll(!isSelectedAll)
                    setCompanySelected([])
                  }}
                  label={
                    isSelectedAll ? `Clear selection` : `Select all ${totalCompanies} companies`
                  }
                />
              </Flex>
            )}
            <CompanyList
              canBulkEdit={canBulkEdit}
              data={companyData?.getCompanyManagementData}
              columnList={filterState.filterColumns}
              columnsFilter={filterColumns}
              companySelected={companySelected}
              setCompanySelected={setCompanySelected}
              setColumns={setFilterColumns}
              applyColumns={applyFilter}
              isSelectedAll={isSelectedAll}
            />
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={Math.ceil(totalCompanies / pagination.pageSize)}
              changePage={page => {
                gotoPage({ ...pagination, page }, sortBy)
              }}
              changePageSize={pageSize => {
                gotoPage({ ...defaultPagination, pageSize }, sortBy)
              }}
            />
          </>
        )}

        {((message.title && message.content) || loading) && (
          <Modal
            sx={{ minWidth: 500 }}
            buttons={
              loading
                ? []
                : [
                    {
                      label: 'Ok',
                      type: 'primary',
                      action: () => {
                        setMessage({ title: '', content: '' })
                      },
                    },
                  ]
            }
          >
            {loading ? (
              <Updating sx={{ py: 6 }} loading />
            ) : (
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
            )}
          </Modal>
        )}
      </Section>
    </>
  )
}

export default CompanyManagement
