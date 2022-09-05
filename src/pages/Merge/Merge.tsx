import { ApolloError, useApolloClient, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Box, Divider, Flex, Grid } from 'theme-ui'
import {
  AggregatedSource,
  Button,
  ButtonText,
  CompanyItem,
  FormSearch,
  Icon,
  MergeData,
  Modal,
  Updating,
} from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { MappedTagData, SearchResultItem } from '../../types'
import { isCompanyId, isURL, localstorage, LocalstorageFields, uniq } from '../../utils'
import { SearchInternal } from '../SearchResults/graphql'
import strings from '../../strings'
import { Params } from 'next/dist/next-server/server/router'
import {
  Routes,
  EnumApiSource,
  EnumReverseApiSource,
  EnumCompanyTypeSector,
  EnumExpandStatusId,
  EnumExpandStatus,
  EPageKey,
  EnumDimensionValue,
} from '../../types/enums'
import { DataMerge } from '../../components/MergeData'
import { getDataMergeCompany, GetDataMergeCompanyResult, mergeCompaniesResult } from './graphql'
import { formatInternalSearchResult } from './helpers'
import getSource, { ReverseSource } from '../../utils/getSource'
import { cloneDeep } from '@apollo/client/utilities'
import { COMPANY_GRID } from '../../components/CompanyItem/helpers'
import { onError } from '../../sentry'
import { ResolveMergeOverridesConflicts } from '../../components/MergeData/MergeData'
import { v4 as uuidv4 } from 'uuid'
import { getLocationValue, getMergeOverridesInput } from '../../utils/helper'
import { SharedCompanyLocation } from '../CompanyForm/helpers'
import {
  CompanyDetails,
  CreateNewCompanyType,
  SourcePriority,
} from '../../components/SearchResults/SearchResults'
import { getExternalCompanies, getInternalCompany, GET_SOURCE_PRIORITY } from '../Company/graphql'
import { ETLRunTimeContext } from '../../context'
import { Heading as ModalHeading } from '../../components/primitives'

const getSourcePriority = (defaultSource: EnumApiSource, listKeysSources: string[]) => {
  const result: any = {}
  let i = 1
  result[defaultSource] = i

  listKeysSources.forEach(source => {
    if (source !== defaultSource) {
      result[source] = ++i
    }
  })

  return result
}

const Merge = () => {
  const {
    common,
    searchResults: copy,
    pages: {
      addCompanyForm: { buttons },
    },
  } = strings

  const {
    searchResults: { modal: modalText },
  } = strings

  const history = useHistory()
  const client = useApolloClient()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const { query: encodedQuery } = useParams<Params>()
  const query = decodeURIComponent(encodedQuery)
  const isSearchURL = isURL(query)
  const isId = isCompanyId(query)
  const localData = localstorage.get(LocalstorageFields.COMPANY_MERGE)
  const isMapping = !!localstorage.get(LocalstorageFields.IS_MAPPING_ZONE)

  const [dataMerge, setDataMerge] = useState<DataMerge>({} as DataMerge)
  const [mergeCompany, setMergeCompany] = useState<SearchResultItem[]>(
    localData ? JSON.parse(localData) : []
  )
  const [queryData, setQueryData] = useState<SearchResultItem[]>()
  const [companyDefault, setCompanyDefault] = useState<SearchResultItem>()
  const [selectDefault, setSelectDefault] = useState<boolean>(false)
  const [modalMergeVisible, setModalMergeVisible] = useState<boolean>(false)
  const [modalWarningSourceVisible, setModalWarningSourceVisible] = useState<boolean>(false)
  const [modalWarningMergeVisible, setModalWarningMergeVisible] = useState<boolean>(false)
  const [modalSuccess, setModalSuccess] = useState<boolean>(false)
  const [errorText, setErrorText] = useState<string>('')
  const [isOutType, setIsOutType] = useState<boolean>(false)

  const [extraData, setExtraData] = useState<MappedTagData[]>([] as MappedTagData[])
  const [companiesData, setCompaniesData] = useState<any>()
  const [dataLoading, setDataLoading] = useState<boolean>(false)
  const [mutationError, setError] = useState<ApolloError | { message?: string }>()

  const [resolveOverridesConflicts, setResolveOverridesConflicts] = React.useState<
    ResolveMergeOverridesConflicts
  >()

  const [dataFromAPI, setDataFromAPI] = useState<CompanyDetails[]>([])
  const [modalError, setModalError] = useState<
    'errorMultipleFeedly' | 'errorByChangeRequest' | undefined
  >(undefined)

  // GRAPHQL
  const { data, loading, refetch } = useQuery(SearchInternal, {
    variables: {
      internal: { query: query, type: isSearchURL ? 'URL' : isId ? 'ID' : 'NAME' },
      isMerge: true,
    },
    onCompleted() {
      setQueryData(data.getInternalSearchResults)
    },
  })

  const { data: sourcePriorityRaw, loading: querySourcePriorityLoading } = useQuery(
    GET_SOURCE_PRIORITY,
    {
      fetchPolicy: 'cache-first',
      onCompleted() {
        if (isMapping) {
          onMerge()
        }
      },
    }
  )

  const listValuesSources: string[] = sourcePriorityRaw?.getSourcePriority?.map(
    (item: SourcePriority) => item.source
  )

  const listKeysSources: string[] = sourcePriorityRaw?.getSourcePriority?.map(
    ({ source }: SourcePriority) => ReverseSource[source as keyof typeof ReverseSource]
  )

  const [mergeCompanies, { loading: mergeLoading }] = useMutation(mergeCompaniesResult)

  useEffect(() => {
    localstorage.set(LocalstorageFields.COMPANY_MERGE, JSON.stringify(mergeCompany))
  }, [mergeCompany])

  const onBack = () => history.goBack()

  const showStatus = (id?: string) => {
    if (id === EnumExpandStatusId.FOLLOWING) return EnumExpandStatus.FOLLOWING
    if (id === EnumExpandStatusId.UNFOLLOWED) return EnumExpandStatus.UNFOLLOWED
    if (id === EnumExpandStatusId.DUPLICATED) return EnumExpandStatus.DUPLICATED
    if (id === EnumExpandStatusId.TO_BE_EVALUATED) return EnumExpandStatus.TO_BE_EVALUATED
    return ''
  }

  const checkDuplicateSource = (companies?: SearchResultItem[]) => {
    const checkDuplicate = companies?.filter(({ source }) =>
      mergeCompany.find(c => c.source === source)
    )
    return checkDuplicate?.map(({ source }) => source)
  }

  const addCompany = (company: SearchResultItem) => {
    const companies = queryData?.filter(
      ({ company_id }: SearchResultItem) => company_id === company.company_id
    )
    const duplicateSource = checkDuplicateSource(companies)
    if (!!duplicateSource?.length) {
      setErrorText(
        `Warning: An aggregated company can only have one source per data provider - please keep only one ${duplicateSource.join(
          ', '
        )} company and set the fct status for the other as source-duplicate`
      )
      setModalWarningSourceVisible(true)
      return
    }
    const cloneState = [...mergeCompany, ...(companies || [])]
    setMergeCompany(cloneState)
  }

  const removeCompany = (id: string) => {
    const cloneState = [...mergeCompany].filter(c => c.company_id !== id)
    setMergeCompany(cloneState)
  }

  const onMerge = () => {
    if (!checkTimeETL()) return
    if (
      formatInternalSearchResult(mergeCompany).find(
        ({ companyDetails }) => companyDetails.expandStatusId !== EnumExpandStatusId.FOLLOWING
      )
    ) {
      setModalWarningMergeVisible(true)
      return
    }

    const initialDefaultId = () => {
      mergeCompany.sort((a, b) => {
        return (
          listKeysSources.findIndex(item => item === (a.source as string)) -
          listKeysSources.findIndex(item => item === (b.source as string))
        )
      })
      return mergeCompany[0]
    }
    setCompanyDefault(initialDefaultId())

    setSelectDefault(true)
  }

  const getDataFromAPI = (apiData: CompanyDetails[], searchItem: SearchResultItem) => {
    const requestId =
      searchItem.source !== EnumApiSource.MANUAL ? searchItem.id : searchItem.company_id
    let data = apiData.find(({ id }) => id === requestId)
    if (searchItem.source !== EnumApiSource.MANUAL && data) {
      data = { ...data, name: data.companyName as string }
    }
    return data && JSON.stringify(data)
  }

  const getData = async () => {
    setDataLoading(true)

    const externalInput: CreateNewCompanyType[] = mergeCompany
      .filter(({ source }) => source !== EnumApiSource.MANUAL)
      .map(({ id, source }) => ({ externalId: id, type: source } as CreateNewCompanyType))

    const internalInput = mergeCompany
      .filter(({ source }) => source === EnumApiSource.MANUAL)
      .map(({ company_id }) => ({ internalId: +(company_id || 0) } as CreateNewCompanyType))[0]

    const externalResponse: CompanyDetails[] = await getExternalCompaniesDetails(externalInput)
    const internalResponse: CompanyDetails = await getInternalCompaniesDetails(internalInput)
    const apiData = [internalResponse, ...externalResponse].filter(item => !!item)
    setDataFromAPI(apiData)

    const sourcePriority = getSourcePriority(
      (companyDefault?.source || '') as EnumApiSource,
      listKeysSources
    )

    const { data } = await client.query<{ getDataMergeCompany: GetDataMergeCompanyResult }>({
      query: getDataMergeCompany,
      variables: {
        companies: mergeCompany
          .sort(function (a, b) {
            return (
              sourcePriority[a.source as EnumApiSource] - sourcePriority[b.source as EnumApiSource]
            )
          })
          .map(({ company_id, source, id }) => ({
            companyId: company_id ? +company_id : 0,
            sources: ['bcg'],
            priority: sourcePriority[source as EnumApiSource],
            source: EnumReverseApiSource[source as keyof typeof EnumApiSource],
            data: getDataFromAPI(apiData, { id, company_id, source } as SearchResultItem),
          })),
      },
    })

    const { headquarterLocations, overrides, canBeMerged, isMultipleFeedly } =
      data?.getDataMergeCompany || {}
    if (!canBeMerged) {
      setModalError('errorByChangeRequest')
      setDataLoading(false)
      return
    }

    if (isMultipleFeedly) {
      setModalError('errorMultipleFeedly')
      setDataLoading(false)
      return
    }

    // The order is important, we only keep the highest priority location if these locations are duplicated
    const orderedHQLocations = [...headquarterLocations]
    orderedHQLocations.sort((a, b) => {
      const getLocationPriority = (l: SharedCompanyLocation): number => {
        const company = mergeCompany.find(c => c.company_id === `${l.companyId}`)
        const n = sourcePriority[(company?.source || '') as EnumApiSource]
        return n
      }

      return getLocationPriority(a) - getLocationPriority(b)
    })

    const uniqOrderedHQLocations = uniq(orderedHQLocations, getLocationValue)

    setDataLoading(false)

    // Check to auto merge company if only one company has data: categories, profiles, financialLicenses, use case, fundraising, technology
    let categories = data?.getDataMergeCompany.dimensions.categories.filter((c: any) => c.isPrimary)
    categories =
      categories.filter((c: any) => c.name === EnumCompanyTypeSector.OUT).length ===
      categories.length
        ? []
        : categories.map((c: any) => c.companyId)
    const profiles = data?.getDataMergeCompany.profiles.reduce(
      (acc: number[], cur: any) =>
        !acc.includes(+cur.company_id) ? [...acc, +cur.company_id] : acc,
      [] as number[]
    )
    const financialLicenses = data?.getDataMergeCompany.financialLicenses.reduce(
      (acc: number[], cur: any) =>
        !acc.includes(+cur.company_id) ? [...acc, +cur.company_id] : acc,
      [] as number[]
    )
    const useCases = [
      ...data?.getDataMergeCompany.useCases,
      ...data?.getDataMergeCompany.currentClients,
    ].reduce(
      (acc: number[], cur: any) =>
        !acc.includes(+cur.company_id) ? [...acc, +cur.company_id] : acc,
      [] as number[]
    )
    const fundraisings = data?.getDataMergeCompany.fundraisings.reduce(
      (acc: number[], cur: any) =>
        !acc.includes(+cur.fundraising_id) ? [...acc, +cur.fundraising_id] : acc,
      [] as number[]
    )

    const technology = [
      ...data?.getDataMergeCompany.technology,
      ...data?.getDataMergeCompany.technologyProvider,
      ...data?.getDataMergeCompany.technologyCertification,
    ].reduce(
      (acc: number[], cur: any) =>
        !acc.includes(+cur.company_id) ? [...acc, +cur.company_id] : acc,
      [] as number[]
    )

    const count = Array.from(
      new Set([
        ...categories,
        ...profiles,
        ...financialLicenses,
        ...useCases,
        ...fundraisings,
        ...technology,
      ])
    )
    const isAutoMerge = count.length <= 1 && !overrides.length && uniqOrderedHQLocations.length <= 1

    if (isAutoMerge) {
      const input = {
        ...dataMerge,
        primary: data?.getDataMergeCompany.dimensions.mapping.filter(
          ({ isPrimary }: any) => isPrimary
        ),
        auxiliary: data?.getDataMergeCompany.dimensions.mapping.filter(
          ({ isPrimary }: any) => !isPrimary
        ),
        tags: data?.getDataMergeCompany.dimensions.tags,
        profiles: data?.getDataMergeCompany.profiles,
        licenses: data?.getDataMergeCompany.financialLicenses,
        useCases: data?.getDataMergeCompany.useCases,
        currentClients: data?.getDataMergeCompany.currentClients,
        fundraisings: data?.getDataMergeCompany.fundraisings,
        technology: data?.getDataMergeCompany.technology,
        technologyProvider: data?.getDataMergeCompany.technologyProvider,
        technologyCertification: data?.getDataMergeCompany.technologyCertification,
        fintechType: data?.getDataMergeCompany.dimensions?.fintechType?.reduce(
          (acc: string[], { label }: { label: string }) => {
            if (!acc.includes(label)) {
              acc.push(label)
            }
            return acc
          },
          []
        ),
        // if all hq locations are the same so auto keep the one that has highest priority and delete all others
        locations: headquarterLocations?.map(location => ({
          ...location,
          isRemove: !uniqOrderedHQLocations.some(l => l.id === location.id),
        })),
      }
      setDataMerge(input)

      if (
        !categories.length &&
        !!data?.getDataMergeCompany.dimensions.categories.filter(
          (c: any) => c.name === EnumCompanyTypeSector.OUT
        ).length
      ) {
        onSubmitMerge(input, apiData, true)
      } else {
        onSubmitMerge(input, apiData)
      }
      return
    }
    const overridesWithUid = overrides.map(item => ({
      ...item,
      values: item.values.map(i => ({ ...i, uid: uuidv4() })),
    }))

    setExtraData([...(data?.getDataMergeCompany.dimensions?.extra || [])])
    setDataMerge({
      ...dataMerge,
      overrides: overridesWithUid,
      fintechType: data?.getDataMergeCompany.dimensions?.fintechType?.reduce(
        (acc: string[], { label }: { label: string }) => {
          if (!acc.includes(label)) {
            acc.push(label)
          }
          return acc
        },
        []
      ),
      locations: headquarterLocations?.map(location => ({
        ...location,
        isRemove: true,
        hidden: !uniqOrderedHQLocations.some(l => l.id === location.id),
      })),
    })

    setResolveOverridesConflicts(
      overridesWithUid.reduce((acc, curr) => {
        acc[curr.field] = curr.values[0]
        return acc
      }, {} as ResolveMergeOverridesConflicts)
    )
    setCompaniesData(data)
    setModalMergeVisible(true)
  }

  const onSubmitMerge = async (
    dbToMerge = dataMerge,
    apiData = dataFromAPI,
    outType = isOutType
  ) => {
    if (!checkTimeETL()) return
    const getPriorityForSources = (chosenSource: string) => {
      const response = {} as { [x: string]: number }
      response[getSource(chosenSource)] = 1 //highest
      const listValue = cloneDeep(listValuesSources)
      let listSourcesOfCompanies: SearchResultItem[]
      listSourcesOfCompanies = [...mergeCompany]
      const sourcesArray = listSourcesOfCompanies.map(item => getSource(item?.source as string))

      listValue.splice(
        listValue.findIndex(item => item === getSource(chosenSource)),
        1
      )
      let count = 2
      listValue.forEach((item, index) => {
        response[item] = sourcesArray.includes(item) ? count++ : 0
      })
      return response
    }
    const priorities = getPriorityForSources(`${companyDefault?.source}` || '')

    const getDimensions = () => {
      const sectors = [] as MappedTagData[]
      dbToMerge.primary?.forEach(p => {
        const sector = p.parent?.find(
          parent =>
            parent.dimension === EnumDimensionValue.SECONDARY &&
            parent.type === EnumCompanyTypeSector.FIN
        )
        if (sector && !sectors.find(s => s.id === sector.id)) {
          sectors.push({ ...sector, isPrimary: true })
        }
      })

      let primary = dbToMerge.primary?.find(
        ({ type }) =>
          type === EnumCompanyTypeSector.FIN ||
          type === EnumCompanyTypeSector.INS ||
          type === EnumCompanyTypeSector.REG
      )
        ? dbToMerge.primary
        : []
      let auxiliary = dbToMerge.auxiliary
        ? dbToMerge.auxiliary.reduce((acc, cur) => {
            const sector = cur.parent?.find(
              parent =>
                parent.dimension === EnumDimensionValue.SECONDARY &&
                parent.type === EnumCompanyTypeSector.FIN
            )
            if (sector) {
              sectors.push({ ...sector, isPrimary: false })
            }
            acc.push({ ...cur, isPrimary: false })
            return acc
          }, [] as MappedTagData[])
        : []
      return [...primary, ...auxiliary, ...sectors]
    }
    const dimensions = getDimensions()

    const input = {
      companies: mergeCompany.map((c, index) => ({
        company_id: c.company_id,
        priority: priorities[getSource(`${c.source}`) || ''],
        externalId: c.companyDetails.external_id,
        source: c.source === EnumApiSource.MANUAL ? EnumReverseApiSource.MANUAL : c.source,
        data: getDataFromAPI(apiData, c),
      })),
      categories: outType
        ? [
            {
              name: EnumCompanyTypeSector.OUT,
              isPrimary: true,
            },
          ]
        : dimensions.reduce(
            (acc, cur) => {
              if (
                !acc.find(({ isPrimary, name }) => cur.isPrimary === isPrimary && cur.type === name)
              ) {
                acc.push({ name: cur.type, isPrimary: cur.isPrimary })
              }
              return acc
            },
            [] as {
              name: string
              isPrimary: boolean
            }[]
          ),
      dimensions: outType
        ? []
        : dimensions.map(dimension => ({
            dimension_id: dimension.companyDimensionId,
            isPrimary: dimension.isPrimary,
          })),
      fintechType: dbToMerge.fintechType,
      tags: dbToMerge.tags?.map(({ id }) => id) || [],
      profiles: dbToMerge.profiles?.map(({ profile_id }) => profile_id) || [],
      financialLicenses: dbToMerge.licenses?.map(({ id }) => id) || [],
      useCases: dbToMerge.useCases?.map(({ use_case_id }) => use_case_id) || [],
      currentClients:
        dbToMerge.currentClients?.map(({ company_client_id }) => company_client_id) || [],
      fundraisings: dbToMerge.fundraisings?.map(({ fundraising_id }) => fundraising_id) || [],
      overrides: getMergeOverridesInput(resolveOverridesConflicts),
      technology: dbToMerge.technology?.map(({ technology_id }) => technology_id) || [],
      technologyProvider:
        dbToMerge.technologyProvider?.map(
          ({ company_technology_provider_id }) => company_technology_provider_id
        ) || [],
      technologyCertification:
        dbToMerge.technologyCertification?.map(({ certification_id }) => certification_id) || [],
      removeLocationIds: dbToMerge.locations.filter(l => l.isRemove).map(l => l.id),
    }

    try {
      await mergeCompanies({ variables: { input: input } })
      localstorage.remove(LocalstorageFields.COMPANY_MERGE)
      if (isMapping && companyDefault?.company_id) {
        localstorage.remove(LocalstorageFields.IS_MAPPING_ZONE)
        history.push(
          Routes.EDIT_COMPANY_TAXONOMY.replace(':id', companyDefault?.company_id || '').concat(
            `?page=${EPageKey.MAPPING_ZONE}`
          )
        )
        return
      }
      setModalSuccess(true)
    } catch (error) {
      setError(error || { message: strings.error.default })
      onError(error)
    }
    setModalMergeVisible(false)
  }

  const onClickBackError = () => {
    setError(undefined)
  }

  const getInternalCompaniesDetails = async (internalCompany: CreateNewCompanyType) => {
    // for only one company
    if (!internalCompany) {
      return null
    }
    try {
      const internalResponse = await client.query({
        query: getInternalCompany,
        variables: { id: internalCompany.internalId, isBcgAux: true },
        fetchPolicy: 'network-only',
      })
      client.clearStore()
      return internalResponse?.data?.getInternalCompanyById
    } catch (error) {
      onError(error)
      return null
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
      onError(error)
      return []
    }
  }

  return (
    <>
      <Section>
        {mergeLoading || dataLoading || querySourcePriorityLoading ? (
          <Updating
            sx={{ py: 7 }}
            loading
            text={querySourcePriorityLoading ? common.loading : 'Merging'}
          />
        ) : selectDefault ? (
          <>
            <Paragraph>
              You have chosen to aggregate, please confirm your chosen default source
            </Paragraph>
            <Paragraph sx={{ mt: 5, mb: 4 }} bold>
              {`Merge Company (${mergeCompany.length})`}
            </Paragraph>
            {mergeCompany.map((c, index) => (
              <Flex key={index} sx={{ mt: 3 }}>
                <CompanyItem
                  onCheck={id =>
                    setCompanyDefault(
                      mergeCompany.find(({ companyDetails }) => companyDetails.external_id === id)
                    )
                  }
                  checked={
                    c.companyDetails.external_id === companyDefault?.companyDetails.external_id
                  }
                  isInDefaultSelected
                  isInReAggregate
                  type="internal"
                  columns={COMPANY_GRID}
                  {...c}
                />
              </Flex>
            ))}

            <Flex sx={{ justifyContent: 'flex-end', mb: '7px', mt: 4 }}>
              <Button
                onPress={() => {
                  setCompanyDefault(undefined)
                  setSelectDefault(false)
                }}
                sx={{
                  height: '52px',
                  width: '182px',
                  backgroundColor: 'transparent',
                  color: 'darkGray',
                  border: 'solid 1px',
                  borderColor: 'darkGray',
                  mr: 3,
                }}
                label={buttons.back}
                disabled={dataLoading || mergeLoading || isMapping}
              />
              <Button
                onPress={() => getData()}
                sx={{ height: '52px', width: '182px', borderRadius: 10 }}
                label={`Merge${mergeCompany.length > 0 ? ` (${mergeCompany.length})` : ''}`}
                disabled={!companyDefault || dataLoading || mergeLoading}
              />
            </Flex>
          </>
        ) : (
          <>
            <ButtonText sx={{ mb: 4 }} onPress={onBack} />
            <FormSearch
              inputId="PageSearchResults-search-companies"
              size="small"
              defaultValue={query}
              refetch={refetch}
              backgroundColor="#F2F2F2"
              baseUrl={Routes.MERGE_COMPANY}
            />

            {loading || querySourcePriorityLoading ? (
              <Box sx={{ my: 5 }}>
                <Updating noPadding loading />
              </Box>
            ) : (
              <>
                {!!queryData?.length ? (
                  formatInternalSearchResult(queryData || []).map(
                    (c: SearchResultItem, index: number) => {
                      return (
                        <Flex key={index} sx={{ mt: 3 }}>
                          {Array.isArray(c.source) ? (
                            <AggregatedSource
                              key={index}
                              isInMerge
                              company={c.companyDetails}
                              sources={c.source}
                              onCheck={() => {}}
                            />
                          ) : (
                            <CompanyItem type="internal" {...c} />
                          )}
                          <Button
                            onPress={() => addCompany(c)}
                            sx={{ ml: '10px', height: '40px', width: '80px' }}
                            label="Add"
                            disabled={!!mergeCompany.find(e => c.company_id === e.company_id)}
                          ></Button>
                        </Flex>
                      )
                    }
                  )
                ) : (
                  <Heading center as="h4" sx={{ mt: 5, opacity: 0.3 }}>
                    {copy.companyNotInDatabase}
                  </Heading>
                )}
              </>
            )}
            {!!mergeCompany.length && (
              <>
                <Paragraph sx={{ mt: 6, mb: 4 }} bold>
                  {`Added Company (${mergeCompany.length})`}
                </Paragraph>
                {formatInternalSearchResult(mergeCompany).map((c, index) => (
                  <Flex key={index} sx={{ mt: 3 }}>
                    {Array.isArray(c.source) ? (
                      <AggregatedSource
                        key={index}
                        isInMerge
                        company={c.companyDetails}
                        sources={c.source}
                        onCheck={() => {}}
                      />
                    ) : (
                      <CompanyItem type="internal" {...c} />
                    )}
                    <Button
                      sx={{ mx: 3 }}
                      onPress={() => removeCompany(c.company_id || '')}
                      icon="remove"
                      size="tiny"
                      variant="black"
                    />
                  </Flex>
                ))}
                <Flex sx={{ justifyContent: 'flex-end', mb: '7px', mt: 4 }}>
                  <Button
                    onPress={() => onMerge()}
                    sx={{ height: '52px', width: '182px', borderRadius: 10 }}
                    label={`Merge${mergeCompany.length > 0 ? ` (${mergeCompany.length})` : ''}`}
                    disabled={
                      formatInternalSearchResult(mergeCompany).length <= 1 ||
                      querySourcePriorityLoading
                    }
                  />
                </Flex>
              </>
            )}
          </>
        )}

        {modalMergeVisible && (
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
            <MergeData
              loading={mergeLoading}
              dataMerge={dataMerge}
              companies={mergeCompany}
              isOutType={isOutType}
              extraData={extraData}
              companiesData={companiesData}
              setIsOutType={setIsOutType}
              setDataMerge={setDataMerge}
              mergeOverridesFn={{
                data: getMergeOverridesInput(resolveOverridesConflicts),
                isSelected: (field, item) => {
                  if (!resolveOverridesConflicts) return false
                  return !!(
                    resolveOverridesConflicts[field]?.uid &&
                    resolveOverridesConflicts[field]?.uid === item.uid
                  )
                },
                mergeResolveOverridesConflicts: d =>
                  setResolveOverridesConflicts({ ...resolveOverridesConflicts, ...d }),
              }}
              onCancel={() => {
                setDataMerge({
                  fintechType: companiesData?.getDataMergeCompany.dimensions?.fintechType?.reduce(
                    (acc: string[], { label }: { label: string }) => {
                      if (!acc.includes(label)) {
                        acc.push(label)
                      }
                      return acc
                    },
                    []
                  ),
                } as DataMerge)
                setModalMergeVisible(false)
              }}
              onFinish={() => onSubmitMerge()}
            />
          </Modal>
        )}
        {modalWarningSourceVisible && (
          <Modal
            sx={{
              width: '670px',
              maxWidth: '100%',
              padding: '60px 80px',
            }}
            buttons={[
              {
                label: buttons.ok,
                type: 'primary',
                action: () => {
                  setModalWarningSourceVisible(false)
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
        {modalWarningMergeVisible && (
          <Modal
            sx={{
              width: '670px',
              maxWidth: '100%',
              padding: '60px 80px',
            }}
            buttons={[
              {
                label: buttons.return,
                type: 'primary',
                action: () => {
                  setModalWarningMergeVisible(false)
                },
              },
            ]}
            buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
          >
            <Flex>
              <Icon icon="alert" size="small" background="red" color="white" />
              <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                FCT Status does not match!
              </Heading>
            </Flex>
            <Paragraph center>
              You are not allowed to merge companies with different fct status. Please change the
              status before trying again
            </Paragraph>
            <Divider />
            <Grid sx={{ width: '100%' }} mt={4} columns={'1fr 1fr'}>
              <Paragraph bold>{`Merging Company (${mergeCompany.length})`}</Paragraph>
              <Paragraph bold>FCT Status</Paragraph>
            </Grid>
            {mergeCompany?.map(({ companyDetails }, index) => (
              <Grid key={index} sx={{ width: '100%' }} mt={4} columns={'1fr 1fr'}>
                <Paragraph>{companyDetails.companyName}</Paragraph>
                <Paragraph>{showStatus(companyDetails.expandStatusId?.toString())}</Paragraph>
              </Grid>
            ))}
          </Modal>
        )}

        {modalSuccess && (
          <Modal
            buttons={[
              {
                label: 'View company details',
                type: 'outline',
                action: () => {
                  setModalSuccess(false)
                  history.push(
                    Routes.COMPANY.replace(
                      ':id',
                      mergeCompany.find(
                        ({ companyDetails }) =>
                          companyDefault?.companyDetails.external_id === companyDetails.external_id
                      )?.company_id || ''
                    )
                  )
                },
              },
              {
                label: 'Go back to search',
                type: 'primary',
                action: () => {
                  setModalSuccess(false)
                  history.push(Routes.SEARCH)
                },
              },
            ]}
          >
            <Heading center as="h4">
              {'Success!'}
            </Heading>
            <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
              {'Merge company successful'}
            </Paragraph>
          </Modal>
        )}

        {mutationError && (
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
        )}

        {modalError && (
          <Modal
            buttons={[
              {
                label: modalText[modalError].buttonBack,
                type: 'outline',
                action: () => {
                  setModalError(undefined)
                },
              },
            ]}
          >
            <Heading center as="h4">
              {modalText[modalError].body.title}
            </Heading>
            <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
              {modalText[modalError].body.body}
            </Paragraph>
          </Modal>
        )}
      </Section>
    </>
  )
}

export default Merge
