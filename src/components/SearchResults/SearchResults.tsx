import React, { useEffect, useRef, useState } from 'react'
import { Heading, Paragraph, Section } from '../primitives'
import strings from '../../strings'
import {
  SearchResultItem,
  CompanyFinancials,
  CompanyOverview,
  SourceDetail,
  CompanyAcquisitions,
  OverrideVisibilityRequest,
} from '../../types'
import { onChangeProps } from '../SearchResultBlock/SearchResultBlock'
import { SearchResultBlock, FooterCTAs, AddCompanyBlock, Updating, Button } from '../'
import { getSource, isGrantedPermissions, localstorage, LocalstorageFields } from '../../utils'
import { ReverseSource } from '../../utils/getSource'
import { cloneDeep } from '@apollo/client/utilities'
import Modal, { ButtonType } from '../Modal/Modal'
import { modals } from '../../pages/SearchResults/helpers'
import MergeOverrides from '../MergeData/tabs/MergeOverrides'
import {
  MergeCompanyOverridesInput,
  OverridesConflicts,
  OverridesConflictsValueWithUId,
  ResolveMergeOverridesConflicts,
} from '../MergeData/MergeData'
import { Box, Flex } from 'theme-ui'
import { v4 as uuidv4 } from 'uuid'
import { Function } from '../../utils/consts'
import { getMergeOverridesInput } from '../../utils/helper'
import { HasPendingCQField } from '../../pages/CompanyForm/CompanyForm'
import { ETLRunTimeContext, UserContext } from '../../context'
import { PERMISSIONS, Routes } from '../../types/enums'

export enum SearchBlockType {
  internal = 'internal',
  external = 'external',
}

export type CreateNewCompanyType = {
  externalId?: string
  source: string
  type?: string
  internalId: number | string
}

export type CompanyDetails = {
  id: string
  name: string
  overview: CompanyOverview
  financials?: CompanyFinancials
  companyName?: string
  acquisitions?: CompanyAcquisitions
  source?: string
}

export type CompanyToCreate = {
  externalId: string
  source: string
  priority: number
  details: string
  internalId?: string
}

export type SearchResultsProps = {
  internal: SearchResultItem[]
  external: SearchResultItem[]
  onPressForm(): void
  onAggregate(param?: any): void
  onCreateNewCompany(companiesToCreate: CompanyToCreate[]): void
  getInternalCompaniesDetails(internalCompanies: CreateNewCompanyType[]): any
  getExternalCompaniesDetails(externalCompanies: CreateNewCompanyType[]): any
  onAddSourceToExistingCompanyClick(
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[],
    overrides: MergeCompanyOverridesInput[]
  ): any
  onMergeCompany(): void
  getAllOverrideVisibility(
    input: OverrideVisibilityRequest
  ): Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]>
  sourcePriority: SourcePriority[]
  getCompanyChangeRequests(id: number): Promise<HasPendingCQField[]>
}

type SelectedCompanies = Record<string, boolean>
type State = {
  internal: SelectedCompanies
  external: SelectedCompanies
}

type modalState = {
  modalVisible: keyof typeof modals | null
}

export type SourcePriority = {
  source: string
  priority: number
}

const SearchResults = ({
  internal,
  external,
  onCreateNewCompany,
  onAggregate,
  onPressForm,
  onMergeCompany,
  getInternalCompaniesDetails,
  getExternalCompaniesDetails,
  onAddSourceToExistingCompanyClick,
  getAllOverrideVisibility,
  getCompanyChangeRequests,
  sourcePriority,
}: SearchResultsProps) => {
  const { searchResults: copy } = strings
  const localState = localstorage.get(LocalstorageFields.COMPANY_AGGREGATE)
  const isMapping = !!localstorage.get(LocalstorageFields.IS_MAPPING_ZONE)
  const isFirstRun = useRef(true)

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { user } = React.useContext(UserContext)

  const hasPermission = React.useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.COMPANY_EDIT_SOURCE] }, user),
    [user]
  )

  const [searchState, setState] = useState<State>(
    localState
      ? JSON.parse(localState)
      : {
          internal: {},
          external: {},
        }
  )
  const [isInAggregate, setIsInAggregate] = useState<boolean>(false)
  const [isInCreateNewCompany, setIsInCreateNewCompany] = useState<boolean>(false)
  const [isModalOverrideVisible, setIsModalOverrideVisible] = useState<boolean>(false)
  const [dataOverride, setDataOverride] = useState<
    OverridesConflicts<OverridesConflictsValueWithUId>[]
  >([])
  const [resolveOverridesConflicts, setResolveOverridesConflicts] = React.useState<
    ResolveMergeOverridesConflicts
  >()
  const [companyDetail, setCompanyDetail] = useState<{
    internal: CompanyToCreate[]
    external: CompanyToCreate[]
  }>({ internal: [], external: [] })

  const listValuesSources = sourcePriority.map(({ source }) => source)
  const listKeysSources = sourcePriority.map(
    ({ source }) => ReverseSource[source as keyof typeof ReverseSource]
  )

  useEffect(() => {
    if (isFirstRun.current && isMapping) {
      getLeftButtonAction()
      isFirstRun.current = false
    }
  })

  const filterCheckCompanyOfASource = ({ type, state, companyId }: onChangeProps) => {
    const dataSources = type === 'internal' ? internal : external
    const oppositeDataSources = type === 'internal' ? external : internal
    let responseType = {
      ...state,
    }

    let responseOppositeType =
      type === 'internal' ? { ...searchState.external } : { ...searchState.internal }

    const source = dataSources.find(item => item.companyDetails.companyId === companyId)?.source
    let data = {} as { [x: string]: any }
    dataSources.forEach(item => {
      data[item.companyDetails.companyId] = item.source
    })
    oppositeDataSources.forEach(item => {
      data[item.companyDetails.companyId] = item.source
    })

    Object.keys(responseType).forEach(item => {
      responseType[item] = data[item] === source ? false : responseType[item]
    })
    Object.keys(responseOppositeType).forEach(item => {
      responseOppositeType[item] = data[item] === source ? false : responseOppositeType[item]
    })

    if (type === 'internal') {
      responseType = {
        [companyId || '']: state[companyId || ''],
      }
    }

    return [
      { ...responseType, [companyId as string]: state[companyId || ''] },
      responseOppositeType,
    ]
  }

  const onChange = ({ type, state, companyId }: onChangeProps) => {
    const oppositeType: keyof typeof SearchBlockType = type === 'internal' ? 'external' : 'internal'
    if ((isInAggregate || isInCreateNewCompany) && companyId) {
      // select one company to be default
      setState({ ...searchState, [type]: { [companyId]: true }, [oppositeType]: {} })
      return
    }
    const stateArr = filterCheckCompanyOfASource({ type, state, companyId })
    setState({ ...searchState, [type]: stateArr[0], [oppositeType]: stateArr[1] })
  }

  const [modalState, setModalState] = useState<modalState>({ modalVisible: null })
  const [manualLoading, setManualLoading] = useState(false)

  const getDataRecordsOfInternal = (internalRecord?: SearchResultItem) => {
    // internalRecord.source must be an array of source detail
    if (internalRecord || (internal?.length && Array.isArray(internal[0].source))) {
      const dataInternal: SearchResultItem[] = ((internalRecord?.source ||
        internal[0].source) as SourceDetail[]).map(item => {
        return {
          company_id: item.company.external_id,
          companyDetails: item.company,
          source: item.company.source,
          category: undefined, // need to map,
          defaultSource: false,
          priority: item.company.priority,
        } as SearchResultItem
      })
      return dataInternal
    }
    return [...internal]
  }

  const getPriorityForSources = (chosenSource: string) => {
    let response = {} as { [x: string]: number }
    response[chosenSource] = 1 //highest
    const listValue = cloneDeep(listValuesSources)
    let listSourcesOfCompanies: SearchResultItem[]
    if (isInAggregate) {
      listSourcesOfCompanies = [...external, ...getDataRecordsOfInternal()]
    } else {
      listSourcesOfCompanies = [...external]
    }
    const sourcesArray = listSourcesOfCompanies.map(item => getSource(item?.source as string))
    listValue.splice(
      listValue.findIndex(item => item === chosenSource),
      1
    )
    let count = 2
    listValue.forEach((item, index) => {
      response[item] = sourcesArray.includes(item) ? count++ : 0
    })
    return response
  }

  const getExternalCompaniesForRequest = (
    chosenSource: string,
    listCompaniesRequest: CreateNewCompanyType[],
    listCompaniesResponse: any[]
  ) => {
    const priorities = getPriorityForSources(chosenSource || '')
    const companies: CompanyToCreate[] = listCompaniesResponse.map((c: CompanyDetails) => {
      const company = listCompaniesRequest.find(ctc => ctc.externalId === c.id)
      return company
        ? ({
            externalId: company?.externalId as string,
            source: company?.source as string,
            // priority logic added
            priority: priorities[company?.source || ''],
            details: JSON.stringify(c),
          } as CompanyToCreate)
        : ({} as CompanyToCreate)
    })
    return companies.filter(item => Object.keys(item).length)
  }

  const getInternalCompaniesForRequest = (
    chosenSource: string,
    listCompaniesRequest: CreateNewCompanyType[],
    listCompaniesResponse: any[]
  ) => {
    const priorities = getPriorityForSources(chosenSource || '')
    const companies: any = listCompaniesResponse.map((c: CompanyDetails) => {
      const company = listCompaniesRequest.find(ctc =>
        ctc.source === 'bcg' ? ctc.internalId?.toString() === c.id : ctc.externalId === c.id
      )
      return company
        ? {
            internalId: company?.internalId,
            source: company?.source,
            // priority logic added
            priority: priorities[company?.source || ''],
            details: JSON.stringify({ ...c, name: c.companyName } as CompanyDetails),
            externalId: company?.externalId,
          }
        : {}
    })
    return companies.filter((item: CompanyToCreate) => Object.keys(item).length)
  }

  const onFooterClickCreateNewCompany = async (listRecords?: SearchResultItem[]) => {
    setManualLoading(true)
    const externalCompany: CreateNewCompanyType[] = (listRecords || external).map(company => {
      return {
        internalId: company.companyDetails.companyId,
        externalId: company.companyDetails.companyId,
        source: getSource(company?.source as string),
        type: company.source as string,
      }
    })
    const externalResponse = await getExternalCompaniesDetails(externalCompany)
    if (externalCompany.length && externalResponse?.length) {
      const chosenSource = externalCompany.find(ctc => searchState.external[ctc.externalId || ''])
        ?.source
      const companies = getExternalCompaniesForRequest(
        chosenSource as string,
        externalCompany,
        externalResponse
      )
      onCreateNewCompany(companies)
    }
    setManualLoading(false)
    resetAll()
  }

  const getChosenSourceInReAggregate = (list: CreateNewCompanyType[]) => {
    const response = list.find(item => {
      return (
        searchState.external[item.externalId || ''] ||
        searchState.internal[item.externalId || ''] ||
        searchState.internal[item.internalId || '']
      )
    })?.source as string
    return response
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

  const onAddSourceToExistingCompany = async () => {
    setIsModalOverrideVisible(false)
    setManualLoading(true)
    // get External data
    const externalCompany: CreateNewCompanyType[] = external.map(company => {
      return {
        internalId: company.companyDetails.companyId,
        externalId: company.companyDetails.companyId,
        source: getSource(company?.source as string),
        type: company.source as string,
      }
    })
    // get Internal data
    const internalCompany: CreateNewCompanyType[] = (internal?.length &&
    Array.isArray(internal[0].source)
      ? getDataRecordsOfInternal()
      : internal
    ).map(company => {
      return {
        internalId: +company.companyDetails.companyId,
        source: getSource(company?.source as string),
        type: company.source as string,
        externalId: company.companyDetails.external_id,
      }
    })

    const changeRequestData = await getCompanyChangeRequests(+internalCompany[0].internalId)
    if (changeRequestData.length) {
      setManualLoading(false)
      setModalState({ ...modalState, modalVisible: 'errorByChangeRequest' })
      return
    }

    const internalRequest = internalCompany.filter(item => item.source === 'bcg')
    const externalRequest = [
      ...externalCompany,
      ...internalCompany.filter(item => item.source !== 'bcg'),
    ]

    const externalResponse = await getExternalCompaniesDetails(externalRequest)
    const internalResponse = await getInternalCompaniesDetails(internalRequest)

    if (
      externalCompany.length &&
      // externalResponse?.data?.getExternalCompaniesByIds?.companies?.length &&
      internalCompany.length
      // internalResponse?.data?.getInternalCompanyById
    ) {
      const chosenSource =
        internal?.length && Array.isArray(internal[0].source)
          ? getChosenSourceInReAggregate([...externalCompany, ...internalCompany])
          : [...externalCompany, ...internalCompany].find(
              ctc =>
                searchState.external[ctc.externalId || ''] ||
                searchState.internal[ctc.internalId || ''] ||
                searchState.internal[ctc.externalId || '']
            )?.source
      const externalCompanies = getExternalCompaniesForRequest(
        chosenSource as string,
        externalCompany,
        externalResponse
      )

      const totalResponse = internalResponse
        ? [internalResponse, ...externalResponse]
        : externalResponse
      const internalCompanies = getInternalCompaniesForRequest(
        chosenSource as string,
        internalCompany,
        totalResponse
      )

      const defaultCompany = [...externalCompanies, ...internalCompanies].find(
        ({ priority }) => priority === 1
      )

      const isDefaultFromInternal = !externalCompanies.some(({ priority }) => priority === 1)

      setCompanyDetail({ internal: internalCompanies, external: externalCompanies })

      if (defaultCompany) {
        const allExternalLocations = externalResponse.reduce((res: any[], item: CompanyDetails) => {
          return external.some(({ companyDetails: { companyId } }) => companyId === item.id)
            ? [...res, ...(item.overview.companyLocation?.filter(item => item.isHeadQuarter) || [])]
            : res
        }, [])
        const externalDefault: CompanyDetails = totalResponse.find(
          (item: CompanyDetails) =>
            item.id ===
            (defaultCompany.source !== 'bcg'
              ? defaultCompany.externalId
              : `${defaultCompany.internalId}`)
        )

        const externalDefaultInput = {
          ...externalDefault,
          overview: {
            ...externalDefault.overview,
            companyLocation: allExternalLocations,
          },
        } as CompanyDetails
        const defautDataString = JSON.stringify(externalDefaultInput)
        const input = {
          functionName: isDefaultFromInternal ? Function.AGGREGATE_INTERNAL : Function.AGGREGATE,
          companyIds: [...externalCompanies, ...internalCompanies].map(
            ({ priority, externalId, internalId, details, source }) => ({
              priority,
              companyId: internalId,
              externalId,
              data: priority === 1 ? defautDataString : details,
              source,
            })
          ),
        } as OverrideVisibilityRequest
        const data = await getOverrideVisibility(input)
        setDataOverride(data)
        if (data.length) {
          setIsModalOverrideVisible(true)
          setManualLoading(false)
          return
        }
      }
      await onAddSourceToExistingCompanyClick(
        externalCompanies,
        internalCompanies,
        getMergeOverridesInput(resolveOverridesConflicts)
      )
    }
    setManualLoading(false)
    resetAll()
  }

  const noResults = internal.length < 1 && external.length < 1

  const aggregateDisabled = !(
    Object.values(searchState.internal).filter(a => a === true).length > 0 &&
    Object.values(searchState.external).filter(a => a === true).length > 0
  )

  const createNewCompanyDisabled = !(
    Object.values(searchState.external).filter(a => a === true).length > 0 &&
    Object.values(searchState.internal).filter(a => a === true).length < 1
  )

  const confirmAggregateDisable =
    (Object.values(searchState.external).filter(a => a === true).length < 1 &&
      Object.values(searchState.internal).filter(a => a === true).length < 1) ||
    (Object.values(searchState.external).filter(a => a === true).length > 0 &&
      Object.values(searchState.internal).filter(a => a === true).length > 0)

  const resetAll = () => {
    onAggregate({
      internal: {} as { [x: string]: boolean },
      external: {} as { [x: string]: boolean },
    })
    setState({
      internal: {},
      external: {},
    })
    setIsInAggregate(false)
    setIsInCreateNewCompany(false)
    localstorage.remove(LocalstorageFields.COMPANY_AGGREGATE)
  }

  const getInitialDefaultId = (records: SearchResultItem[]) => {
    records.sort((a, b) => {
      return (
        listKeysSources.findIndex(item => item === (a.source as string)) -
        listKeysSources.findIndex(item => item === (b.source as string))
      )
    })
    return records[0].companyDetails.companyId as string
  }

  const checkIfDuplicateSourceInAggregate = () => {
    if (internal?.length && Array.isArray(internal[0].source)) {
      return internal[0].source
        .map(item => (item.source?.label ? item.source?.label : item.source))
        .some(item => {
          return external.map(e => e.source).some(s => s === item)
        })
    }
    return false
  }

  const setDefaultRecordForNewAggregate = () => {
    const chosenRecordIds = Object.keys({
      ...searchState.external,
      ...searchState.internal,
    }).filter(item => searchState.external[item] || searchState.internal[item])
    const records = [...external, ...internal].filter(item =>
      chosenRecordIds.includes(item.companyDetails.companyId)
    )
    const initialDefaultId = getInitialDefaultId(records)
    const state = internal.some(item => item.companyDetails.companyId === initialDefaultId)
      ? {
          internal: { [initialDefaultId]: true },
          external: {},
        }
      : {
          internal: {},
          external: { [initialDefaultId]: true },
        }
    setState(state)
  }

  const setDefaultRecordForReaggregate = (
    internalRecord: SearchResultItem,
    externalRecords: SearchResultItem[]
  ) => {
    const internalSource = (internalRecord.source as SourceDetail[]).map(item =>
      getSource(item.company.source || '')
    )
    const externalSource = externalRecords.map(item => getSource(item.source as string))

    listValuesSources.find(item => {
      if (internalSource.includes(item)) {
        const record = getDataRecordsOfInternal(internalRecord)[
          internalSource.findIndex(x => x === item)
        ].companyDetails.external_id
        setState({ ...searchState, internal: { [record as string]: true }, external: {} })
        return true
      }
      if (externalSource.includes(item)) {
        const record =
          externalRecords[externalSource.findIndex(e => e === item)].companyDetails.companyId
        setState({ ...searchState, external: { [record as string]: true }, internal: {} })
        return true
      }
      return false
    })
  }

  const getLeftButtonAction = () => {
    if (!checkTimeETL()) return
    if (isInCreateNewCompany || isInAggregate) {
      resetAll()
      return
    }
    if (!isInAggregate) {
      const internalRecord = internal.find(
        item => searchState.internal[item.companyDetails.companyId as string]
      )

      const externalRecords = external.filter(
        item => searchState.external[item.companyDetails.companyId as string]
      )

      if (!internalRecord) {
        return
      }

      switch (Array.isArray(internalRecord?.source)) {
        case true: {
          setDefaultRecordForReaggregate(internalRecord, externalRecords)
          break
        }

        case false: {
          setDefaultRecordForNewAggregate()
          break
        }
      }
    }
    onAggregate(
      isInAggregate
        ? { internal: {} as { [x: string]: boolean }, external: {} as { [x: string]: boolean } }
        : searchState
    )
    setIsInAggregate(!isInAggregate)
  }

  const checkIfDefaultSourceIsManual = () => {
    const selectedCompanyId = Object.keys(searchState.internal).find(
      item => searchState.internal[item]
    )
    if (!selectedCompanyId || !internal?.length) {
      return false
    }
    if (Array.isArray(internal[0].source)) {
      // reAggregate (aggregate an aggregated company with new external companies)
      return (internal[0].source as SourceDetail[]).find(
        item => item.company.external_id === selectedCompanyId && item.company.source === 'MANUAL'
      )
    } else {
      // new aggregate
      return internal.find(
        item =>
          item.companyDetails.companyId === selectedCompanyId &&
          item.companyDetails.source === 'MANUAL'
      )
    }
  }

  const getRightButtonAction = () => {
    if (!checkTimeETL()) return
    if (isInCreateNewCompany) {
      onFooterClickCreateNewCompany()
      return
    }
    if (isInAggregate) {
      if (checkIfDuplicateSourceInAggregate()) {
        setModalState({ ...modalState, modalVisible: 'errorAggregate' })
        return
      }
      if (checkIfDefaultSourceIsManual()) {
        setModalState({ ...modalState, modalVisible: 'confirmAggregate' })
      } else {
        onAddSourceToExistingCompany()
      }
    } else {
      setIsInCreateNewCompany(true)
      const chosenRecordIds = Object.keys(searchState.external).filter(
        item => searchState.external[item]
      )
      const records = external.filter(item =>
        chosenRecordIds.includes(item.companyDetails.companyId)
      )
      if (chosenRecordIds.length === 1) {
        onFooterClickCreateNewCompany(records)
        return
      }

      const initialDefaultId = getInitialDefaultId(records)
      onAggregate(searchState) // set chosen record and come to page select default company
      setState({
        internal: {},
        external: { [initialDefaultId]: true },
      })
    }
  }

  const getDisableLeftButton = () => {
    if (isInCreateNewCompany) {
      return false
    }
    return isInAggregate ? false : aggregateDisabled
  }

  const getDisableRightButton = () => {
    if (isInCreateNewCompany) {
      return confirmAggregateDisable
    }
    return isInAggregate ? confirmAggregateDisable : createNewCompanyDisabled
  }

  const onCloseModal = () => {
    setModalState({ ...modalState, modalVisible: null })
  }

  const getModalButtons = (): ButtonType[] | undefined => {
    if (!modalState.modalVisible) return undefined
    return modals[modalState.modalVisible].buttons.map(b => ({
      ...b,
      action: modalActions[b.action],
    })) as ButtonType[]
  }

  const modalActions: Record<string, () => void> = {
    successAdd: () => {
      setModalState({ ...modalState, modalVisible: null })
    },
    confirmAggregate: () => {
      onAddSourceToExistingCompany()
      onCloseModal()
    },
    errorAggregate: onCloseModal,
    back: onCloseModal,
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

  const onFinish = async () => {
    setManualLoading(true)
    setIsModalOverrideVisible(false)
    await onAddSourceToExistingCompanyClick(
      companyDetail?.external,
      companyDetail?.internal,
      getMergeOverridesInput(resolveOverridesConflicts)
    )
    setManualLoading(false)
    resetAll()
  }

  return manualLoading ? (
    <Updating loading />
  ) : (
    <>
      {noResults ? (
        <>
          <Section>
            <Heading center as="h4" sx={{ opacity: 0.3 }}>
              {copy.companyNotInBothDatabases}
            </Heading>
          </Section>
          <AddCompanyBlock sx={{ mt: 5 }} onPressForm={onPressForm} />
        </>
      ) : (
        <Section>
          <>
            {(isInAggregate || isInCreateNewCompany) && (
              <Paragraph sx={{ mb: 5 }}>{copy.subtitle}</Paragraph>
            )}
            {!isInCreateNewCompany && (
              <SearchResultBlock
                onChange={onChange}
                type={SearchBlockType.internal}
                list={internal}
                state={searchState.internal}
                isInDefaultSelected={isInAggregate || isInCreateNewCompany}
                isInReAggregate={
                  !!internal?.length && Array.isArray(internal[0].source) && isInAggregate
                }
                onMergeCompany={onMergeCompany}
              />
            )}
            <SearchResultBlock
              isInDefaultSelected={isInAggregate || isInCreateNewCompany}
              onChange={onChange}
              type={SearchBlockType.external}
              sx={{ mt: 6 }}
              list={external}
              state={searchState.external}
            />
            {modalState.modalVisible && (
              <Modal buttons={getModalButtons()}>
                <Heading sx={{ mb: 3 }} as="h4">
                  {modals[modalState.modalVisible].heading}
                </Heading>
                <Paragraph sx={{ fontSize: 16 }} center>
                  {modals[modalState.modalVisible].body}
                </Paragraph>
              </Modal>
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
                  {copy.override}
                </Heading>
                <Box sx={{ height: '75%', overflowY: 'auto', width: '100%', px: 6 }}>
                  <MergeOverrides
                    sx={{ width: '100%', '& > p': { textAlign: 'center' } }}
                    label={''}
                    data={dataOverride}
                    isSelected={isSelected}
                    onSelect={(field: string, item: OverridesConflictsValueWithUId) => {
                      setResolveOverridesConflicts({ ...resolveOverridesConflicts, [field]: item })
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
        </Section>
      )}
      {!noResults && (
        <FooterCTAs
          buttons={[
            {
              label:
                isInAggregate || isInCreateNewCompany
                  ? copy.aggregate.goBack
                  : copy.ctas.aggregateSources,
              onClick: getLeftButtonAction,
              disabled: !hasPermission || getDisableLeftButton(),
            },
            {
              label:
                isInAggregate || isInCreateNewCompany
                  ? copy.aggregate.confirmDefault
                  : copy.ctas.createNewCompany,
              onClick: getRightButtonAction,
              disabled: getDisableRightButton(),
            },
          ]}
        />
      )}
    </>
  )
}

export default SearchResults
