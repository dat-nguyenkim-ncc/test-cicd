import { ApolloError, useApolloClient, useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import {
  FormSearch,
  Modal,
  CompanyEditSources,
  Message,
  Updating,
  ButtonText,
  Button,
} from '../../components'
import CompanyDetail, { KeysTabs } from '../../components/CompanyDetail'
import { ButtonType } from '../../components/Modal/Modal'
import { Heading, Paragraph } from '../../components/primitives'
import strings from '../../strings'
import {
  MappingCompanyDimensions,
  MappingSummary,
  MappedTagData,
  GetCompanyDimensions,
  SearchResultItem,
  SourceDetail,
  OverrideVisibilityRequest,
  OverridesConflictsValueWithUId,
  OverridesConflicts,
  TagNewsData,
  CompanyPriority,
} from '../../types'
import {
  EnumDimensionType,
  EnumExpandStatusId,
  EnumRemoveSourceType,
  Routes,
} from '../../types/enums'
import { getSource, localstorage, LocalstorageFields } from '../../utils'
import { GET_COMPANY_DIMENSIONS_NO_TAGS_PARENT } from '../CompanyForm/graphql'
import { internalSearchQL } from '../SearchResults/graphql'
import {
  getExternalCompany,
  createCompanyMutation,
  getInternalCompany,
  getExternalCompanies,
  setDefaultCompanyMutation,
  removeSourceMutation,
  getOverrideVisibility as getOverride,
  GET_SOURCE_PRIORITY,
} from './graphql'
import { modals } from './helpers'
import {
  CompanyDetails,
  CompanyToCreate,
  CreateNewCompanyType,
  SourcePriority,
} from '../../components/SearchResults/SearchResults'
import { cloneDeep } from '@apollo/client/utilities'
import { ResolveMergeOverridesConflicts } from '../../components/MergeData/MergeData'
import { v4 as uuidv4 } from 'uuid'
import MergeOverrides from '../../components/MergeData/tabs/MergeOverrides'
import { Box, Flex } from 'theme-ui'
import { Function } from '../../utils/consts'
import { ReverseSource } from '../../utils/getSource'
import { CRFilterNA, getMergeOverridesInput } from '../../utils/helper'
import { GET_PENDING_CR_BY_ID } from '../CompanyForm/graphql/pendingChangeRequests'
import { HasPendingCQField } from '../CompanyForm/CompanyForm'
import { ETLRunTimeContext } from '../../context'
import {
  CompanyNewsChartResult,
  GET_COMPANY_NEWS_CHART,
} from '../../components/CompanyDetail/tabs/CompanyDetailNews/components/SentimentChart'

type Params = {
  id: string
  source: string
}

type State = {
  modalVisible: keyof typeof modals | null
}

export type StateCurrent = {
  active: KeysTabs
}

function groupByFn<T>(arr: T[], keyFn: (item: T) => string, dataFn?: (item: T) => any) {
  return arr.reduce((prev, curr) => {
    const key = keyFn(curr)
    const data = [...(prev[key] || []), dataFn ? dataFn(curr) : curr]
    return {
      ...prev,
      [key]: data,
    }
  }, {} as Record<string, T[]>)
}

const convert2MappingSummary = (data: MappingCompanyDimensions): MappingSummary[] => {
  if (!data) return [] as MappingSummary[]

  const merge = [...(data?.mapping || []), ...(data?.extra || [])]

  const groupByType: Record<string, MappedTagData[]> = groupByFn<MappedTagData>(merge, x => x.type)

  const temp = groupByFn<MappedTagData>(
    Object.values(groupByType).reduce((prev, curr) => [...prev, ...curr], []),
    x =>
      JSON.stringify({
        title:
          strings.dimensions[
            (x.dimensionType || EnumDimensionType.SECTOR) as keyof typeof strings.dimensions
          ],
        type: x.type,
        dimension: x.dimension,
      }),
    x => ({
      label: x.label,
      parent: (x.parent || []).filter(p => p.dimension === x.dimension).map(x => x.label),
      type: x.type,
      isPrimary: x.isPrimary,
    })
  )

  const arr =
    data?.mapping?.length > 0
      ? [
          ...Object.keys(temp).map(key => ({
            ...JSON.parse(key),
            items: temp[key],
          })),
        ]
      : (data?.categories || []).map(c => ({
          title: '',
          items: [],
          type: c.name,
          dimension: 1,
        }))

  const fintechTypes = data.fintechType?.filter(
    ({ fctStatusId }) => fctStatusId === +EnumExpandStatusId.FOLLOWING
  )

  const tags = data?.tags || []

  return [
    ...arr,
    ...(!!fintechTypes?.length
      ? [{ title: 'FINTECH TYPE', items: fintechTypes, type: 'FINTECH TYPE' }]
      : []),
    ...(!!tags.length ? [{ title: 'TAGS', items: tags }] : []),
  ] as MappingSummary[]
}

const Company = () => {
  const [state, setState] = useState<State>({ modalVisible: null })
  const [mutationError, setError] = useState<ApolloError | { message?: string }>()
  const [addedCompanyId, setAddedCompanyId] = useState<string>('')
  const { id, source } = useParams<Params>()
  const history = useHistory()
  const isExistingCompany = useRouteMatch(Routes.COMPANY)?.isExact
  const isEditSource = useRouteMatch(Routes.COMPANY_EDIT_SOURCE)?.isExact
  const isExternalViewDetail = useRouteMatch(Routes.COMPANY_NEW)?.isExact
  const [isModalOverrideVisible, setIsModalOverrideVisible] = useState<boolean>(false)
  const [functionName, setFunctionName] = useState('')
  const [removeType, setRemoveType] = useState(0)
  const [pageCurrent, setPageCurrent] = useState<StateCurrent>()

  const {
    pages: { search, company: copy },
  } = strings

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // graphql

  const { loading: queryLoading, error: queryError, data: queryData } = useQuery(
    isExistingCompany ? getInternalCompany : getExternalCompany,
    {
      skip: isEditSource,
      variables: isExistingCompany ? { id: +id } : { input: { id: id, type: source } },
      fetchPolicy: 'network-only',
    }
  )

  const { loading: getMapLoading, error: getMapError, data: mapData } = useQuery(
    GET_COMPANY_DIMENSIONS_NO_TAGS_PARENT,
    {
      skip: !isExistingCompany || isEditSource,
      variables: { companyId: +id },
      fetchPolicy: 'network-only',
    }
  )

  const { loading: getInternalLoading, error: getInternalError, data: internalData } = useQuery(
    internalSearchQL,
    {
      skip: !isEditSource,
      variables: { internal: { query: id, type: 'ID' } },
    }
  )

  const { data: chartData, loading: getChartDataLoading } = useQuery(GET_COMPANY_NEWS_CHART, {
    skip: isEditSource,
    variables: { companyId: +id },
    fetchPolicy: 'network-only',
  })

  const mapInternalData = (data: SearchResultItem[]): SourceDetail[] => {
    const responseData = data
      //.sort((a, b) => (b.priority as number) - (a.priority as number))
      .map(item => {
        return {
          //attention (swap companyId and externalId to distinguish records having same company_id)
          company: {
            ...item.companyDetails,
            companyId:
              item.source === 'MANUAL'
                ? item.companyDetails.companyId
                : item.companyDetails.external_id,
          },
          source: { label: item.source, default: true },
        } as SourceDetail
      })
    return responseData
  }

  const dataInternal = mapInternalData(internalData?.getInternalSearchResults || [])
  const newsChartRes: CompanyNewsChartResult = chartData?.getCompanyNewsChart

  const mapResults: GetCompanyDimensions = mapData || {}
  const mappingSummary = convert2MappingSummary(
    isExistingCompany
      ? mapResults?.getCompanyDimensions
      : queryData?.getExternalCompanyById.dimensions
  )

  const [addCompany, { loading: mutationLoading }] = useMutation(createCompanyMutation)
  const [manualLoading, setManualLoading] = useState(false)
  const [resolveOverridesConflicts, setResolveOverridesConflicts] = React.useState<
    ResolveMergeOverridesConflicts
  >()
  const [dataOverride, setDataOverride] = useState<
    OverridesConflicts<OverridesConflictsValueWithUId>[]
  >([])
  const [companyData, setCompanyData] = useState<any[]>([])

  const results = queryData?.getExternalCompanyById || queryData?.getInternalCompanyById || {}

  const client = useApolloClient()
  const onBack = () => history.goBack()
  const onBackError = () => setError(undefined)

  const fallBackEditTabs: {
    [key in KeysTabs]?: KeysTabs
  } = {
    products: 'overview',
    tractions: 'overview',
  }

  const onPressEdit = (tab: KeysTabs) => {
    localstorage.set(LocalstorageFields.COMPANY_ID, id)

    history.push(
      Routes.EDIT_COMPANY_TAXONOMY.replace(':id', id).replace(
        'taxonomy',
        fallBackEditTabs[tab] || tab
      )
    )
  }
  const onPressAdd = async () => {
    if (!checkTimeETL()) return
    try {
      const result = await addCompany({
        variables: {
          input: [
            {
              externalId: id,
              source: getSource(source),
              priority: 1,
              details: JSON.stringify(results),
            } as CompanyToCreate,
          ],
        },
      })

      if (result.data.createCompany) {
        setState({ ...state, modalVisible: 'successAdd' })
        setAddedCompanyId(result.data.createCompany.companyId)
      } else {
        setError({ message: strings.error.default })
      }
    } catch (e) {
      setError(e)
    }
  }

  const getInternalCompaniesDetails = async (
    internalCompanies: CreateNewCompanyType | undefined
  ) => {
    // for only one company
    if (!internalCompanies) {
      return null
    }
    try {
      const internalResponse = await client.query({
        query: getInternalCompany,
        variables: { id: +internalCompanies.internalId, isBcgAux: true },
        fetchPolicy: 'network-only',
      })
      client.clearStore()
      return internalResponse?.data?.getInternalCompanyById
    } catch (error) {
      setError(error || { message: strings.error.default })
      return []
    }
  }

  const getExternalCompaniesDetails = async (externalCompanies: CreateNewCompanyType[]) => {
    if (!externalCompanies?.length) {
      return []
    }
    try {
      const externalResponse = await client.query({
        query: getExternalCompanies,
        variables: {
          input: externalCompanies.map(c => ({ id: c.externalId, type: c.type })),
        },
        fetchPolicy: 'network-only',
      })
      client.clearStore()
      return externalResponse?.data?.getExternalCompaniesByIds?.companies || []
    } catch (error) {
      setError(error || { message: strings.error.default })
      return []
    }
  }

  const getSourcePriority = async (): Promise<SourcePriority[]> => {
    try {
      const data = await client.query({
        query: GET_SOURCE_PRIORITY,
        fetchPolicy: 'cache-first',
      })
      return data?.data?.getSourcePriority || []
    } catch (error) {
      setError(error || { message: strings.error.default })
      return []
    }
  }

  const getPriorityForSources = (
    chosenSource: string,
    removedIds: string[],
    sourcePriority: string[]
  ) => {
    let response = {} as { [x: string]: number }
    response[chosenSource] = 1 //highest

    const listValue = cloneDeep(sourcePriority)
    const sourcesArray = dataInternal.reduce((list: string[], item: SourceDetail) => {
      return [
        ...list,
        ...(removedIds.includes(item.company.companyId)
          ? []
          : [getSource(item.company.source as string)]),
      ]
    }, [])
    //const sourcesArray = dataInternal.map(item => getSource(item.company.source as string))
    listValue.splice(
      listValue.findIndex(item => item === chosenSource),
      1
    )
    let count = 2
    listValue.forEach(item => {
      response[item] = sourcesArray.includes(item) ? count++ : 0
    })
    return response
  }

  const getAllCompaniesDetail = async (
    selectedId: string,
    type: 'changeDefault' | 'removeSource'
  ) => {
    const mappedData = dataInternal.map(item => {
      return {
        internalId: item.company.companyId,
        externalId:
          item.company.source === 'MANUAL' ? item.company.external_id : item.company.companyId,
        source: getSource(item.company.source as string),
        type: item.company.source,
      } as CreateNewCompanyType
    })

    const internalRequest = mappedData.find(item => item.source === 'bcg')
    const externalRequest = mappedData.filter(item => item.source !== 'bcg')

    const internalResponse = await getInternalCompaniesDetails(internalRequest)
    const externalResponse = await getExternalCompaniesDetails(externalRequest)
    const sourcePriorityData = await getSourcePriority()

    if ((internalResponse || externalResponse.length) && sourcePriorityData.length) {
      const totalHeaderData: any[] = internalResponse
        ? [internalResponse, ...externalResponse]
        : externalResponse
      const chosenSource = mappedData.find(item =>
        type === 'changeDefault'
          ? item.internalId?.toString() === selectedId
          : item.internalId?.toString() !== selectedId
      )?.source

      const sourcePriority = sourcePriorityData.map(({ source }) => source)

      const priorities = getPriorityForSources(
        chosenSource || '',
        type === 'removeSource' ? [selectedId] : [],
        sourcePriority
      )

      return totalHeaderData.map((item: CompanyDetails) => {
        const company = mappedData.find(
          c => c[c.source !== 'bcg' ? 'externalId' : 'internalId']?.toString() === item.id
        )
        return {
          internalId: +id,
          source: company?.source,
          // priority logic added
          priority: priorities[company?.source || ''],
          details: JSON.stringify(
            company?.source === 'bcg'
              ? ({ ...item, name: item.companyName } as CompanyDetails)
              : item
          ),
          externalId: company?.externalId,
        }
      })
    }
  }

  const getAllOverrideVisibility = async (
    input: OverrideVisibilityRequest
  ): Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]> => {
    try {
      const data = await client.query({
        query: getOverride,
        variables: {
          input,
        },
        fetchPolicy: 'network-only',
      })
      return data?.data?.getOverrideVisibility || []
    } catch (error) {
      setError(error || { message: strings.error.default })
      return []
    }
  }

  const getOverrideVisibility = async (input: OverrideVisibilityRequest) => {
    const data = await getAllOverrideVisibility(input)
    const mappedData = data.map(item => ({
      ...item,
      values: item.values.map(i => ({ ...i, uid: uuidv4() })),
    }))
    setResolveOverridesConflicts(
      mappedData.reduce((acc, curr) => {
        acc[curr.field] = curr.values[0]
        return acc
      }, {} as ResolveMergeOverridesConflicts)
    )
    return mappedData
  }

  const getCompanyChangeRequests = async (companyId: number): Promise<HasPendingCQField[]> => {
    try {
      const data = await client.query({
        query: GET_PENDING_CR_BY_ID,
        variables: {
          companyId: +companyId,
        },
        fetchPolicy: 'network-only',
      })
      return (data.data.getPendingCRByCompanyId || []).filter(CRFilterNA)
    } catch (error) {
      setError(error || { message: strings.error.default })
      return []
    }
  }

  const onClickRemoveSource = async (removeId: string, type: number) => {
    if (!checkTimeETL()) return
    if (dataInternal?.length < 2) {
      //remove a source from aggregate company has at least 2 element companies
      return
    }
    setManualLoading(true)
    if ((await getCompanyChangeRequests(+id)).length) {
      setManualLoading(false)
      setState({ ...state, modalVisible: 'errorByChangeRequest' })
      return
    }
    const companies = await getAllCompaniesDetail(removeId, 'removeSource')
    const aggregateCompanies = companies?.filter(item => item.priority > 0)

    const input: OverrideVisibilityRequest = {
      functionName: Function.REMOVE_SOURCE,
      companyIds: (aggregateCompanies || []).map(
        ({ externalId, internalId, details, priority, source }) =>
          ({
            companyId: internalId,
            externalId,
            data: details,
            priority,
            source,
          } as CompanyPriority)
      ),
    }

    setCompanyData(companies || [])
    const data = await getOverrideVisibility(input)
    setDataOverride(data)
    if (data.length) {
      setFunctionName(Function.REMOVE_SOURCE)
      setRemoveType(type)
      setIsModalOverrideVisible(true)
      setManualLoading(false)
      return
    }

    onFinish(Function.REMOVE_SOURCE, companies, type)
  }

  const onClickSave = async (defaultSource: string) => {
    if (!checkTimeETL()) return
    if (dataInternal?.length < 2) {
      //aggregate company has at least 2 element companies
      return
    }
    setManualLoading(true)
    if ((await getCompanyChangeRequests(+id)).length) {
      setManualLoading(false)
      setState({ ...state, modalVisible: 'errorByChangeRequest' })
      return
    }
    const companies = await getAllCompaniesDetail(defaultSource, 'changeDefault')
    const input: OverrideVisibilityRequest = {
      functionName: Function.CHANGE_DEFAULT,
      companyIds:
        companies?.map(
          ({ externalId, internalId, details, priority, source }) =>
            ({
              companyId: internalId,
              externalId,
              data: details,
              priority,
              source,
            } as CompanyPriority)
        ) || [],
    }

    setCompanyData(companies || [])

    const data = await getOverrideVisibility(input)
    setDataOverride(data)
    if (data.length) {
      setFunctionName(Function.CHANGE_DEFAULT)
      setIsModalOverrideVisible(true)
      setManualLoading(false)
      return
    }

    onFinish(Function.CHANGE_DEFAULT, companies)
  }

  const modalActions: Record<string, () => void> = {
    successAdd: () => {
      setState({ ...state, modalVisible: null })
      history.push(Routes.ADD_COMPANY_TAXONOMY_EXTERNAL.replace(':id', addedCompanyId))
    },
    goBackToSearch: () => {
      setState({ ...state, modalVisible: null })
      history.push(Routes.SEARCH)
    },
    viewCompanyRecord: () => {
      setState({ ...state, modalVisible: null })
      history.push(Routes.COMPANY.replace(':id', id))
    },
    back: () => {
      setState({ ...state, modalVisible: null })
    },
  }

  const getModalButtons = (): ButtonType[] | undefined => {
    if (!state.modalVisible) return undefined
    return modals[state.modalVisible].buttons.map(b => ({
      ...b,
      action: modalActions[b.action],
    })) as ButtonType[]
  }

  const onCancel = () => {
    setIsModalOverrideVisible(false)
  }

  const isSelected = (field: string, item: OverridesConflictsValueWithUId) => {
    if (!resolveOverridesConflicts) return false
    return !!(
      resolveOverridesConflicts[field]?.uid && resolveOverridesConflicts[field]?.uid === item.uid
    )
  }

  const onFinish = async (f = functionName, data = companyData, type = removeType) => {
    if (!checkTimeETL()) return
    setManualLoading(true)
    setIsModalOverrideVisible(false)

    try {
      if (f === Function.CHANGE_DEFAULT) {
        await client.mutate({
          mutation: setDefaultCompanyMutation,
          variables: {
            input: {
              companies: data,
              overrides: getMergeOverridesInput(resolveOverridesConflicts),
            },
          },
        })
        history.push(Routes.COMPANY.replace(':id', id))
      } else {
        const removeCompany = data?.find(item => !item.priority)
        const aggregateCompanies = data?.filter(item => item.priority > 0)

        if (removeCompany && aggregateCompanies?.length) {
          const response = await client.mutate({
            mutation: removeSourceMutation,
            variables: {
              input: {
                removeCompany,
                aggregateCompanies,
                type,
                overrides: getMergeOverridesInput(resolveOverridesConflicts),
              },
            },
          })
          const id = response.data.removeSource.companyId
          if (type === EnumRemoveSourceType.CREATE_NEW_MAPPING) {
            history.push(Routes.ADD_COMPANY_TAXONOMY_EXTERNAL.replace(':id', id))
          } else {
            setState({ ...state, modalVisible: 'successRemoveSource' })
          }
        }
      }
      setManualLoading(false)
    } catch (error) {
      setError(error || { message: strings.error.default })
      setManualLoading(false)
    }
  }

  const error = queryError || getMapError || getInternalError
  const loading =
    mutationLoading ||
    queryLoading ||
    getMapLoading ||
    getInternalLoading ||
    getChartDataLoading ||
    manualLoading

  const sources = companyData
    ?.filter(({ priority }) => !!priority)
    ?.sort((a, b) => a.priority - b.priority)
    ?.map(({ source }) => ReverseSource[source as keyof typeof ReverseSource])
    .join(' | ')

  const companyName = dataInternal.length && dataInternal[0].company.companyName + ' '

  return (
    <>
      <FormSearch
        inputId="Company-search-companies"
        baseUrl={Routes.SEARCH_QUERY}
        placeholder={search.placeholder}
        size="small"
        pageCurrent={pageCurrent}
      />
      {error ? (
        <>
          <Message variant="alert" body={error.message || strings.error.default} />
          <ButtonText sx={{ mt: 4 }} onPress={onBack} />
        </>
      ) : mutationError ? (
        <>
          <Modal
            buttons={[
              {
                label: 'Close',
                type: 'outline',
                action: onBackError,
              },
            ]}
          >
            <Heading center as="h4">
              {'Company Error'}
            </Heading>
            <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
              {mutationError.message || strings.error.default}
            </Paragraph>
          </Modal>
        </>
      ) : (
        <>
          {loading ? (
            <Updating loading />
          ) : (
            <>
              {!isEditSource && (
                <CompanyDetail
                  isExternalViewDetail={isExternalViewDetail}
                  technology={
                    isExternalViewDetail
                      ? undefined
                      : {
                          technology: results.technology || [],
                          technologyCertification: results.technologyCertification || [],
                          technologyProvider: results.technologyProvider || [],
                        }
                  }
                  actionButton={[
                    {
                      label: isExistingCompany ? copy.actionButtonEdit : copy.actionButtonAdd,
                      onPress: isExistingCompany ? onPressEdit : onPressAdd,
                    },
                  ]}
                  key={id}
                  onBack={onBack}
                  business={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  people={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  acquirees={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  financials={{ ...results.financials, isExternalViewDetail }}
                  investments={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  fundraising={
                    isExternalViewDetail
                      ? undefined
                      : {
                          companyId: Number(id),
                        }
                  }
                  overview={{
                    ...results.overview,
                    companyName: results.companyName,
                    id: results.id,
                    source: source || results.overview.source || '',
                    isExternalViewDetail,
                  }}
                  ipos={{
                    ipoRounds: results.ipos,
                    isExternalViewDetail: isExternalViewDetail || false,
                  }}
                  acquisitions={{
                    acquisitionRounds: results.acquisitions,
                    isExternalViewDetail: isExternalViewDetail || false,
                  }}
                  mapping={mappingSummary}
                  news={
                    !isExistingCompany
                      ? undefined
                      : ({
                          companyId: id,
                          isInternalCompany: isExistingCompany,
                          source,
                        } as TagNewsData)
                  }
                  use-case={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  partnerships={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  products={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  tractions={isExternalViewDetail ? undefined : { companyId: Number(id) }}
                  setPageCurrent={setPageCurrent}
                  companyNewsChartRes={newsChartRes}
                />
              )}
              {isEditSource && dataInternal.length > 0 && (
                <CompanyEditSources
                  data={{ ...(dataInternal[0].company || {}) }}
                  sources={dataInternal}
                  onClickBack={onBack}
                  onClickSave={onClickSave}
                  onRemoveSource={onClickRemoveSource}
                />
              )}
              {isModalOverrideVisible && (
                <Modal
                  sx={{
                    height: 700,
                    width: 1024,
                    maxWidth: '100%',
                    px: 0,
                    py: 4,
                    position: 'relative',
                  }}
                >
                  <Heading sx={{ mb: 4 }} center as="h4">
                    {'Override Visibility'}
                  </Heading>
                  {functionName === Function.REMOVE_SOURCE && (
                    <div style={{ marginBottom: '40px', fontSize: '18px', textAlign: 'center' }}>
                      {`Please review the overrides you wish to keep for the primary company `}
                      <span style={{ fontWeight: 'bold' }}>{companyName || ''}</span>
                      <span>{`(${sources})`}</span>
                    </div>
                  )}
                  <Box sx={{ height: '75%', overflowY: 'auto', width: '100%', px: 6 }}>
                    <MergeOverrides
                      sx={{ width: '100%', '& > p': { textAlign: 'center' } }}
                      label={''}
                      data={dataOverride}
                      isSelected={isSelected}
                      onSelect={(field: string, item: OverridesConflictsValueWithUId) => {
                        setResolveOverridesConflicts({
                          ...resolveOverridesConflicts,
                          [field]: item,
                        })
                      }}
                    ></MergeOverrides>
                  </Box>
                  <Flex
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      p: '40px 60px',
                    }}
                  >
                    <Button
                      disabled={manualLoading}
                      onPress={() => onCancel()}
                      sx={{
                        ml: '10px',
                        height: '40px',
                        width: '85px',
                        backgroundColor: 'transparent',
                        color: 'darkGray',
                      }}
                      label="Cancel"
                    ></Button>
                    <Button
                      disabled={manualLoading}
                      onPress={() => {
                        onFinish()
                      }}
                      sx={{ ml: '10px', height: '40px', width: '85px' }}
                      label={'Finish'}
                    ></Button>
                  </Flex>
                </Modal>
              )}
            </>
          )}
        </>
      )}

      {state.modalVisible && (
        <Modal buttons={getModalButtons()}>
          <Heading sx={{ mb: 3 }} as="h4">
            {modals[state.modalVisible].heading}
          </Heading>
          <Paragraph center>{modals[state.modalVisible].body}</Paragraph>
        </Modal>
      )}
    </>
  )
}

export default Company
