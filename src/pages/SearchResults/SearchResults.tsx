import React, { useState } from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { Heading } from 'theme-ui'
import { ApolloError, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { SearchInternal, SearchExternal } from './graphql'
import { ButtonText, FormSearch, Message, Modal, SearchResults, Updating } from '../../components'
import { ButtonType } from '../../components/Modal/Modal'
import { Paragraph, Heading as ModalHeading } from '../../components/primitives'
import strings from '../../strings'
import { isCompanyId, isURL, localstorage, LocalstorageFields } from '../../utils'
import { getPage, modals } from './helpers'
import {
  createCompanyMutation,
  getExternalCompanies,
  getInternalCompany,
  getOverrideVisibility,
  GET_SOURCE_PRIORITY,
} from '../Company/graphql'
import { EPageKey, Routes } from '../../types/enums'
import { CompanyToCreate, CreateNewCompanyType } from '../../components/SearchResults/SearchResults'
import { OverrideVisibilityRequest, SearchResultItem } from '../../types'
import aggregateCompanies from '../Company/graphql/aggregateCompanies'
import {
  MergeCompanyOverridesInput,
  OverridesConflicts,
  OverridesConflictsValueWithUId,
} from '../../components/MergeData/MergeData'
import { HasPendingCQField } from '../CompanyForm/CompanyForm'
import { GET_PENDING_CR_BY_ID } from '../CompanyForm/graphql/pendingChangeRequests'
import { ETLRunTimeContext } from '../../context'
import { CRFilterNA } from '../../utils/helper'

type Params = {
  query: string
}

type State = {
  modalVisible: keyof typeof modals | null
}

const PageSearchResults = () => {
  const [state, setState] = useState<State>({ modalVisible: null })
  const [mutationError, setError] = useState<ApolloError | { message?: string }>()
  const { query: encodedQuery } = useParams<Params>()
  const query = decodeURIComponent(encodedQuery)
  const history = useHistory()
  const [chosenRecord, setChosenRecord] = useState({
    internal: {} as { [x: string]: boolean },
    external: {} as { [x: string]: boolean },
  })
  const [addedCompanyId, setAddedCompanyId] = useState<string>('')
  const client = useApolloClient()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const {
    pages: { search: copy },
  } = strings

  const isSearchURL = isURL(query)
  const isId = isCompanyId(query)
  const search = useLocation().search
  const page = React.useMemo(() => new URLSearchParams(search).get('page') || '', [search])
  const goBack = React.useMemo(() => getPage(search), [search])

  const { loading: queryInternalLoading, error: queryInternalError, data: internalData } = useQuery(
    SearchInternal,
    {
      variables: {
        internal: { query: query, limit: 101, type: isSearchURL ? 'URL' : isId ? 'ID' : 'NAME' },
      },
      fetchPolicy: 'network-only',
    }
  )

  const { loading: queryExternalLoading, error: queryExternalError, data: externalData } = useQuery(
    SearchExternal,
    {
      variables: {
        external: { query: query, limit: 101, type: isSearchURL ? 'URL' : 'NAME' },
      },
    }
  )

  const {
    data: sourcePriorityRaw,
    loading: querySourcePriorityLoading,
  } = useQuery(GET_SOURCE_PRIORITY, { fetchPolicy: 'cache-first' })

  const queryLoading = queryInternalLoading || queryExternalLoading
  const queryError = queryInternalError || queryExternalError

  const [addCompany, { loading: mutationLoading }] = useMutation(createCompanyMutation)

  const formatInternalSearchResult = (mappedData: SearchResultItem[]): SearchResultItem[] => {
    const responseData = Array.from(new Set(mappedData.map(item => item.company_id))).map(id => {
      const dataOfThisId = mappedData
        .filter(item => item.company_id === id)
        .sort((a, b) => {
          return (a.priority as number) - (b.priority as number)
        })
      if (dataOfThisId?.length === 1) {
        return dataOfThisId[0]
      }
      return {
        ...dataOfThisId[0],
        source: dataOfThisId.map(item => {
          return {
            company: { ...item.companyDetails },
            source:
              item.priority === dataOfThisId[0].priority
                ? { label: item.source, default: true }
                : item.source,
          }
        }),
      }
    })
    return responseData as SearchResultItem[]
  }

  const results = {
    external: externalData?.getExternalSearchResults || [],
    internal: formatInternalSearchResult(internalData?.getInternalSearchResults || []),
  }

  const sourcePriority = sourcePriorityRaw?.getSourcePriority || []

  const modalActions: Record<string, () => void> = {
    successAdd: () => {
      setState({ ...state, modalVisible: null })
      history.push(
        Routes.ADD_COMPANY_TAXONOMY_EXTERNAL.replace(':id', addedCompanyId).concat(
          page ? `?page=${page}` : ''
        )
      )
    },
    viewCompanyRecord: () => {
      setState({ ...state, modalVisible: null })
      history.push(Routes.COMPANY.replace(':id', addedCompanyId))
    },
    goBackToSearch: () => {
      setState({ ...state, modalVisible: null })
      history.push(goBack.link)
    },
  }

  const getModalButtons = (): ButtonType[] | undefined => {
    if (!state.modalVisible) return undefined
    return modals[state.modalVisible].buttons.map(b => ({
      ...b,
      label: b.action === 'goBackToSearch' ? `Go back to ${goBack.title}` : b.label,
      action: modalActions[b.action],
    })) as ButtonType[]
  }

  const onCreateNewCompany = async (companiesToCreate: CompanyToCreate[]) => {
    if (!checkTimeETL()) return
    try {
      const result = await addCompany({
        variables: { input: companiesToCreate },
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

  const getInternalCompaniesDetails = async (internalCompanies: CreateNewCompanyType[]) => {
    // for only one company
    if (!internalCompanies?.length) {
      return null
    }
    try {
      const internalResponse = await client.query({
        query: getInternalCompany,
        variables: { id: internalCompanies[0].internalId, isBcgAux: true },
        fetchPolicy: 'network-only',
      })
      client.clearStore()
      return internalResponse?.data?.getInternalCompanyById
    } catch (error) {
      setError({ message: strings.error.default })
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
      setError({ message: strings.error.default })
      return []
    }
  }

  const onAddSourceToExistingCompanyClick = async (
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[],
    overrides: MergeCompanyOverridesInput[]
  ) => {
    if (!externalCompanies.length || !internalCompanies.length) {
      return
    }
    try {
      const isMapping = !!localstorage.get(LocalstorageFields.IS_MAPPING_ZONE)
      const res = await client.mutate({
        mutation: aggregateCompanies,
        variables: {
          input: {
            externalCompanies: externalCompanies,
            internalCompanies: internalCompanies,
            overrides,
          },
          isMapping,
        },
      })

      if (isMapping) {
        const mergeCompany = localstorage.get(LocalstorageFields.COMPANY_MERGE)
        localstorage.remove(LocalstorageFields.COMPANY_AGGREGATE)
        if (mergeCompany) {
          localstorage.set(
            LocalstorageFields.COMPANY_MERGE,
            JSON.stringify([...JSON.parse(mergeCompany), ...res.data.aggregateCompanies.companies])
          )
          history.push(
            Routes.MERGE_COMPANY.replace(':query', query).concat(`?page=${EPageKey.MAPPING_ZONE}`)
          )
        } else {
          localstorage.remove(LocalstorageFields.IS_MAPPING_ZONE)
          history.push(
            Routes.EDIT_COMPANY_TAXONOMY.replace(
              ':id',
              res.data.aggregateCompanies.companies[0].company_id
            ).concat(`?page=${EPageKey.MAPPING_ZONE}`)
          )
        }
        return
      }
      setState({ ...state, modalVisible: 'successAggregateSource' })
      setAddedCompanyId(internalCompanies[0].internalId || '')
    } catch (error) {
      setError(error || { message: strings.error.default })
    }
  }

  const onPressForm = () => {
    history.push(Routes.ADD_COMPANY_OVERVIEW)
  }

  const onClickBackError = () => {
    setError(undefined)
  }

  const onAggregate = (searchState: any) => {
    setChosenRecord(searchState)
  }

  const getAllOverrideVisibility = async (
    input: OverrideVisibilityRequest
  ): Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]> => {
    try {
      const data = await client.query({
        query: getOverrideVisibility,
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

  const loading = mutationLoading || queryLoading || querySourcePriorityLoading

  return (
    <>
      <FormSearch inputId="PageSearchResults-search-companies" baseUrl={Routes.SEARCH_QUERY} defaultValue={query} placeholder={copy.placeholder} size="small" />
      {mutationError ? (
        <>
          <Modal
            buttons={[
              {
                label: 'Close',
                type: 'outline',
                action: onClickBackError,
              },
            ]}
          >
            <ModalHeading center as="h4">
              {'Company Error'}
            </ModalHeading>
            <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
              {mutationError.message || strings.error.default}
            </Paragraph>
          </Modal>
        </>
      ) : queryError ? (
        <>
          <Message variant="alert" body={queryError.message || strings.error.default} />
          <ButtonText
            sx={{ mt: 4 }}
            onPress={() => {
              history.goBack()
            }}
          />
        </>
      ) : (
        <>
          {loading ? (
            <Updating loading />
          ) : (
            <>
              <SearchResults
                onPressForm={onPressForm}
                onAggregate={onAggregate}
                onMergeCompany={() => {
                  if (!checkTimeETL()) return
                  localstorage.remove(LocalstorageFields.IS_MAPPING_ZONE)
                  localstorage.remove(LocalstorageFields.COMPANY_MERGE)
                  history.push(Routes.MERGE_COMPANY.replace(':query', encodeURIComponent(query)))
                }}
                onCreateNewCompany={onCreateNewCompany}
                getInternalCompaniesDetails={getInternalCompaniesDetails}
                getExternalCompaniesDetails={getExternalCompaniesDetails}
                onAddSourceToExistingCompanyClick={onAddSourceToExistingCompanyClick}
                internal={results.internal.filter((item: SearchResultItem) =>
                  Object.keys(chosenRecord['internal']).length
                    ? chosenRecord['internal'][item.companyDetails.companyId]
                    : true
                )}
                external={results.external.filter((item: SearchResultItem) =>
                  Object.keys(chosenRecord['external']).length
                    ? chosenRecord['external'][item.companyDetails.companyId]
                    : true
                )}
                getAllOverrideVisibility={getAllOverrideVisibility}
                sourcePriority={sourcePriority}
                getCompanyChangeRequests={getCompanyChangeRequests}
              />
              {state.modalVisible && (
                <Modal maxWidth={600} buttons={getModalButtons()}>
                  <Heading sx={{ mb: 3 }} as="h4">
                    {modals[state.modalVisible].heading}
                  </Heading>
                  <Paragraph sx={{ fontSize: 16 }} center>
                    {modals[state.modalVisible].body}
                  </Paragraph>
                </Modal>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

export default PageSearchResults
