import React, { useEffect, useState, useContext } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'

import {
  TaxonomyType,
  CompanyTypeSector,
  TagData,
  TagContainerParent,
  TagGroupType,
  GetCompanyDimensions,
  MappedTagData,
  Tag,
  ButtonTagType,
  CompanyDimensions,
  HistoryStack,
  TaxonomyProps,
  TaxonomyState,
  StateSelectedTags,
  StateOpenedTags,
  TagChangeRequestResult,
  TagChangeRequest,
} from '../../types'
import {
  DimensionType,
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumDimensionValue,
  EnumExpandStatusId,
  EnumTagGroupSource,
  EnumVariantKeys,
  EPageKey,
  ETaxonomyKeys,
  Routes,
  SortDirection,
  TagTypes,
} from '../../types/enums'
import {
  TagsSection,
  TabMenuCategories,
  TagMapping,
  FooterCTAs,
  ButtonText,
  TagGroup,
  Updating,
  Modal,
  Message,
  Checkbox,
  ReasonTextField,
  ViewOverrideButtons,
} from '../../components'
import { Paragraph, Section } from '../../components/primitives'
import strings from '../../strings'
import { localstorage, LocalstorageFields } from '../../utils'

import {
  GET_TAXONOMY,
  MAP_COMPANY_DIMENSIONS,
  GET_COMPANY_DIMENSIONS,
  GET_TAGS,
  GET_TAG_CHANGE_REQUESTS,
  APPROVE_REJECT_TAG_CHANGE_REQUESTS,
} from './graphql'
import { Heading } from '../../components/primitives'
import { useHistory, useParams, useLocation, useRouteMatch } from 'react-router-dom'
import {
  checkValidTaxonomy,
  ColumnNames,
  convertToCompanyDimensions,
  findCQ,
  getTaxonomyMapInput,
  isEmptyTaxonomy,
  TableNames,
} from './helpers'
import { updatedStateBranch } from '../../utils/updateTaxonomyStateBranch'
import CategoryTabPills from '../../components/CategoryTabPills/CategoryTabPills'
import { useMemo } from 'react'
import { ETLRunTimeContext, UserContext } from '../../context'
import { ButtonTextProps } from '../../components/ButtonText/ButtonText'
import { TagMappingGrid, TagMappingItem, TMapping } from '../../components/TagMapping/TagMapping'
import {
  EActiveItemType,
  GetActiveTaxonomyOverridesResult,
  GET_ACTIVE_TAXONOMY_OVERRIDES,
  QueryGetActiveTaxonomyOverridesArgs,
} from '../../graphql/query/getActiveTaxonomyOverrides'
import { isOverrideUserFn } from '../../context/UserContext'
import { EViewBy } from '../../components/CompanyDimensionsHistory/CompanyDimensionsHistory'
import { ButtonType, ModalContent } from '../../components/Modal/Modal'
import ReasonPopover from '../../components/ReasonPopover'
import { popoverZIndex } from '../../utils/consts'
import CompanyContext from './provider/CompanyContext'
import { HasHistoryField, HasPendingCQField } from './CompanyForm'
import {
  CompanyDimensionsHistoryContainer,
  ListTaxonomyChangeRequestsContainer,
} from '../../container'
import { QueryGetCompanyDimensionsOverridesHistoryArgs } from '../../graphql/query/getCompanyDimensionsOverridesHistory'
import { QueryGetAllTaxonomyChangeRequestsArgs } from '../../graphql/query/getAllTaxonomyChangeRequets'
import { ESortFields } from '../ChangeRequestManagement/helpers'
import TagChangeRequestView from '../../components/TagChangeRequest/TagChangeRequestPopUp'
import { Palette } from '../../theme'
import { EPage, getPage } from '../SearchResults/helpers'

type TReasonModal = {
  message: string
  open?: boolean
}

type TViewHistory =
  | (QueryGetCompanyDimensionsOverridesHistoryArgs & {
      dimension?: number
      viewBy?: EViewBy
    })
  | undefined

type TViewChangeRequests = QueryGetAllTaxonomyChangeRequestsArgs | undefined

type TaxonomyChange = {
  hasChangeTags: boolean
  hasChangeTagGroupChildren: boolean
  hasChangeCompanyType: boolean
  hasChange: boolean
}

const DEFAULT_REASON: TReasonModal = {
  message: '',
  open: false,
}

const convertData = (data: GetCompanyDimensions): TaxonomyState => {
  const {
    getCompanyDimensions: {
      mapping,
      extra,
      tags,
      categories,
      fintechType,
      fintechTypeCRsCount,
      tagCRsCount,
    },
  } = data || {
    getCompanyDimensions: {
      mapping: [],
      extra: [],
      tags: [],
    },
  }

  const newSelectedTags = {
    primary: {
      fintech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.FIN && t.isPrimary
      ),
      insurtech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.INS && t.isPrimary
      ),
      regtech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.REG && t.isPrimary
      ),
    },
    aux: {
      fintech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.FIN && !t.isPrimary
      ),
      insurtech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.INS && !t.isPrimary
      ),
      regtech: mapping.filter(
        (t: MappedTagData) => t.type === EnumCompanyTypeSector.REG && !t.isPrimary
      ),
    },
  }

  return {
    tabActive: 'primary',
    extraSelectedTags: extra,
    selectedTags: newSelectedTags,
    selectedMap:
      (categories?.find(c => c.isPrimary)?.name as CompanyTypeSector) ||
      (newSelectedTags.primary.insurtech.length > 0
        ? EnumCompanyTypeSector.INS
        : EnumCompanyTypeSector.FIN),
    tagGroupChildrenSelected: tags,
    fintechType: (fintechType || [])
      .filter(({ fctStatusId }) => fctStatusId === +EnumExpandStatusId.FOLLOWING)
      .map((t: Tag) => t.id),
    fintechTypeOverrides: fintechType,
    tagCRsCount,
    fintechTypeCRsCount,
  }
}

const Taxonomy = ({
  taxonomyState: state,
  setTaxonomyState: setState,
  setError,
  showViewHistory,
  showPendingChangeRequest,
  viewHistory,
  overviewPendingRequest,
  refetchViewHistoryCols,
}: TaxonomyProps) => {
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings
  const [viewHistoryInput, setViewHistoryInput] = React.useState<TViewHistory>()
  const [viewChangeRequests, setViewChangeRequests] = React.useState<TViewChangeRequests>()

  //Context
  const { user } = useContext(UserContext)
  const { handleClickShowPendingCR } = useContext(CompanyContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const isOverrideUser = isOverrideUserFn(user)

  const isAddTaxonomy = useRouteMatch(Routes.ADD_COMPANY_TAXONOMY)?.isExact
  const isAddTaxonomyExternal = useRouteMatch(Routes.ADD_COMPANY_TAXONOMY_EXTERNAL)?.isExact

  const history = useHistory()
  const search = useLocation().search
  const page = useMemo(() => getPage(search), [search])
  const pageKey = useMemo(() => new URLSearchParams(search).get('page') || '', [search])

  const { id: companyId, cr: tagCRType } = useParams<{ id: string; cr: string }>()

  const [reasonModal, setReasonModal] = useState<TReasonModal>({ ...DEFAULT_REASON })
  const [tags, setTags] = useState<Record<DimensionType, TagData[]>[]>()
  const [historyStack, setHistoryStack] = useState<HistoryStack>({
    primary: {
      [EnumCompanyTypeSector.FIN]: [],
      [EnumCompanyTypeSector.INS]: [],
      [EnumCompanyTypeSector.REG]: [],
    },
    aux: {
      [EnumCompanyTypeSector.FIN]: [],
      [EnumCompanyTypeSector.INS]: [],
      [EnumCompanyTypeSector.REG]: [],
    },
  })
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false)
  const [exitModalVisible, setExitModalVisible] = useState<boolean>(false)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [initialState, setInitialState] = useState<TaxonomyState>({} as TaxonomyState)
  const [tagCRs, setTagCRs] = useState<TagChangeRequest[]>([])
  const [tagPendingRequestType, setTagPendingRequestType] = useState<TagTypes | undefined>(
    (tagCRType ? tagCRType.toUpperCase() : undefined) as TagTypes
  )

  // flags
  const reasonRequired = !isOverrideUser && !reasonModal.message

  // graphql
  const { data: activeTaxonomiesData, refetch: refetchActiveTaxonomies } = useQuery<
    GetActiveTaxonomyOverridesResult,
    QueryGetActiveTaxonomyOverridesArgs
  >(GET_ACTIVE_TAXONOMY_OVERRIDES, {
    variables: { companyId: +companyId },
    fetchPolicy: 'network-only',
    skip: !+companyId,
  })
  const [getTaxonomy, { data, loading, error: getTaxonomyError }] = useLazyQuery(GET_TAXONOMY)
  const [mapTaxonomy, { loading: mapTaxonomyLoading }] = useMutation(MAP_COMPANY_DIMENSIONS)

  const { loading: isFetching, refetch: refetchCompaniesDimensions } = useQuery<
    GetCompanyDimensions
  >(GET_COMPANY_DIMENSIONS, {
    variables: {
      companyId: +companyId,
      sources: ['bcg'],
    },
    skip: !+companyId,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      if (+companyId) {
        const newState = convertData(data)

        setState(newState)
        setInitialState(newState)

        setHistoryStack({
          primary: {
            [EnumCompanyTypeSector.FIN]: [newState],
            [EnumCompanyTypeSector.INS]: [newState],
            [EnumCompanyTypeSector.REG]: [newState],
          },
          aux: {
            [EnumCompanyTypeSector.FIN]: [newState],
            [EnumCompanyTypeSector.INS]: [newState],
            [EnumCompanyTypeSector.REG]: [newState],
          },
        })
      }
    },
  })

  const [getTagCRs, { loading: isFetchingTagCRs }] = useLazyQuery<TagChangeRequestResult>(
    GET_TAG_CHANGE_REQUESTS,
    {
      variables: {
        companyId: +companyId,
        type: tagPendingRequestType,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onCompleted: data => {
        setTagCRs(data?.getAllTagChangeRequests?.data || [])
      },
    }
  )

  const [approveRejectTagCRs, { loading: isSaving }] = useMutation(
    APPROVE_REJECT_TAG_CHANGE_REQUESTS
  )

  const resolveTagCRs = async (approve: number[], reject: number[], reason: string) => {
    try {
      await approveRejectTagCRs({
        variables: { companyId: +companyId, approve, reject, reason },
      })
      setTagPendingRequestType(undefined)
      refetchCompaniesDimensions()
      refetchViewHistoryCols && refetchViewHistoryCols()
    } catch (error) {
      setError((error as any)?.message || '')
    }
  }

  const activeTaxonomies = activeTaxonomiesData?.getActiveTaxonomyOverrides?.items || []
  const changeRequestCount =
    activeTaxonomiesData?.getActiveTaxonomyOverrides?.changeRequestsCount || 0

  const { data: getTagsResult, loading: getTagGWChildrenLoading } = useQuery(GET_TAGS, {
    variables: { sources: [EnumTagGroupSource.BCG] },
  })

  const { data: tagsBcgFixed } = useQuery(GET_TAGS, {
    variables: {
      sources: [EnumTagGroupSource.BCG_FIXED],
    },
  })

  const allTagGroups = useMemo(
    () =>
      (getTagsResult?.getTagGroups || []).map((tagGroup: TagData) => ({
        ...tagGroup,
        children: (tagGroup.children || []).map(item => ({
          ...item,
          parent: [{ id: tagGroup.id, label: tagGroup.label }],
        })),
      })),
    [getTagsResult]
  )

  const isLoading = getTagGWChildrenLoading || isFetching || loading

  if (data?.getTaxonomy?.taxonomy && JSON.stringify(tags) !== data.getTaxonomy.taxonomy) {
    setTags(JSON.parse(data.getTaxonomy.taxonomy))
  }

  useEffect(() => {
    if (state.selectedMap === EnumCompanyTypeSector.OUT) return
    state.selectedMap && getTaxonomy({ variables: { category: state.selectedMap } })
  }, [state.selectedMap, getTaxonomy])

  useEffect(() => {
    localstorage.set(LocalstorageFields.COMPANY_TAXONOMY, JSON.stringify(state))
  }, [state])

  const updateHistoryStack = () => {
    if (!selectedMap) return
    let temp = [
      ...(historyStack[tabActive] ? historyStack[tabActive][selectedMap] || [] : []),
    ] as TaxonomyState[]
    if (temp?.length === 100) {
      temp = [...temp.slice(1), state]
    } else {
      temp = [...temp, state]
    }
    setHistoryStack({
      ...historyStack,
      [tabActive]: updatedStateBranch(historyStack[tabActive], selectedMap, temp),
    })
  }

  const {
    tabActive,
    selectedMap,
    selectedTags,
    openedTags,
    tagGroupSelected,
    tagGroupChildrenSelected,
    extraSelectedTags,
    fintechType,
    fintechTypeOverrides,
  } = state

  const enableTagSection = !!(
    selectedTags?.primary?.regtech?.length ||
    selectedTags?.primary?.fintech?.length ||
    selectedTags?.primary?.insurtech?.length
  )

  const showTagSection =
    selectedMap !== EnumCompanyTypeSector.OUT &&
    (enableTagSection ||
      tagGroupChildrenSelected.length > 0 ||
      (fintechType && fintechType.length > 0))

  const isExistedCategory = (category: EnumCompanyTypeSector) =>
    tabActive === 'primary' &&
    selectedTags &&
    selectedTags[tabActive] &&
    selectedTags[tabActive]![category] &&
    selectedTags[tabActive]![category]!.length > 0

  const isExistedSomeCategory = (categories: EnumCompanyTypeSector[]) =>
    categories.some(item => isExistedCategory(item))

  const blockFin = isExistedSomeCategory([EnumCompanyTypeSector.INS, EnumCompanyTypeSector.REG])

  const blockIns = isExistedSomeCategory([EnumCompanyTypeSector.FIN, EnumCompanyTypeSector.REG])

  const blockReg = isExistedSomeCategory([EnumCompanyTypeSector.FIN, EnumCompanyTypeSector.INS])

  const correctSelectedMap = (() => {
    const isBlock = {
      [EnumCompanyTypeSector.FIN]: blockFin,
      [EnumCompanyTypeSector.INS]: blockIns,
      [EnumCompanyTypeSector.REG]: blockReg,
      [EnumCompanyTypeSector.OUT]: false,
    }
    if (selectedMap && !isBlock[selectedMap]) return selectedMap

    return blockFin
      ? blockIns
        ? blockReg
          ? selectedMap
          : EnumCompanyTypeSector.REG
        : EnumCompanyTypeSector.INS
      : EnumCompanyTypeSector.FIN
  })()

  useEffect(() => {
    if (correctSelectedMap !== selectedMap) {
      setState({ ...state, selectedMap: correctSelectedMap })
    }
  })

  const selectedMapsCount = {
    primary:
      selectedTags && selectedTags.primary
        ? Object.values(selectedTags.primary!).reduce((p: number, c) => p + (c || []).length, 0)
        : 0,
    aux:
      selectedTags && selectedTags.aux
        ? Object.values(selectedTags.aux).reduce((p: number, c) => p + (c || []).length, 0)
        : 0,
  }

  const buttonsMap: ButtonTagType[] = [
    {
      label: copy.maps.buttons.fintech,
      value: EnumCompanyTypeSector.FIN,
      disabled: isFetching || blockFin,
    },
    {
      label: copy.maps.buttons.insuretech,
      value: EnumCompanyTypeSector.INS,
      disabled: isFetching || blockIns,
    },
    {
      label: copy.maps.buttons.regTech,
      value: EnumCompanyTypeSector.REG,
      disabled: isFetching || blockReg,
    },
    {
      label: copy.maps.buttons.out,
      value: EnumCompanyTypeSector.OUT,
      disabled: isFetching,
    },
  ]

  const tabButtons = [
    {
      label: copy.tabs.primary,
      active: tabActive === 'primary',
      onClick: () => {
        setState({ ...state, tabActive: 'primary' })
      },
    },
    {
      label: copy.tabs.aux,
      active: tabActive === 'aux',
      onClick: () => {
        setState({ ...state, tabActive: 'aux' })
      },
    },
  ]

  const hasDataChange = (): TaxonomyChange => {
    const {
      selectedTags: initTags,
      extraSelectedTags: initExtraTags,
      tagGroupChildrenSelected: initTagGroupChildren,
      fintechType: initFintechType,
      selectedMap: initSelectedMap,
    } = initialState

    const tagsFlat: CompanyDimensions[] = [
      ...convertToCompanyDimensions(selectedTags?.primary, true),
      ...convertToCompanyDimensions(selectedTags?.aux),
      ...(extraSelectedTags || []).map(etr => ({ ...etr, isPrimary: true })),
    ]

    const initTagsFlat = [
      ...convertToCompanyDimensions(initTags?.primary, true),
      ...convertToCompanyDimensions(initTags?.aux),
      ...(initExtraTags || []).map(etr => ({ ...etr, isPrimary: true })),
    ]

    const tagChildren = [
      ...(tagGroupChildrenSelected || []).map(t => t.id),
      ...(fintechType && fintechType?.length > 0 ? fintechType : []),
    ]

    const initTagChildren = [
      ...(initTagGroupChildren || []).map(t => t.id),
      ...(initFintechType && initFintechType?.length > 0 ? initFintechType : []),
    ]

    const hasChangeTags =
      tagsFlat.length !== initTagsFlat.length ||
      tagsFlat.some(t =>
        initTagsFlat.filter(it => t.isPrimary === it.isPrimary).every(it => t.id !== it.id)
      )

    const hasChangeTagGroupChildren =
      tagChildren.length !== initTagChildren.length ||
      tagChildren.some(t => initTagChildren.every(it => t !== it))

    const hasChangeCompanyType =
      initSelectedMap !== EnumCompanyTypeSector.OUT && selectedMap === EnumCompanyTypeSector.OUT

    return {
      hasChangeTags,
      hasChangeTagGroupChildren,
      hasChangeCompanyType,
      hasChange: hasChangeTags || hasChangeCompanyType || hasChangeTagGroupChildren,
    }
  }

  const onExitModalConfirm = () => {
    localstorage.remove(LocalstorageFields.COMPANY_FORM)
    localstorage.remove(LocalstorageFields.COMPANY_ID)
    localstorage.remove(LocalstorageFields.COMPANY_TAXONOMY)
    history.push(EPage[pageKey]?.link || Routes.COMPANY.replace(':id', companyId))
  }

  const handleSave = async () => {
    try {
      if (reasonRequired || !checkTimeETL()) return
      const input = getTaxonomyMapInput(state, companyId, { bothAuxAndPrimCategories: true })
      await mapTaxonomy({
        variables: {
          input: {
            ...input,
            reason: isAddTaxonomyExternal ? strings.common.appendDataCreated : reasonModal.message,
            isMappingReviewed: pageKey === EPageKey.INCORRECT_MAPPING,
          },
        },
      })
      setReasonModal({ ...DEFAULT_REASON })
      refetchViewHistoryCols && refetchViewHistoryCols()
      const showModal = !!new URLSearchParams(search).get('page')

      if (isAddTaxonomyExternal || showModal) {
        setSuccessModalVisible(true)
      } else {
        history.push(Routes.COMPANY.replace(':id', companyId))
      }
    } catch (e) {
      setError((e as any)?.message || '')
    }
  }

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    try {
      if (isEmptyTaxonomy(state) && (isAddTaxonomy || isAddTaxonomyExternal)) {
        setConfirmModalVisible(true)
        return
      }

      if (checkValidTaxonomy(state)) {
        if (isAddTaxonomy || isAddTaxonomyExternal) {
          await handleSave()
        } else {
          setReasonModal(prev => ({ ...prev, open: true }))
          return
        }
      }
    } catch (e) {
      setError((e as any)?.message || '')
    }
  }

  const onMapButtonsPress = (selectedMap: CompanyTypeSector) => {
    updateHistoryStack()
    setState({ ...state, selectedMap })
  }

  const onSelectTags = (
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    tags: TagData[]
  ) => {
    const last = tags[tags.length - 1]
    tags.filter(t => t.dimensionType !== last.dimensionType || t.id === last.id)

    const newSelectedTags = updatedStateBranch(
      selectedTags,
      `${tabActive}.${type}`,
      tabActive === 'primary'
        ? type === EnumCompanyTypeSector.FIN
          ? tags.slice(-1)
          : tags.filter(t => t.dimensionType !== last.dimensionType || t.id === last.id) // allow 2 tags with different dimensionType
        : tags
    )

    let newExtraSelectedTags: TagData[] = []
    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }
    updateHistoryStack()
    setState({
      ...state,
      selectedTags: newSelectedTags,
      extraSelectedTags: newExtraSelectedTags,
    })
  }

  const onOpenTags = (
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    dimension: DimensionType,
    parents: TagContainerParent
  ) => {
    const clone = updatedStateBranch(openedTags, `${tabActive}.${type}.${dimension}`, parents)
    updateHistoryStack()
    setState({
      ...state,
      openedTags: clone,
    })
  }

  const onClickRemove = (
    tab: TaxonomyType,
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    tagData: TagData
  ) => {
    if (tab === 'group') {
      setState({
        ...state,
        tagGroupChildrenSelected: tagGroupChildrenSelected.filter(t => t.id !== tagData.id),
      })
      return
    }

    if (!selectedTags || !selectedMap || selectedMap === EnumCompanyTypeSector.OUT) return

    const newSelectedTagsByTab = selectedTags![tab]![type]?.filter(a =>
      type === EnumCompanyTypeSector.FIN ? a.link_id !== tagData.link_id : a.id !== tagData.id
    )
    const newSelectedTags = {
      ...state.selectedTags,
      [tab]: { ...selectedTags![tab], [type]: newSelectedTagsByTab },
    }

    let newExtraSelectedTags: TagData[] = []
    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }
    updateHistoryStack()

    setState({
      ...state,
      selectedTags: newSelectedTags,
      extraSelectedTags: newExtraSelectedTags,
    })
  }

  const onClearAllSelectedTags = () => {
    updateHistoryStack()
    setState({
      ...state,
      selectedTags: undefined,
      extraSelectedTags: [],
    })
  }

  const onTagGroupChildSelect = (tagGroupChildrenSelected: TagData[]) => {
    setState({ ...state, tagGroupChildrenSelected })
  }

  const onTagGroupSelect = (tagGroupSelected: TagGroupType) => {
    setState({ ...state, tagGroupSelected })
  }

  const onClickClearAll = () => {
    setState({ ...state, tagGroupChildrenSelected: [] })
  }

  /* TODO: Update undo function */
  const onClickUndo = () => {
    if (!selectedMap) return
    const activeStack = historyStack[tabActive][selectedMap]
    if (!activeStack) return
    const last = activeStack[activeStack.length - 1]

    const newSelectedTags = updatedStateBranch(
      selectedTags,
      `${tabActive}.${selectedMap}`,
      last?.selectedTags &&
        last.selectedTags[tabActive] &&
        last.selectedTags[tabActive]![selectedMap]
        ? last.selectedTags[tabActive]![selectedMap]
        : []
    )

    let newExtraSelectedTags: TagData[] = []

    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }

    setState({
      ...state,
      selectedTags: newSelectedTags,
      openedTags: updatedStateBranch(
        openedTags,
        `${tabActive}.${selectedMap}`,
        last?.openedTags && last.openedTags[tabActive]
          ? last.openedTags[tabActive]![selectedMap] || []
          : {}
      ),
      extraSelectedTags: newExtraSelectedTags,
    })

    setHistoryStack({
      ...historyStack,
      [tabActive]: updatedStateBranch(
        historyStack[tabActive],
        selectedMap,
        [...activeStack].slice(0, -1) || []
      ),
    })
  }

  const getUnSelectable = ({
    selectedTags,
    selectedMap,
    tabActive,
  }: {
    selectedTags: StateSelectedTags | undefined
    selectedMap: CompanyTypeSector
    tabActive: Exclude<TaxonomyType, 'group'>
  }) => {
    return [
      ...(!!(
        selectedTags &&
        selectedTags[tabActive === 'primary' ? 'aux' : 'primary'] &&
        selectedTags[tabActive === 'primary' ? 'aux' : 'primary']![selectedMap]
      )
        ? selectedTags[tabActive === 'primary' ? 'aux' : 'primary']![selectedMap] || []
        : []),
      ...(tabActive === 'aux' ? extraSelectedTags || [] : []),
    ]
  }

  const getSelectedTags = ({
    selectedTags,
    selectedMap,
    tabActive,
  }: {
    selectedTags: StateSelectedTags | undefined
    selectedMap: CompanyTypeSector
    tabActive: Exclude<TaxonomyType, 'group'>
  }) => {
    return selectedTags && selectedTags[tabActive] && selectedTags[tabActive]![selectedMap]
      ? selectedTags[tabActive]![selectedMap]
      : []
  }

  const getOpenedTags = ({
    openedTags,
    selectedMap,
    tabActive,
    key,
  }: {
    openedTags: StateOpenedTags | undefined
    selectedMap: CompanyTypeSector
    tabActive: Exclude<TaxonomyType, 'group'>
    key: EnumDimensionType
  }) => {
    return openedTags &&
      openedTags[tabActive] &&
      openedTags[tabActive]![selectedMap] &&
      openedTags[tabActive]![selectedMap]![key]
      ? openedTags[tabActive]![selectedMap]![key]
      : { parent: [], tags: [] }
  }

  const getMappings = ({
    selectedTags,
    typeTech,
    tabActive,
  }: {
    selectedTags: StateSelectedTags
    typeTech: EnumCompanyTypeSector
    tabActive: Exclude<TaxonomyType, 'group'>
  }): TMapping => {
    if (!selectedTags || !selectedTags[tabActive]) return { data: [] }

    const dimension = EnumDimensionValue.PRIMARY
    const isPrimary = tabActive === 'primary'
    return {
      data: selectedTags![tabActive]![typeTech]
        ? (selectedTags![tabActive]![typeTech] || [])?.filter(t => t.dimension === dimension)
        : [],
      buttons: viewHistoryBtns(
        {
          category: typeTech,
          isPrimary,
          dimension,
        },
        EActiveItemType.DIMENSION
      ),
    }
  }

  const getExtraMappings = ({
    selectedTags,
    typeTech,
    extraSelectedTags,
  }: {
    selectedTags: StateSelectedTags
    typeTech: EnumCompanyTypeSector
    extraSelectedTags?: TagData[]
  }) => {
    const prims = (selectedTags?.primary || {})[typeTech] || []
    const auxs = (selectedTags?.aux || {})[typeTech] || []
    const dimension = EnumDimensionValue.SECONDARY
    return {
      primary: {
        data: [
          ...(extraSelectedTags || []).filter(() => typeTech === EnumCompanyTypeSector.FIN),
          ...prims.filter(t => t.dimension === dimension),
        ],
        buttons: viewHistoryBtns(
          { category: typeTech, isPrimary: true, dimension },
          EActiveItemType.DIMENSION
        ),
      },
      aux: {
        data: auxs.filter(t => t.dimension === dimension),
        buttons: viewHistoryBtns(
          { category: typeTech, isPrimary: false, dimension },
          EActiveItemType.DIMENSION
        ),
      },
    }
  }

  const auxMustGoWithPrimaryError =
    selectedMap &&
    selectedMap !== EnumCompanyTypeSector.OUT &&
    !selectedTags?.primary?.regtech?.length &&
    !selectedTags?.primary?.fintech?.length &&
    !selectedTags?.primary?.insurtech?.length &&
    (!!selectedTags?.aux?.fintech?.length ||
      !!selectedTags?.aux?.insurtech?.length ||
      !!selectedTags?.aux?.regtech?.length)

  const viewHistoryBtns = (
    input: {
      dimension?: number
      category?: EnumCompanyTypeSector
      isPrimary: boolean
    },
    type: EActiveItemType
  ): Array<ButtonTextProps> => {
    if (
      !+companyId ||
      !(activeTaxonomies || []).some(
        i =>
          i.type === type &&
          input.isPrimary === i.isPrimary &&
          i.category === input.category &&
          i.dimension === input.dimension
      ) ||
      !input.isPrimary
    ) {
      return []
    }

    return [
      {
        label: strings.common.viewHistory,
        sx: { border: 'none' },
        onPress: () => {
          setViewHistoryInput({
            ...input,
            companyId: +companyId,
            viewBy: input.isPrimary ? EViewBy.SEQ : EViewBy.DEFAULT,
          })
        },
      },
    ]
  }

  const hasHistory = (tag: TagData, isPrimary: boolean) => {
    return activeTaxonomies.some(
      i =>
        i.type === EActiveItemType.DIMENSION &&
        i.rowId === tag.companyDimensionId &&
        isPrimary === i.isPrimary
    )
  }

  const viewTagsPendingCQFn = (tag: TagData, columnName: string) => {
    const SOURCE_NA = 'NA'
    const hasPendingRequest = showPendingChangeRequest(
      TableNames.COMPANIES_TAGS,
      columnName,
      tag.rowId,
      SOURCE_NA
    )
    return hasPendingRequest
      ? () =>
          handleClickShowPendingCR({
            tableName: TableNames.COMPANIES_TAGS,
            columnName: columnName,
            companyId: +companyId,
            rowId: tag.rowId,
            source: SOURCE_NA,
          })
      : undefined
  }

  const viewTagsHistoryFn = (tag: TagData, columnName: string) => {
    const SOURCE_NA = 'NA'
    const hasHistory = showViewHistory(TableNames.COMPANIES_TAGS, columnName, tag.rowId, SOURCE_NA)
    return hasHistory
      ? () =>
          viewHistory({
            tableName: TableNames.COMPANIES_TAGS,
            columnName: columnName,
            companyId: +companyId,
            rowId: tag.rowId,
            source: SOURCE_NA,
          })
      : undefined
  }
  const handleAfterApproveRejectRequest = React.useCallback(
    (isApprove: boolean) => {
      refetchActiveTaxonomies()
      if (isApprove) {
        refetchCompaniesDimensions()
      }
      setViewChangeRequests(undefined)
    },
    [refetchActiveTaxonomies, refetchCompaniesDimensions]
  )

  return (
    <>
      <Section sx={{ mt: 3, maxWidth: 'none' }}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Paragraph bold>{copy.categories}</Paragraph>
          <ViewOverrideButtons
            viewHistory={
              !+companyId || selectedMap !== EnumCompanyTypeSector.OUT
                ? undefined
                : () => {
                    setViewHistoryInput({
                      isPrimary: tabActive === 'primary',
                      companyId: +companyId,
                      category:
                        selectedMap === EnumCompanyTypeSector.OUT
                          ? EnumCompanyTypeSector.OUT
                          : undefined,
                    })
                  }
            }
            viewPendingChangeRequest={
              !+companyId || !changeRequestCount
                ? undefined
                : () => {
                    setViewChangeRequests({ companyIds: [+companyId] })
                  }
            }
            totalItemPendingCR={changeRequestCount}
          />
        </Flex>
        <TabMenuCategories sx={{ mt: 5 }} buttons={tabButtons} />

        <Flex sx={{ mt: 6, alignItems: 'center' }}>
          <CategoryTabPills
            buttonsMap={buttonsMap}
            onMapButtonsPress={onMapButtonsPress}
            selectedMap={selectedMap}
          />
          {selectedTags && selectedTags[tabActive] && (
            <Paragraph sx={{ color: 'primary' }} bold>{`${
              selectedMapsCount.primary + selectedMapsCount.aux
            } ${
              selectedMapsCount.primary + selectedMapsCount.aux === 1
                ? copy.maps.selected.one
                : copy.maps.selected.more
            }`}</Paragraph>
          )}
        </Flex>
        {getTaxonomyError && selectedMap !== EnumCompanyTypeSector.OUT ? (
          <Flex sx={{ alignItems: 'center', pt: 7, justifyContent: 'center' }}>
            <Message variant="alert" body="Failed to fetch data." />
            {state.selectedMap && (
              <ButtonText
                label="Retry ?"
                onPress={() => getTaxonomy({ variables: { category: state.selectedMap } })}
                sx={{
                  textTransform: 'uppercase',
                  color: 'red',
                  ml: 1,
                  borderColor: 'red',
                  '&:hover': {
                    color: 'red',
                  },
                }}
              />
            )}
          </Flex>
        ) : (
          <>
            {tags && selectedMap && selectedMap !== EnumCompanyTypeSector.OUT ? (
              <>
                {isLoading ? (
                  <Updating loading />
                ) : (
                  <>
                    {tags.map((objectTag, index) => {
                      const key = Object.keys(objectTag)[0] as EnumDimensionType
                      const tagData = objectTag[key]
                      return (
                        <TagsSection
                          key={index}
                          sx={{ mt: 6 }}
                          tags={tagData}
                          type={selectedMap}
                          dimension={key}
                          onSelectTags={onSelectTags}
                          onOpenTags={onOpenTags}
                          selected={getSelectedTags({ selectedTags, selectedMap, tabActive })}
                          openedTags={getOpenedTags({ openedTags, tabActive, selectedMap, key })}
                          onClickUndo={onClickUndo}
                          showUndo={index === tags.length - 1}
                          unselectable={getUnSelectable({ selectedTags, selectedMap, tabActive })}
                        />
                      )
                    })}
                  </>
                )}
                {selectedTags && selectedMap && !isLoading && (
                  <>
                    {Object.values(EnumCompanyTypeSector).map((typeTech, index) => {
                      if (typeTech === EnumCompanyTypeSector.OUT) return null
                      if (
                        !!(selectedTags.primary || {})[typeTech]?.length ||
                        !!(selectedTags.aux || {})[typeTech]?.length
                      ) {
                        const mappings = {
                          primary: getMappings({
                            selectedTags,
                            typeTech,
                            tabActive: 'primary',
                          }),
                          aux: getMappings({ selectedTags, typeTech, tabActive: 'aux' }),
                        }

                        return (
                          <TagMapping
                            key={index}
                            sx={{ mt: 6 }}
                            typeTech={typeTech}
                            title={copy.types[typeTech as keyof typeof copy.types]}
                            onClickRemove={onClickRemove}
                            mappings={mappings}
                            extras={getExtraMappings({ selectedTags, typeTech, extraSelectedTags })}
                            renderTags={props => {
                              const isPrimary = props.type === 'primary'

                              return (
                                <TagMappingGrid
                                  {...props}
                                  renderTag={item => (
                                    <Box>
                                      {props.type === ETaxonomyKeys.AUXILIARY &&
                                        hasHistory(item.tag, isPrimary) && (
                                          <ButtonText
                                            sx={{ float: 'right', border: 'none', mb: 8 }}
                                            label={strings.common.viewHistory}
                                            onPress={() => {
                                              if (item.tag.companyDimensionId) {
                                                setViewHistoryInput({
                                                  category: typeTech,
                                                  isPrimary,
                                                  companyId: +companyId,
                                                  ids: [+item.tag.companyDimensionId],
                                                })
                                              }
                                            }}
                                          />
                                        )}
                                      <TagMappingItem {...item} sx={{ mt: 0, clear: 'both' }} />
                                    </Box>
                                  )}
                                />
                              )
                            }}
                          />
                        )
                      }
                      return null
                    })}

                    {(!!selectedMapsCount.primary || !!selectedMapsCount.aux) && (
                      <ButtonText
                        onPress={onClearAllSelectedTags}
                        label={strings.common.clearAllButton}
                        sx={{ mt: 4 }}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              isLoading && selectedMap !== EnumCompanyTypeSector.OUT && <Updating loading />
            )}
          </>
        )}
        {selectedMap && showTagSection && !isFetching && (
          <>
            {(tagsBcgFixed?.getTagGroups || []).map((item: TagData) => {
              return (
                <Box sx={{ mt: 6 }} key={item.id}>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Label sx={{ width: 'fit-content' }}>{item.label}</Label>
                    {!!state.fintechTypeCRsCount && (
                      <ButtonText
                        onPress={() => {
                          setTagPendingRequestType && setTagPendingRequestType(TagTypes.FINTECHTYPE)
                        }}
                        label={
                          strings.common.viewPendingChangeRequest +
                          ` (${state.fintechTypeCRsCount})`
                        }
                        sx={{ borderBottom: 0, color: Palette.orange, whiteSpace: 'nowrap' }}
                      />
                    )}
                  </Flex>
                  <Flex sx={{ alignItems: 'flex-end' }}>
                    {(item?.children || []).map((tag: Tag, index: number) => {
                      const tagOverride =
                        fintechTypeOverrides?.find(t => t.id === tag.id) || ({} as TagData)
                      const isAppendCQ =
                        +(tagOverride.fctStatusId || 0) === +EnumExpandStatusId.CHANGE_REQUEST

                      const oldValue = tagOverride.fctStatusId
                      const SOURCE_NA = 'NA'

                      const identity: HasHistoryField = {
                        columnName: ColumnNames.FCT_STATUS_ID,
                        tableName: TableNames.COMPANIES_TAGS,
                        rowId: tagOverride.rowId,
                        source: SOURCE_NA as string,
                      }

                      const { total: numPending } = findCQ<HasPendingCQField>(
                        overviewPendingRequest,
                        identity
                      ) || {
                        total: 0,
                      }

                      const hasPendingRequest = !isAppendCQ && numPending > 0
                      const hasHistory =
                        !isAppendCQ &&
                        showViewHistory(
                          identity.tableName,
                          identity.columnName,
                          identity.rowId,
                          identity.source
                        )
                      return (
                        <Flex key={tag.id} sx={{ ml: index > 0 ? 6 : 0 }}>
                          <ReasonPopover
                            zIndex={popoverZIndex}
                            positions={['top', 'bottom']}
                            buttons={[]}
                            oldValue={oldValue}
                            newValue={''}
                            setReason={() => {}}
                            label={hasHistory || hasPendingRequest ? ' ' : undefined}
                            viewHistory={
                              isAppendCQ
                                ? undefined
                                : viewTagsHistoryFn(tagOverride, ColumnNames.FCT_STATUS_ID)
                            }
                            viewPendingChangeRequest={undefined}
                            totalItemPendingCR={numPending}
                            disablePopover={true}
                          >
                            <Checkbox
                              label={tag.label}
                              checked={fintechType?.includes(tag.id)}
                              onPress={() => {
                                const value = tag.id
                                const tagIndex = (fintechType || []).indexOf(value)
                                let newFintechType = [...(fintechType || [])]

                                if (tagIndex !== -1) {
                                  newFintechType.splice(tagIndex, 1)
                                } else {
                                  newFintechType = [...newFintechType, value]
                                }

                                setState({ ...state, fintechType: newFintechType })
                              }}
                            />
                          </ReasonPopover>
                        </Flex>
                      )
                    })}
                  </Flex>
                </Box>
              )
            })}
            <TagGroup
              tagGroupSelected={tagGroupSelected}
              tagGroupChildrenSelected={tagGroupChildrenSelected}
              tagGroups={allTagGroups}
              onTagGroupSelect={onTagGroupSelect}
              onTagGroupChildSelect={onTagGroupChildSelect}
              sx={{ mt: 6 }}
            />

            {
              <>
                {(tagGroupChildrenSelected?.length > 0 || !!state.tagCRsCount) && (
                  <TagMapping
                    onClickRemove={onClickRemove}
                    viewTagsPendingCQFn={viewTagsPendingCQFn}
                    viewTagsHistoryFn={viewTagsHistoryFn}
                    sx={{ mt: 6, mb: 4 }}
                    typeTech={selectedMap}
                    title={copy.tagMapping.tagMaps}
                    mappings={{
                      group: { data: tagGroupChildrenSelected },
                    }}
                    showViewHistory={showViewHistory}
                    numberOfCRs={state.tagCRsCount || 0}
                    setTagPendingRequestType={setTagPendingRequestType}
                  />
                )}
                {tagGroupChildrenSelected?.length > 0 && (
                  <ButtonText
                    label={copy.tagMapping.clearAllRows}
                    sx={{ ml: 3, color: 'primary' }}
                    onPress={onClickClearAll}
                  />
                )}
              </>
            }
          </>
        )}

        {auxMustGoWithPrimaryError && (
          <Message body={copy.error.requiredPrimaryMapping} variant="alert" sx={{ mt: 6 }} />
        )}
      </Section>
      {!isAddTaxonomy && (
        <FooterCTAs
          buttons={[
            {
              label: copy.buttons.cancel,
              variant: 'outlineWhite',
              onClick: hasDataChange().hasChange
                ? () => setExitModalVisible(true)
                : onExitModalConfirm,
              disabled: isFetching || mapTaxonomyLoading,
            },
            {
              label: isAddTaxonomy ? copy.buttons.submit : copy.buttons.save,
              onClick: onSubmit,
              disabled:
                isFetching ||
                mapTaxonomyLoading ||
                (!hasDataChange().hasChange && !(isAddTaxonomy || isAddTaxonomyExternal)),
            },
          ]}
        />
      )}

      <ViewHistoryModals
        viewHistoryInput={viewHistoryInput}
        setViewHistoryInput={setViewHistoryInput}
        viewChangeRequests={viewChangeRequests}
        setViewChangeRequests={setViewChangeRequests}
        afterMutationCb={handleAfterApproveRejectRequest}
      />

      {successModalVisible && (
        <Modal
          maxWidth={600}
          buttons={[
            {
              label: 'View company record',
              type: 'outline',
              action: () => {
                history.push(Routes.COMPANY.replace(':id', companyId))
              },
            },
            {
              label: `Go back to ${page.title}`,
              type: 'primary',
              action: () => {
                history.push(page.link || Routes.SEARCH)
              },
            },
          ]}
        >
          <Heading center as="h4">
            {'Success'}
          </Heading>
          <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
            {'Company has been added to the database'}
          </Paragraph>
        </Modal>
      )}
      {confirmModalVisible && (
        <Modal
          buttons={[
            {
              label: copy.modals.confirm.buttons.no,
              type: 'outline',
              action: () => {
                setConfirmModalVisible(false)
              },
            },
            {
              label: copy.modals.confirm.buttons.yes,
              type: 'primary',
              action: async () => {
                try {
                  setSuccessModalVisible(true)
                } catch (e) {
                  setError(e && (e as any).message)
                } finally {
                  setConfirmModalVisible(false)
                }
              },
            },
          ]}
        >
          <Heading center as="h4">
            {copy.modals.confirm.title}
          </Heading>
        </Modal>
      )}
      {reasonModal.open && (
        <ReasonModal
          hasDataChange={hasDataChange}
          companyId={+companyId}
          reasonModal={reasonModal}
          setReasonModal={setReasonModal}
          required={!isOverrideUser}
          handleOk={async () => {
            setReasonModal(prev => ({ ...prev, open: false }))
            await handleSave()
          }}
          handleCancel={() => setReasonModal({ ...DEFAULT_REASON })}
        />
      )}

      {exitModalVisible && (
        <Modal
          buttons={[
            {
              label: copy.modals.leave.buttons.no,
              type: 'outline',
              action: () => setExitModalVisible(false),
            },
            {
              label: copy.modals.leave.buttons.yes,
              type: 'primary',
              action: onExitModalConfirm,
            },
          ]}
        >
          <Heading center as="h4">
            {copy.modals.leave.title}
          </Heading>
        </Modal>
      )}

      {!!tagPendingRequestType && (
        <TagChangeRequestView
          getCRs={getTagCRs}
          isFetching={isFetchingTagCRs}
          setTagCRs={setTagCRs}
          tagCRs={tagCRs}
          type={tagPendingRequestType}
          isSaving={isSaving}
          setTagPendingRequestType={setTagPendingRequestType}
          resolveTagCRs={resolveTagCRs}
        ></TagChangeRequestView>
      )}
    </>
  )
}

export default Taxonomy

const ReasonModal = ({
  reasonModal,
  setReasonModal,
  required,
  companyId,
  handleOk,
  handleCancel,
  hasDataChange,
}: {
  reasonModal: TReasonModal
  setReasonModal: React.Dispatch<React.SetStateAction<TReasonModal>>
  required: boolean
  companyId: number
  handleOk(): Promise<void> | void
  handleCancel(): Promise<void> | void
  hasDataChange(): TaxonomyChange
}) => {
  const { user } = useContext(UserContext)
  const isOverrideUser = isOverrideUserFn(user)

  const { data, loading } = useQuery<
    GetActiveTaxonomyOverridesResult,
    QueryGetActiveTaxonomyOverridesArgs
  >(GET_ACTIVE_TAXONOMY_OVERRIDES, {
    variables: { companyId: +companyId, users: isOverrideUser ? [] : [user.email] },
    fetchPolicy: 'network-only',
    skip: !+companyId,
  })

  const changeRequestCount = data?.getActiveTaxonomyOverrides?.changeRequestsCount || 0

  const buttons: Array<ButtonType> = [
    {
      label: strings.common.cancel,
      type: EnumVariantKeys.secondary,
      action: handleCancel,
    },
    {
      label: strings.common.ok,
      type: EnumVariantKeys.primary,
      disabled: !reasonModal.message && !isOverrideUser,
      action: handleOk,
    },
  ]

  return (
    <Modal
      sx={{ p: 20, width: 500 }}
      buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
      buttons={loading ? [] : buttons}
    >
      {loading ? (
        <Updating text="Please wait" sx={{ p: 40 }} />
      ) : (
        <>
          <Heading center as="h4" sx={{ mb: 30 }}>
            Confirmation
          </Heading>

          <ReasonTextField
            sx={{ width: '100%', mt: 0 }}
            reason={reasonModal.message}
            setReason={message => setReasonModal(prev => ({ ...prev, message }))}
            required={required}
          />
          {changeRequestCount > 0 && !isOverrideUser && hasDataChange().hasChangeTags && (
            <Box sx={{ textAlign: 'left', width: '100%', mt: 16, fontStyle: 'italic' }}>
              <Paragraph sx={{ lineHeight: '22px' }}>
                You have already created change request for this company. This change request will
                replace previous change request.
              </Paragraph>
            </Box>
          )}
        </>
      )}
    </Modal>
  )
}

interface ViewHistoryModalsProps {
  viewHistoryInput: TViewHistory
  setViewHistoryInput: React.Dispatch<React.SetStateAction<TViewHistory>>
  viewChangeRequests: TViewChangeRequests
  setViewChangeRequests: React.Dispatch<React.SetStateAction<TViewChangeRequests>>
  afterMutationCb(isApprove?: boolean): void | Promise<void>
}

const ViewHistoryModals = ({
  viewHistoryInput,
  setViewHistoryInput,
  viewChangeRequests,
  setViewChangeRequests,
  afterMutationCb,
}: ViewHistoryModalsProps) => {
  return (
    <>
      {viewHistoryInput && (
        <Modal
          sx={{ p: 20 }}
          maxWidth="unset"
          buttons={[
            {
              label: strings.common.ok,
              type: 'primary',
              sx: { p: '10px 60px' },
              action: () => setViewHistoryInput(undefined),
            },
          ]}
          buttonsStyle={{
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <Heading sx={{ fontWeight: 600, mb: 4, width: '100%' }} as="h4">
            Edit history
          </Heading>
          <ModalContent>
            <CompanyDimensionsHistoryContainer {...viewHistoryInput} />
          </ModalContent>
        </Modal>
      )}
      {viewChangeRequests && (
        <Modal
          sx={{ p: 20, pr: 10, minWidth: '80vw' }}
          maxWidth="unset"
          buttons={[
            {
              label: strings.common.ok,
              type: 'primary',
              sx: { p: '10px 60px' },
              action: () => setViewChangeRequests(undefined),
            },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Heading sx={{ fontWeight: 600, mb: 4, width: '100%' }} as="h4">
            Change requests
          </Heading>
          <ModalContent sx={{ width: '100%', overflow: 'auto', maxHeight: '60vh', pr: 10 }}>
            <ListTaxonomyChangeRequestsContainer
              {...viewChangeRequests}
              afterMutationCb={afterMutationCb}
              sortBy={{ field: ESortFields.DATE, direction: SortDirection.DESC }}
              alwayShowBtns={true}
              disableRedirect={true}
            />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
