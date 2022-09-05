import React, { RefAttributes, useCallback, useEffect, useRef, useState } from 'react'
import {
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from '@apollo/client'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import {
  Button,
  CompanyLogo,
  CompanyLogoForm,
  FooterCTAs,
  Icon,
  Message,
  Modal,
  TabMenu,
  Updating,
  ViewOverrideButtons,
} from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import strings from '../../strings'
import Form, { formFields } from './Form'
import clearLocalState, {
  $attachment,
  checkLength,
  localstorage,
  LocalstorageFields,
} from '../../utils'
import BusinessForm from './BusinessForm'
import PeopleForm from './People'
import {
  checkValidTaxonomy,
  defaultFinancial,
  defaultLocations,
  FieldNameKeys,
  FieldNames,
  FormFieldsState,
  getAddCompanyFinancialsInput,
  getFieldVariants,
  getTaxonomyMapInput,
  LocationFields,
  locationMapFn,
  validateInvestor,
  TableNames,
  invalidAttachments,
  scrollToElement,
  companyAttachmentsMapFn,
  validAttachmentType,
  isEmptyTaxonomy,
  OverridesCompanyDataInput,
  ColumnNames,
  SourceIndependentTables,
  Value2LabelPipe,
  invalidUpdateData,
  getNumPending,
  putFileToS3,
  transformPostDate,
  transformViewDate,
} from './helpers'
import Taxonomy from './Taxonomy'
import {
  ApiSourceType,
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumReverseApiSource,
  Routes,
} from '../../types/enums'
import {
  createCompanyManual,
  getSignUrl,
  addAttachmentsMutation,
  GET_OVERRIDES_BY_COMPANY_ID,
  GET_COMPANY_LOCATIONS,
  GET_COMPANY_ALIASES,
  APPEND_COMPANY_LOCATIONS,
  GET_COMPANY_OVERRIDES_HISTORY,
  OVERRIDE_COMPANY_DATA,
  GET_SIGN_URL_FOR_COMPANY_LOGO,
  GetSignedUrlForLogoInput,
} from './graphql'
import Financials, { fields as fundingFields } from './Financials'
import Investments from './Investments'
import { getInternalCompany } from '../Company/graphql'
import { CompanySource } from '../../components/CompanySource'
import Acquisitions from './Acquisitions'
import { CompanyDetails } from '../../components/SearchResults/SearchResults'
import {
  Alias,
  Attachment,
  FileState,
  GetCompanyOverrideInput,
  OverridesData,
  TaxonomyState,
} from '../../types'
import { GET_COMPANY_ATTACHMENTS } from './graphql/addAttachments'
import { Palette } from '../../theme'
import { Box, Flex } from 'theme-ui'
import LocationForm from '../../components/LocationForm'
import { LocationFormProps } from '../../components/LocationForm/LocationForm'
import { OverridesHistory } from '../../components/OverridesHistory'
import { FundingForm } from '../../components/FundingRound'
import Ipos from './IposForm'
import SupportAutomationTestingWrapper from '../../components/SupportAutomationTestingWrapper/SupportAutomationTestingWrapper'
import { onError } from '../../sentry'
import News from './NewsForm'
import CompanyContext from './provider/CompanyContext'
import { ETLRunTimeContext, UserContext } from '../../context'
import { IPengdingCQData } from '../../components/PendingChangeRequest/PendingChangeRequest'
import { cloneDeep } from 'lodash'
import useChangeRequest from '../../hooks/useChangeRequest'
import { expandStatus } from './mock'
import { ATTACHMENT_TYPE } from '../../utils/consts'
import { isOverrideUserFn } from '../../context/UserContext'
import { $logoUrl } from '../../utils/reactiveVariables'
import { getLogoPublicUrl, getValueDate } from '../../utils/helper'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import UseCaseFormPage from './UseCaseFormPage'
import TechnologyTotalForm from './TechnologyTotalPageForm'
import Fundraising from './Fundraising'
import Acquirees from './Acquirees'
import Partnerships from './PartnershipsForm'

type SharedLocationFormPropsKeys =
  | 'reason'
  | 'setReason'
  | 'isAddPage'
  | 'handleUpdateField'
  | 'showViewHistory'
  | 'setHistoryModal'
  | 'showPendingChangeRequest'
  | 'companyId'

export type OldData = {
  overview: FormFieldsState
  locations: LocationFields[]
  attachments: Attachment[]
  aliases: Alias[]
}

export type ViewHistoryProps = {
  showViewHistory(tableName: string, columnName: string, rowId: string, source?: string): boolean
  refetchViewHistoryCols?(): Promise<any>
}

export type ViewPendingChangeRequest = {
  showPendingChangeRequest(tableName: string, name: string, rowId: string, source?: string): boolean
  refetchViewPendingChangeRequestCols?(): void
  overviewPendingRequest: Array<HasPendingCQField>
}

export type RoundProps = {
  handleClickShowPendingCR(request: GetCompanyOverrideInput): void
  overviewPendingRequest: HasPendingCQField[] | undefined
  isOverride: boolean
}

export type HasHistoryField = {
  columnName: string
  tableName: string
  rowId: string
  source: string
}

export type HasPendingCQField = HasHistoryField & {
  total: number
  users: string[]
  dataOverrideId: number
  companyId: string
}

let companyInfo = {
  defaultSource: '',
  companyName: '',
  allSources: [''],
  logo: '',
}

export type LogoState = FileState & {
  src: string | ArrayBuffer
  hash: string
  width: number
  height: number
}

const CompanyFormPage = () => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const isOverridesUser = isOverrideUserFn(user)

  // check routes
  const isAddOverview = useRouteMatch(Routes.ADD_COMPANY_OVERVIEW)?.isExact
  const isEditOverview = useRouteMatch(Routes.EDIT_COMPANY_OVERVIEW)?.isExact
  const isOverview = isAddOverview || isEditOverview

  const isAddFinancials = useRouteMatch(Routes.ADD_COMPANY_FINANCIALS)?.isExact
  const matchEditFinancials = useRouteMatch(Routes.EDIT_COMPANY_FINANCIALS)?.isExact
  const matchCRFinancials = useRouteMatch(Routes.EDIT_COMPANY_FINANCIALS_CR)?.isExact
  const isEditFinancials = matchEditFinancials || matchCRFinancials
  const isFinancials = isAddFinancials || isEditFinancials

  const isInvestments = useRouteMatch(Routes.EDIT_COMPANY_INVESTMENTS)?.isExact
  const isEditInvestments = isInvestments
  const isEditAcquirees = useRouteMatch(Routes.EDIT_COMPANY_ACQUIREES)?.isExact

  const matchEditFundraising = useRouteMatch(Routes.EDIT_COMPANY_FUNDRAISING)?.isExact
  const matchCRFundraising = useRouteMatch(Routes.EDIT_COMPANY_FUNDRAISING_CR)?.isExact
  const isEditFundraising = matchEditFundraising || matchCRFundraising

  const isAddTaxonomy = useRouteMatch(Routes.ADD_COMPANY_TAXONOMY)?.isExact
  const isEditTaxonomy = useRouteMatch(Routes.EDIT_COMPANY_TAXONOMY)?.isExact
  const isAddTaxonomyExternal = useRouteMatch(Routes.ADD_COMPANY_TAXONOMY_EXTERNAL)?.isExact
  const isMatchCRTaxonomy = useRouteMatch(Routes.EDIT_COMPANY_TAXONOMY_CR)?.isExact
  const isTaxonomy = isAddTaxonomy || isEditTaxonomy || isAddTaxonomyExternal || isMatchCRTaxonomy

  const matchBusiness = useRouteMatch(Routes.EDIT_COMPANY_BUSINESS)?.isExact
  const matchBusinessCR = useRouteMatch(Routes.EDIT_COMPANY_BUSINESS_CR)?.isExact
  const isEditBusiness = matchBusiness || matchBusinessCR

  const matchEditPeople = useRouteMatch(Routes.EDIT_COMPANY_PEOPLE)?.isExact
  const matchCRPeople = useRouteMatch(Routes.EDIT_COMPANY_PEOPLE_CR)?.isExact
  const isEditPeople = matchEditPeople || matchCRPeople

  const matchEditAcquisitions = useRouteMatch(Routes.EDIT_COMPANY_ACQUISITIONS)?.isExact
  const matchCRAcquisitions = useRouteMatch(Routes.EDIT_COMPANY_ACQUISITIONS_CR)?.isExact
  const isEditAcquisitions = matchEditAcquisitions || matchCRAcquisitions

  const matchEditIpos = useRouteMatch(Routes.EDIT_COMPANY_IPOS)?.isExact
  const matchCRIpos = useRouteMatch(Routes.EDIT_COMPANY_IPOS_CR)?.isExact
  const isEditIpos = matchEditIpos || matchCRIpos

  const matchEditNews = useRouteMatch(Routes.EDIT_COMPANY_NEWS)?.isExact
  const matchCRNews = useRouteMatch(Routes.EDIT_COMPANY_NEWS_CR)?.isExact
  const isEditNews = matchEditNews || matchCRNews

  const matchEditUseCase = useRouteMatch(Routes.EDIT_COMPANY_USE_CASE)?.isExact
  const matchCRUseCase = useRouteMatch(Routes.EDIT_COMPANY_USE_CASE_CR)?.isExact
  const isEditUseCase = matchEditUseCase || matchCRUseCase

  const matchEditTechnology = useRouteMatch(Routes.EDIT_COMPANY_TECHNOLOGY)?.isExact
  const matchCRTechnology = useRouteMatch(Routes.EDIT_COMPANY_TECHNOLOGY_CR)?.isExact
  const isEditTechnology = matchEditTechnology || matchCRTechnology

  const matchEditPartnerships = useRouteMatch(Routes.EDIT_COMPANY_PARTNERSHIPS)?.isExact
  const matchCRPartnerships = useRouteMatch(Routes.EDIT_COMPANY_PARTNERSHIPS_CR)?.isExact
  const isEditPartnerships = matchEditPartnerships || matchCRPartnerships

  const isEdit = !!(
    isEditOverview ||
    isEditTaxonomy ||
    isEditFinancials ||
    isEditBusiness ||
    isEditPeople ||
    isEditAcquisitions ||
    isEditIpos ||
    isEditNews ||
    isMatchCRTaxonomy ||
    isEditUseCase ||
    isEditTechnology ||
    isEditInvestments ||
    isEditAcquirees ||
    isEditPartnerships
  )

  const isAdd = !!(isAddOverview || isAddFinancials || isAddTaxonomy)
  const localCompanyForm = localstorage.get(LocalstorageFields.COMPANY_FORM)
  const localLocation = isAdd ? localstorage.get(LocalstorageFields.COMPANY_LOCATION) : undefined
  const localHeadquaterLocation = localLocation
    ? JSON.parse(localLocation)?.filter(
        ({ is_headquarters, id }: LocationFields) => is_headquarters === 1 && !id
      )
    : []
  const localOtherLocation = localLocation
    ? JSON.parse(localLocation)?.filter(
        ({ is_headquarters }: LocationFields) => is_headquarters === 0
      )
    : []
  const localAlias = localstorage.get(LocalstorageFields.COMPANY_ALIAS)
  const localAttachment = useReactiveVar($attachment)
  const localLogoUrl = useReactiveVar($logoUrl)
  const localCompanyFinancials = localstorage.get(LocalstorageFields.COMPANY_FINANCIALS)

  const { id: companyId } = useParams<any>()

  // Modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [historyModal, setHistoryModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })
  const [logoModal, setLogoModal] = useState(false)

  const setError = (err: string) => {
    setMessage({ title: 'Error', content: err || '' })
  }

  const [newCompanyId, setNewCompanyId] = useState('')
  const [fetchDataError, setFetchDataError] = useState('')

  const [formState, setFormState] = useState<FormFieldsState>(
    localCompanyForm ? JSON.parse(localCompanyForm) : undefined
  )
  const [reason, setReason] = useState<string>('')
  const [formErrors, setFormErrors] = useState<FieldNameKeys[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [logoUpdating, setLogoUpdating] = useState(false)

  const [locationState, _setLocationState] = useState<LocationFields[]>(
    !localHeadquaterLocation.length ? (isAdd ? [defaultLocations] : []) : localHeadquaterLocation
  )
  const [otherLocationsState, _setOtherLocationsState] = useState<LocationFields[]>(
    isEdit
      ? []
      : !localOtherLocation.length
      ? [{ ...defaultLocations, is_headquarters: 0 }]
      : localOtherLocation
  )

  const setLocationState = useCallback(
    (state: LocationFields[]) => {
      _setLocationState(state)
      if (isAdd) {
        const local = [...state, ...(otherLocationsState || [])]
        localstorage.set(LocalstorageFields.COMPANY_LOCATION, JSON.stringify(local))
      }
    },
    [otherLocationsState, isAdd]
  )

  const setOtherLocationsState = (state: LocationFields[]) => {
    _setOtherLocationsState(state)
    if (isAdd) {
      const local = [...(locationState || []), ...state]
      localstorage.set(LocalstorageFields.COMPANY_LOCATION, JSON.stringify(local))
    }
  }

  const [appendLocation, setAppendLocation] = useState<LocationFields>(defaultLocations)
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [isAppending, setIsAppending] = useState(false)
  const [otherLocationsEdit, setOtherLocationsEdit] = useState<LocationFields[]>([])

  const [aliasState, _setAliasState] = useState<string[]>(
    isAdd ? (localAlias ? JSON.parse(localAlias) : ['']) : []
  )
  const [aliasEditState, setAliasEditState] = useState<Alias[]>([])
  const [editFileState, setEditFileState] = useState<Attachment[]>([])

  const setAliasState = useCallback(
    (state: string[]) => {
      _setAliasState(state)
      if (isAdd) {
        localstorage.set(LocalstorageFields.COMPANY_ALIAS, JSON.stringify(state))
      }
    },
    [isAdd]
  )

  const [fileState, _setFileState] = useState<FileState[]>(
    isAdd ? (localAttachment ? localAttachment : []) : []
  )

  const [invalidLogo, setInvalidLogo] = useState(false)

  const setFileState = useCallback(
    (state: FileState[]) => {
      _setFileState(state)
      if (isAdd) {
        $attachment(state)
      }
    },
    [isAdd]
  )

  const [logoState, _setLogoState] = useState<LogoState | undefined>(
    isAdd ? localLogoUrl : undefined
  )
  const setLogoState = useCallback(
    (state: LogoState | undefined) => {
      _setLogoState(state)
      if (isAdd) {
        $logoUrl(state)
      }
    },
    [isAdd]
  )

  const [financialState, _setFinancialState] = useState<FundingForm[]>(
    localCompanyFinancials ? JSON.parse(localCompanyFinancials) : [defaultFinancial]
  )
  const setFinancialState = (state: FundingForm[]) => {
    _setFinancialState(state)
    if (isAdd) {
      localstorage.set(LocalstorageFields.COMPANY_FINANCIALS, JSON.stringify(state))
    }
  }

  const [oldData, setOldData] = useState<OldData>({
    overview: {} as FormFieldsState,
    locations: [],
    attachments: [],
    aliases: [],
  })

  const localCompanyTaxonomy: TaxonomyState = JSON.parse(
    localstorage.get(LocalstorageFields.COMPANY_TAXONOMY) || '{}'
  )

  const [taxonomyState, setTaxonomyState] = useState<TaxonomyState>(
    Object.values(localCompanyTaxonomy).length > 0
      ? { ...localCompanyTaxonomy }
      : {
          tabActive: 'primary',
          tagGroupChildrenSelected: [],
        }
  )

  const { defaultSource, companyName, allSources } = companyInfo
  const companySource = EnumReverseApiSource.MANUAL

  const history = useHistory()

  const locationRef = useRef<any>()

  const buttons = isAddTaxonomyExternal
    ? []
    : isAdd
    ? [
        {
          label: copy.tabMenu.overview,
          to: Routes.ADD_COMPANY_OVERVIEW,
          active: isOverview,
        },
        {
          label: copy.tabMenu.taxonomy,
          to: Routes.ADD_COMPANY_TAXONOMY,
          active: isTaxonomy,
        },
        {
          label: copy.tabMenu.financials,
          to: Routes.ADD_COMPANY_FINANCIALS,
          active: isFinancials,
        },
      ]
    : [
        {
          label: copy.tabMenu.taxonomy,
          to: companyId ? Routes.EDIT_COMPANY_TAXONOMY.replace(':id', companyId) : Routes.SEARCH,
          active: isTaxonomy,
        },
        {
          label: copy.tabMenu.overview,
          to: companyId ? Routes.EDIT_COMPANY_OVERVIEW.replace(':id', companyId) : Routes.SEARCH,
          active: isOverview,
        },
        {
          label: copy.tabMenu.financials,
          to: companyId ? Routes.EDIT_COMPANY_FINANCIALS.replace(':id', companyId) : Routes.SEARCH,
          active: isFinancials,
        },
        {
          label: copy.tabMenu.investments,
          to: companyId ? Routes.EDIT_COMPANY_INVESTMENTS.replace(':id', companyId) : Routes.SEARCH,
          active: isInvestments,
        },
        {
          label: copy.tabMenu.acquisitions,
          to: companyId
            ? Routes.EDIT_COMPANY_ACQUISITIONS.replace(':id', companyId)
            : Routes.SEARCH,
          active: isEditAcquisitions,
        },
        {
          label: copy.tabMenu.acquirees,
          to: companyId ? Routes.EDIT_COMPANY_ACQUIREES.replace(':id', companyId) : Routes.SEARCH,
          active: isEditAcquirees,
        },
        {
          label: copy.tabMenu.ipos,
          to: companyId ? Routes.EDIT_COMPANY_IPOS.replace(':id', companyId) : Routes.SEARCH,
          active: isEditIpos,
        },
        {
          label: copy.tabMenu.business,
          to: companyId ? Routes.EDIT_COMPANY_BUSINESS.replace(':id', companyId) : Routes.SEARCH,
          active: isEditBusiness,
        },
        {
          label: copy.tabMenu.useCase,
          to: companyId ? Routes.EDIT_COMPANY_USE_CASE.replace(':id', companyId) : Routes.SEARCH,
          active: isEditUseCase,
        },
        {
          label: copy.tabMenu.fundraising,
          to: companyId ? Routes.EDIT_COMPANY_FUNDRAISING.replace(':id', companyId) : Routes.SEARCH,
          active: isEditFundraising,
        },
        {
          label: copy.tabMenu.technology,
          to: companyId ? Routes.EDIT_COMPANY_TECHNOLOGY.replace(':id', companyId) : Routes.SEARCH,
          active: isEditTechnology,
        },
        {
          label: copy.tabMenu.people,
          to: companyId ? Routes.EDIT_COMPANY_PEOPLE.replace(':id', companyId) : Routes.SEARCH,
          active: isEditPeople,
        },
        {
          label: copy.tabMenu.news,
          to: companyId ? Routes.EDIT_COMPANY_NEWS.replace(':id', companyId) : Routes.SEARCH,
          active: isEditNews,
        },
        {
          label: copy.tabMenu.partnerships,
          to: companyId
            ? Routes.EDIT_COMPANY_PARTNERSHIPS.replace(':id', companyId)
            : Routes.SEARCH,
          active: isEditPartnerships,
        },
      ]

  // GRAPHQL
  const [override] = useMutation<
    any,
    { input: OverridesCompanyDataInput[]; isAppendData?: boolean }
  >(OVERRIDE_COMPANY_DATA)

  const [doAppendLocations] = useMutation(APPEND_COMPANY_LOCATIONS)

  const [getHistory, { loading: getHistoryLoading, data: getHistoryData }] = useLazyQuery<
    any,
    { input: GetCompanyOverrideInput }
  >(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const historyData = getHistoryData?.getCompanyOverrideHistory?.map((item: OverridesData) => ({
    ...item,
    oldValue:
      item.tableName === TableNames?.COMPANIES_ATTACHMENTS && item.columnName === 'name'
        ? (item.oldValue || '').lastIndexOf('.') > -1
          ? item.oldValue?.slice(0, item.oldValue?.lastIndexOf('.'))
          : item.oldValue
        : item.oldValue,
    newValue:
      item.tableName === TableNames?.COMPANIES_ATTACHMENTS && item.columnName === 'name'
        ? (item.newValue || '').lastIndexOf('.') > -1
          ? item.newValue?.slice(0, item.newValue?.lastIndexOf('.'))
          : item.newValue
        : item.newValue,
  }))

  const [createCompany, { loading: createCompanyManualLoading }] = useMutation(createCompanyManual)
  const [addAttachments, { loading: addAttachmentsLoading }] = useMutation(addAttachmentsMutation)
  const { data, refetch: refetchViewHistoryCols } = useQuery<any, { companyId: number }>(
    GET_OVERRIDES_BY_COMPANY_ID,
    {
      variables: { companyId: +companyId },
      skip: !companyId,
    }
  )
  const [getCompanyLocations, { loading: fetchingLocations }] = useLazyQuery(
    GET_COMPANY_LOCATIONS,
    {
      variables: { companyId: +companyId },
      fetchPolicy: 'network-only',
      onCompleted(data) {
        const locations: LocationFields[] = data?.getCompanyLocations.map(locationMapFn) || []
        setLocationState(locations.filter(({ is_headquarters, source }) => is_headquarters))
        setOtherLocationsEdit(locations.filter(({ is_headquarters }) => !is_headquarters))
        setOldData({ ...oldData, locations })
        refetchViewHistoryCols()
        refetchViewPendingChangeRequestCols()
      },
    }
  )

  const [getCompanyAliases, { loading: fetchingAliases }] = useLazyQuery(GET_COMPANY_ALIASES, {
    variables: { companyId: +companyId },
    fetchPolicy: 'network-only',
    onCompleted(data) {
      const newState = data?.getCompanyAliases || []
      setAliasEditState(newState)
      setOldData({ ...oldData, aliases: newState })
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
  })

  const [getCompanyAttachments, { loading: fetchingAttachments }] = useLazyQuery(
    GET_COMPANY_ATTACHMENTS,
    {
      variables: { companyId: +companyId },
      fetchPolicy: 'network-only',
      onCompleted(data) {
        const newState = data?.getCompanyAttachments || []
        setEditFileState(newState)
        setOldData({ ...oldData, attachments: newState })
        refetchViewHistoryCols()
        refetchViewPendingChangeRequestCols()
      },
    }
  )

  const client = useApolloClient()

  let hasHistoryField: any[] = []
  if (data && data.getCompanyOverridesByCompanyId) {
    hasHistoryField = data.getCompanyOverridesByCompanyId
  }

  // EFFECTS
  const fetchData = React.useCallback(async () => {
    if (!companyId || !isEdit) return

    setLoading(true)

    await client
      .query<{
        getInternalCompanyById: Pick<CompanyDetails, 'overview' | 'companyName' | 'source'>
      }>({
        query: getInternalCompany,
        variables: { id: +companyId },
        fetchPolicy: isEditOverview ? 'network-only' : 'cache-first',
      })
      .then(({ data }) => {
        const result = {
          overview: {} as FormFieldsState,
          locations: [],
          attachments: [] as Attachment[],
          aliases: [] as Alias[],
        } as OldData

        if (data && data.getInternalCompanyById) {
          const { overview, companyName } = data.getInternalCompanyById

          companyInfo = {
            defaultSource: overview.source,
            companyName: companyName || '',
            allSources: overview.sources,
            logo: overview.logo_bucket_url,
          }

          const newFormState = {
            name: data.getInternalCompanyById.companyName,
            website_url: overview.url,
            company_type: overview.companyType,
            founded_year: overview.foundedYear,
            status: overview.status || '',
            company_alias: '',
            closed_date: overview.closedDate ? transformViewDate(overview.closedDate) : '',
            logo_url: overview.logoUrl,
            twitter_url: overview.twitter_url,
            facebook_url: overview.facebook_url,
            linkedin_url: overview.linkedin_url,
            ftes_range: overview.ftes_range,
            ftes_exact: overview.ftes_exact,
            description: overview.description,
            fct_status_id: overview.expandStatusId,
            logo_bucket_url: overview.logo_bucket_url,
            hashed_image: overview.hashed_image,
          } as FormFieldsState

          if (overview.companyLocation && overview.companyLocation.length > 0) {
            result.locations = overview.companyLocation.map(locationMapFn)
          }

          result.overview = newFormState
          result.attachments = overview?.attachments || []
          result.aliases = overview?.aliases || []
        }

        // if (isEditOverview) {
        onChangeForm({
          ...result.overview,
          fct_status_id: result.overview.fct_status_id || EnumExpandStatusId.FOLLOWING,
        } as FormFieldsState)

        setLocationState((result.locations || []).filter(({ is_headquarters }) => is_headquarters))

        setOtherLocationsEdit(
          result.locations?.filter(({ is_headquarters }) => !is_headquarters) || []
        )
        setEditFileState(result.attachments)
        setAliasEditState(result.aliases)
        setOldData(result)
        // }
      })
      .catch(error => {
        setFetchDataError('Failed to fetch data !')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isEditOverview, client, companyId, isEdit, setLocationState])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAfterRejectCQ = (params: { tableName: string }, isAppendData: boolean = false) => {
    if (!isAppendData) return
    const { tableName } = params
    switch (tableName) {
      case TableNames.ALIAS: {
        getCompanyAliases()
        break
      }
      case TableNames.LOCATIONS: {
        getCompanyLocations()
        break
      }
      case TableNames.COMPANIES_ATTACHMENTS: {
        getCompanyAttachments()
        break
      }
      default:
        break
    }
  }

  const handleAfterApproveCQ = (input: { item: { tableName: string } }) => {
    switch (input?.item?.tableName) {
      case TableNames.LOCATIONS:
        getCompanyLocations()
        break

      default:
        break
    }
  }

  const handleApproveUpdateNewData = (
    params: Pick<IPengdingCQData, 'columnName' | 'newValue' | 'tableName' | 'rowId'>,
    isAppendData: boolean = false
  ) => {
    const { columnName, newValue, tableName, rowId } = params

    // Update Olda Data and Current State
    switch (tableName) {
      case TableNames.COMPANIES: {
        const value = columnName === FieldNames?.closed_date ? getValueDate(newValue) : newValue
        onChangeForm({ ...formState, [columnName]: value })
        setOldData({
          ...oldData,
          overview: {
            ...oldData.overview,
            [columnName]: value,
          },
        })
        if (columnName === FieldNames?.name && updateCompanyNameCache) {
          updateCompanyNameCache(value as string)
        } else if (columnName === ColumnNames.HASHED_IMAGE) {
          updateCompanyLogoCache(value as string)
        }

        break
      }
      case TableNames.ALIAS: {
        const realProp = columnName === ColumnNames.FCT_STATUS_ID ? 'expand_status_id' : columnName
        const editedDataAlias = oldData.aliases.map(s =>
          s.alias_id === rowId ? { ...s, [realProp]: newValue } : s
        )
        setOldData({ ...oldData, aliases: editedDataAlias })
        setAliasEditState(editedDataAlias)

        break
      }
      case TableNames.LOCATIONS: {
        let realProp = columnName
        let realPropValue = newValue

        if (columnName === ColumnNames.FCT_STATUS_ID) {
          realProp = 'expandStatus'
          realPropValue = Value2LabelPipe(expandStatus, newValue) as string
        }
        const updateFn = (item: LocationFields) => {
          return item.id === rowId ? { ...item, [realProp]: realPropValue } : item
        }
        const newHQLocationState = locationState.map(updateFn)
        const newOtherLocationState = otherLocationsEdit.map(updateFn)

        setLocationState(newHQLocationState)
        setOtherLocationsEdit(newOtherLocationState)
        setOldData({ ...oldData, locations: [...newHQLocationState, ...newOtherLocationState] })

        break
      }
      case TableNames.COMPANIES_ATTACHMENTS: {
        const editItem = editFileState.find(i => i.url_attachment === rowId)

        const newState = oldData.attachments.map(item => {
          const clone = cloneDeep(item)
          // With each type (except Other), only one attachment is Following
          if (item.url_attachment !== rowId) {
            if (
              (!isAppendData &&
                columnName === 'type' &&
                item.type === newValue &&
                newValue !== ATTACHMENT_TYPE.OTHER) ||
              (columnName === ColumnNames.FCT_STATUS_ID &&
                editItem?.type === item.type &&
                newValue === EnumExpandStatusId.FOLLOWING &&
                item.expandStatus === EnumExpandStatus.FOLLOWING &&
                item.type !== ATTACHMENT_TYPE.OTHER)
            ) {
              clone.expandStatus = EnumExpandStatus.UNFOLLOWED
            }
          }

          let realProp = columnName
          let realPropValue = newValue

          if (columnName === ColumnNames.FCT_STATUS_ID) {
            realProp = 'expandStatus'
            realPropValue = Value2LabelPipe(expandStatus, newValue) as string
          }
          return item.url_attachment === rowId ? { ...item, [realProp]: realPropValue } : clone
        })
        setEditFileState(newState)
        setOldData({
          ...oldData,
          attachments: newState,
        })
        break
      }
    }
  }

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    pendingCRData,
    getCRLoading,
    getPendingCR,
    showPendingChangeRequest,
    handleClickShowPendingCR,
    openPendingCRModel,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleApproveUpdateNewData,
    handleAfterReject: handleAfterRejectCQ,
    defaultSource,
    companyId: +(companyId || ''),
    handleAfterApprove: handleAfterApproveCQ,
  })

  const isFirstRun = useRef(true)
  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      refetchViewPendingChangeRequestCols()
      return
    }
  })

  // EVENTS
  const addOtherLocation = () => {
    setOtherLocationsState([...otherLocationsState, { ...defaultLocations, is_headquarters: 0 }])
  }
  const onAddLocation = (isHeadQuarter?: boolean) => {
    if (isAddOverview) addOtherLocation()
    else {
      setAppendLocation({ ...defaultLocations, is_headquarters: isHeadQuarter ? 1 : 0 })
      setLocationModalVisible(true)
    }
  }

  const onFinish = () => {
    clearLocalState()
  }

  const onCancel = () => {
    setModalVisible(true)
  }

  const onModalCancel = () => {
    setModalVisible(false)
  }

  const onModalConfirm = () => {
    history.push(companyId ? Routes.COMPANY.replace(':id', companyId) : Routes.SEARCH)
    localstorage.remove(LocalstorageFields.COMPANY_FORM)
    localstorage.remove(LocalstorageFields.COMPANY_ID)
    localstorage.remove(LocalstorageFields.COMPANY_TAXONOMY)
  }

  const getValue = (name: FieldNameKeys) => {
    return formState ? formState[name] || '' : ''
  }

  const getLocationError = (locations: LocationFields[]) => {
    return locations.reduce((acc, f) => {
      if (f.city && checkLength(f.city, 70)) {
        acc.push('location')
        locationRef.current.onSubmit()
      }
      return acc
    }, [] as FieldNameKeys[])
  }

  const checkValidOverview = (): boolean => {
    const newErrorFields = formFields.reduce((acc, f) => {
      if (
        (f.required && (!formState || !formState[f.name])) ||
        (f.maxlength && checkLength(getValue(f.name), f.maxlength, f.maxWord)) ||
        (f.format && f.formatError && f.format(getValue(f.name)) === f.formatError)
      ) {
        acc.push(f.name)
      }
      if (f.key === 'companyOtherNames') {
        for (let alias of aliasState) {
          if (checkLength(alias, f.maxlength)) {
            acc.push(f.name)
            break
          }
        }

        const arrAlias = [
          ...(aliasEditState || []).reduce(
            (acc, f) => {
              acc.push(f.company_alias)
              return acc
            },
            [...aliasState]
          ),
        ]
          .filter(alias => !!alias)
          .map(str => str.trim())
        let valuesAlreadySeen = []

        for (let alias of arrAlias) {
          let value = alias
          if (valuesAlreadySeen.indexOf(value) !== -1) {
            acc.push(f.name)
            break
          }
          valuesAlreadySeen.push(value)
        }
      }
      return acc
    }, [] as FieldNameKeys[])

    const newErrorLocations = getLocationError([
      ...locationState,
      ...otherLocationsEdit,
      ...otherLocationsState,
    ])

    const newError = [...newErrorFields, ...newErrorLocations]
    setFormErrors(newError)

    if (newError.length > 0) {
      scrollToElement(document.querySelector(`#${newError[0]}`))
      return false
    }

    if (fileState?.find(e => checkLength(e.name, 256) || checkLength(e.description, 4000)))
      return false

    return true
  }

  const getCompanyOverview = () => {
    const overviewData = Object.keys(formState!).reduce((acc, f) => {
      if (f === FieldNames.fct_status_id) return acc /* skip */

      if (formState && formState[f as FieldNameKeys] !== '') {
        acc[f as FieldNameKeys] = formState[f as FieldNameKeys]
      }
      return acc
    }, {} as FormFieldsState)

    const company = {
      ...overviewData,
      closed_date: overviewData.closed_date && transformPostDate(overviewData.closed_date),
      locations: [
        ...locationState.filter(l => l.country || l.city),
        ...otherLocationsState.filter(l => l.country || l.city),
      ],
      company_alias: aliasState.filter(e => e.length > 0),
      hashed_image: logoState?.hash || null,
    }

    return company
  }

  const onSubmitForms = async (acceptEmptyTaxonomy: boolean = false) => {
    if (!checkTimeETL()) return
    try {
      if (!checkValidOverview()) {
        if (!isAddOverview) {
          throw Error(`Invalid Overview information !`)
        }
        return
      }

      if (invalidAttachments(fileState)) {
        scrollToElement(document.getElementById('attachment'))
        if (fileState.some(f => !validAttachmentType(f, f.type))) {
          throw Error('Invalid Attachment type !')
        }
        throw Error('Invalid Attachment information !')
      }
      try {
        if (isEmptyTaxonomy(taxonomyState) && !acceptEmptyTaxonomy) {
          setConfirmModalVisible(true)
          return
        } else checkValidTaxonomy(taxonomyState, acceptEmptyTaxonomy)
      } catch (error) {
        setError(error?.message || '')
        return
      }

      const errorInvestor: number[] = validateInvestor(financialState)

      const financialError = financialState.some(state =>
        fundingFields().some(field => getFieldVariants(field, state.round[field.key]) === 'error')
      )

      if (financialError) {
        throw Error('Invalid Financials information !')
      }

      if (errorInvestor.length > 0) {
        throw Error(`Investors duplicated !`)
      }

      const company = getCompanyOverview()

      setSubmitting(true)
      const { companyId: removed, ...taxonomy } = getTaxonomyMapInput(taxonomyState, '', {
        bothAuxAndPrimCategories: true,
      })

      const attachment = fileState.map(file => companyAttachmentsMapFn(file))

      const companyId: string = await createCompany({
        variables: {
          input: {
            company,
            taxonomy,
            funding: getAddCompanyFinancialsInput(financialState, companySource),
            attachment,
          },
        },
      }).then(({ data }) => data.createCompanyManual.companyId)

      setNewCompanyId(companyId)

      // Upload file to s3 but no store in RDS Db
      await saveFile(companyId, true)
      if (logoState) await uploadLogo(logoState, +companyId)
      onFinish()
      setSuccessModal(true)
    } catch (error) {
      handleError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const onChangeForm = (event: FormFieldsState) => {
    setFormState({ ...event })
    localstorage.set(LocalstorageFields.COMPANY_FORM, JSON.stringify(event))
  }

  const onChangeLocation = (data: LocationFields, index: number) => {
    let cloneLocation = [...locationState]
    cloneLocation[index] = data
    setLocationState(cloneLocation)
  }

  const onChangeOtherLocation = (data: LocationFields, index: number) => {
    let cloneLocation = [...otherLocationsState]
    cloneLocation[index] = data
    setOtherLocationsState(cloneLocation)
  }

  const onChangeOtherLocationEdit = (data: LocationFields, index: number) => {
    let cloneLocation = [...otherLocationsEdit]
    cloneLocation[index] = data
    setOtherLocationsEdit(cloneLocation)
  }

  const onChangeFile = (files: FileState[]) => {
    setFileState(files)
  }

  const uploadFile = async (data: any[], companyId: string, s3UploadOnly = false): Promise<any> => {
    if (!checkTimeETL()) return
    let attachments: any[] = []
    await Promise.all(
      (fileState || []).map(async file => {
        const matchingFile = data.find((e: any) => e.fileId === file.fileId)
        if (matchingFile?.signedUrl) {
          await putFileToS3(matchingFile.signedUrl, file)

          const extension = file.file.name.slice(file.file.name?.lastIndexOf('.')) || ''
          attachments.push({
            company_id: +companyId,
            name: !!file.name.length
              ? file.name + extension
              : file.file.name.slice(0, file.file.name.lastIndexOf('.')),
            description: file.description,
            type: file.type,
            url_attachment: file.fileId,
            magicBytes: file.magicBytes,
            contentType: file.file.type,
          })
        }
      })
    )
    return s3UploadOnly
      ? Promise.resolve()
      : await addAttachments({
          variables: {
            input: attachments.map(a => ({ ...a, expandStatus: EnumExpandStatus.FOLLOWING })),
          },
        })
  }

  const saveFile = async (companyId: string, s3UploadOnly = false): Promise<any> => {
    if (!fileState?.length) return Promise.resolve()

    const fileDetails = fileState.map(({ fileId, magicBytes, type, file }) => ({
      fileId,
      magicBytes,
      type,
      contentType: file.type,
    }))

    const res = await client.query({
      query: getSignUrl,
      variables: {
        input: {
          companyIds: [+companyId],
          fileDetails,
          operation: 'putObject',
        },
      },
    })
    if (res.data?.getSignUrl?.length) {
      return await uploadFile(res.data.getSignUrl, companyId, s3UploadOnly)
    }
  }

  const uploadLogo = async (file: LogoState, companyId: number) => {
    const input: GetSignedUrlForLogoInput = {
      companyId,
      contentType: file.file.type,
      hashedImage: file.hash,
    }
    const res = await client.query<{ getSignedUrlForCompanyLogo: string }>({
      query: GET_SIGN_URL_FOR_COMPANY_LOGO,
      variables: { input },
    })

    const signUrl = res.data.getSignedUrlForCompanyLogo
    await putFileToS3(signUrl, file)
  }

  const getHeadingTitle = () => {
    if (isAddOverview || isEditOverview) return copy.titles.overview
    if (isAddTaxonomy || isEditTaxonomy || isMatchCRTaxonomy) return copy.titles.taxonomy
    if (isAddFinancials || isEditFinancials) return copy.titles.financials
    if (isEditFundraising) return copy.titles.fundraising
    if (isEditInvestments) return copy.titles.investments
    if (isEditAcquisitions) return copy.titles.acquisitions
    if (isEditAcquirees) return copy.titles.acquirees
    if (isEditIpos) return copy.titles.ipo
    if (isEditBusiness) return copy.titles.business
    if (isEditPeople) return copy.titles.people
    if (isEditNews) return copy.titles.news
    if (isEditUseCase) return copy.titles.useCase
    if (isEditTechnology) return copy.titles.technology
    if (isEditPartnerships) return copy.titles.partnerships
    return ''
  }

  const Source = () => (
    <CompanySource
      source={defaultSource as ApiSourceType}
      sources={allSources as ApiSourceType[]}
    />
  )

  const Name = () => (
    <Paragraph sx={{ pt: 10, fontWeight: 600, textTransform: 'uppercase' }}>
      {companyName}
    </Paragraph>
  )

  const Info = () => {
    if (isAddOverview || isAddTaxonomy || isAddTaxonomyExternal || isAddFinancials) return null
    return (
      <>
        <Name />
        <Source />
      </>
    )
  }

  const isFollowing = isAdd || oldData.overview.fct_status_id === EnumExpandStatusId.FOLLOWING

  const showViewHistory = (
    tableName: string,
    columnName: string,
    rowId: string,
    source: string = EnumReverseApiSource[defaultSource as keyof typeof EnumReverseApiSource]
  ) => {
    // if records is in these tables, we will show histories of records regardless of source

    return (
      isEdit &&
      hasHistoryField.some(
        x =>
          x.tableName === tableName &&
          x.columnName === columnName &&
          x.rowId === rowId &&
          (SourceIndependentTables.includes(tableName)
            ? true
            : x.source === source || x.source === 'NA')
      )
    )
  }

  const handleUpdateField = async (
    input: {
      tableName: string
      columnName: string
      oldValue: string | number
      newValue: string | number
      id: string | number
      source?: string
    },
    isAppendData: boolean = false,
    beforUpdateStateCB: () => Promise<void> = async () => {}
  ) => {
    if (!checkTimeETL()) return
    const { tableName, columnName, oldValue, newValue, id = companyId, source } = input
    if (
      !tableName ||
      !id ||
      invalidUpdateData(oldValue, newValue, reason, isOverridesUser, false, isAppendData)
    ) {
      return
    }

    const isDate = ['closed_date'].includes(columnName)
    try {
      await override({
        variables: {
          isAppendData: !!isAppendData,
          input: [
            {
              tableName,
              columnName,
              reason,
              oldValue: isDate && oldValue ? transformPostDate(oldValue) : oldValue,
              newValue: isDate && newValue ? transformPostDate(newValue) : newValue,
              companyId: +companyId,
              id: `${id}`,
              source: source || '',
            },
          ],
        },
      })
      await beforUpdateStateCB()
      setReason('')
      if (isOverridesUser || isAppendData) {
        handleApproveUpdateNewData(
          { tableName, columnName, newValue: newValue as string, rowId: id as string },
          isAppendData
        )
      } else {
        refetchViewPendingChangeRequestCols()
      }
      isOverridesUser && refetchViewHistoryCols()
    } catch (error) {
      setError(error && error.message)
      // need this
      throw error
    }
  }

  const updateCompanyNameCache = (name: string) => {
    const cache = client.readQuery({
      query: getInternalCompany,
      variables: { id: +companyId },
    })
    if (!cache) return

    const clone = JSON.parse(JSON.stringify(cache))
    clone.getInternalCompanyById.companyName = name

    client.writeQuery({ query: getInternalCompany, data: clone })
  }

  const updateCompanyLogoCache = (hash: string) => {
    const cache = client.readQuery({
      query: getInternalCompany,
      variables: { id: +companyId },
    })
    if (!cache) return

    const clone = JSON.parse(JSON.stringify(cache))
    clone.getInternalCompanyById.overview.hashed_image = hash
    client.writeQuery({ query: getInternalCompany, data: clone })
  }

  const onRemoveOtherLocation = (index: number) => {
    let cloneState = [...otherLocationsState]
    cloneState.splice(index, 1)
    setOtherLocationsState(cloneState)
  }

  /*
  =========
  LOCATIONS
  ========= 
  */

  const getOldLocationData = (location: LocationFields): LocationFields =>
    (oldData.locations.find(({ id }) => id === location.id) || {}) as LocationFields

  const locationFormProps: Pick<LocationFormProps, SharedLocationFormPropsKeys> &
    RefAttributes<any> = {
    ref: locationRef,
    reason,
    setReason,
    isAddPage: !!isAddOverview,
    showViewHistory,
    setHistoryModal,
    showPendingChangeRequest,
    companyId,
    handleUpdateField: async (
      tableName: string,
      columnName: string,
      oldValue: string | number,
      newValue: string | number,
      id: string | number = companyId,
      source?: string,
      isAppendData?: boolean
    ) => {
      await handleUpdateField(
        { tableName, columnName, oldValue, newValue, id, source },
        !!isAppendData
      )
    },
  }

  const handleOverrideData = async (
    input: OverridesCompanyDataInput | OverridesCompanyDataInput[],
    isAppendData = false
  ) => {
    if (!checkTimeETL()) return
    try {
      if (Array.isArray(input)) {
        await override({ variables: { input, isAppendData } })
      } else {
        await override({ variables: { input: [input], isAppendData } })
      }

      if (isOverridesUser) await refetchViewHistoryCols()
      else await refetchViewPendingChangeRequestCols()
      setReason('')
    } catch (err) {
      setError(err?.message || '')
      onError(err)
    }
  }

  const handleUpdateStatus = async (input: OverridesCompanyDataInput, isAppendData = false) => {
    await handleOverrideData(input, isAppendData)
    if (isOverridesUser || isAppendData) {
      handleApproveUpdateNewData(
        {
          columnName: input.columnName,
          tableName: input.tableName,
          rowId: input.id,
          newValue: input.newValue as string,
        },
        isAppendData
      )
    }
  }

  const handleError = (e: Error) => {
    setError(e.message || '')
    onError(e)
  }

  const handleChangeLogo = (logo: LogoState) => {
    setLogoState(logo)
  }

  const handleUpdateLogo = async (file: LogoState, companyId: number) => {
    try {
      setLogoUpdating(true)
      const oldValue = oldData.overview.hashed_image
      const newValue = file.hash
      await handleUpdateField(
        {
          tableName: TableNames.COMPANIES,
          columnName: ColumnNames.HASHED_IMAGE,
          oldValue,
          newValue,
          id: companyId,
        },
        false,
        async () => {
          if (oldValue !== newValue) await uploadLogo(file, +companyId)
        }
      )
    } catch (err) {
      handleError(err)
    } finally {
      setLogoUpdating(false)
      setLogoState(undefined)
    }
  }

  const [rowId, setRowId] = useState<string>()
  const viewHistory = (input: GetCompanyOverrideInput) => {
    setRowId(input.rowId)
    getHistory({ variables: { input: { ...input, companyId: +input.companyId } } })
    setHistoryModal(true)
  }

  const _logoUrl =
    getLogoPublicUrl(oldData?.overview?.hashed_image as string, companyId) ||
    ((!logoModal ? logoState?.src : '') as string)

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })

  return (
    <CompanyContext.Provider
      value={{
        pendingRequestData: pendingCRData,
        getPendingRequestLoading: getCRLoading,
        overviewPendingRequest: overviewPendingRequest,
        hasHistoryField,
        refreshNumPending: () => {
          refetchViewPendingChangeRequestCols()
        },
        handleClickShowPendingCR,
        isOverridesUser,
        viewHistory,
        handleOverrideData,
        companyId: +companyId,
        companySource: EnumReverseApiSource[defaultSource as keyof typeof EnumReverseApiSource],
        handleUpdateStatus,
        handleAppendDataCQAction,
        handleUpdateField,
      }}
    >
      <Section
        sx={{
          width: ['100vw', '90vw'],
          mx: [0, 'calc((-90vw + 1024px)/2)'],
          maxWidth: 'none',
          padding: 0,
          backgroundColor: 'transparent',
          // extra responses for larger screen
          '@media screen and (min-width: 1680px)': {
            width: '70vw',
            mx: `calc((-70vw + 1024px)/2)`,
          },
          '@media screen and (min-width: 2560px)': {
            width: 1680,
            mx: `calc((-1680px + 1024px)/2)`,
          },
        }}
      >
        <TabMenu buttons={buttons} sx={submitting ? { pointerEvents: 'none' } : {}} />

        {!isAddTaxonomyExternal && (
          <Box sx={{ mt: 6 }}>
            <ViewOverrideButtons
              sx={{ flexDirection: 'column', gap: 2, mb: 2 }}
              viewHistory={viewHistoryFn({
                tableName: TableNames.COMPANIES,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: `${companyId}`,
                companyId,
              })}
              viewPendingChangeRequest={viewPendingCQFn({
                tableName: TableNames.COMPANIES,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: `${companyId}`,
                companyId,
              })}
              totalItemPendingCR={getNumPending(overviewPendingRequest, {
                tableName: TableNames.COMPANIES,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: `${companyId}`,
              })}
            />
            <Flex sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 3 }}>
              <CompanyLogo
                src={_logoUrl}
                width={108}
                height={108}
                onClick={() => {
                  setLogoModal(true)
                }}
              />
              <Box>
                <Heading as="h2">{getHeadingTitle()}</Heading>
                <Info />
              </Box>
            </Flex>
          </Box>
        )}
        {isOverview &&
          (loading ? (
            <Section sx={{ bg: 'white', p: 5, mt: 5, maxWidth: 'none' }}>
              <Updating sx={{ p: 5 }} loading />
            </Section>
          ) : fetchDataError ? (
            <Message variant="alert" body={fetchDataError} sx={{ mt: 4 }} />
          ) : (
            <Form
              getHistory={getHistory}
              setHistoryModal={setHistoryModal}
              getPendingCR={getPendingCR}
              overviewPendingRequest={overviewPendingRequest}
              setError={handleError}
              openPendingCRModel={openPendingCRModel}
              reason={reason}
              setReason={setReason}
              refetchLocations={async () => await getCompanyLocations()}
              refetchAliases={async () => await getCompanyAliases()}
              refetchAttachments={async () => await getCompanyAttachments()}
              fetchingAliases={fetchingAliases}
              fetchingAttachments={fetchingAttachments}
              onChangeForm={onChangeForm}
              formState={formState}
              aliasState={aliasState}
              aliasEditState={aliasEditState}
              editFileState={editFileState}
              setEditFileState={setEditFileState}
              onChangeFile={onChangeFile}
              onChangeAlias={setAliasState}
              onChangeAliasEdit={setAliasEditState}
              onCancel={onCancel}
              loading={createCompanyManualLoading || addAttachmentsLoading || submitting}
              oldData={oldData}
              setOldData={setOldData}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              showPendingChangeRequest={showPendingChangeRequest}
              refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
              fileState={fileState}
              saveFile={async () => {
                try {
                  await saveFile(companyId)
                } catch (error) {
                  setError(error?.message || '')
                }
              }}
              updateCompanyNameCache={updateCompanyNameCache}
              errorFields={formErrors}
              setErrorFieldsState={setFormErrors}
              locationComponent={
                <>
                  <Box id="location" mt={5}>
                    <Paragraph bold>{copy.fieldTitles.locations}</Paragraph>
                    {fetchingLocations ? (
                      <Updating
                        loading
                        noPadding
                        sx={{ p: 6, bg: Palette.mint, borderRadius: 12, my: 4 }}
                      />
                    ) : (
                      <>
                        <SupportAutomationTestingWrapper id="headquarter-location">
                          <Paragraph sx={{ mt: 4 }}>Headquarters</Paragraph>
                          {!!locationState.length ? (
                            locationState.map((location, index) => {
                              return (
                                <LocationForm
                                  {...locationFormProps}
                                  key={index}
                                  location={location}
                                  onChangeLocation={data => onChangeLocation(data, index)}
                                  newData={location}
                                  oldData={getOldLocationData(location)}
                                  setOldData={() =>
                                    onChangeLocation(getOldLocationData(location), index)
                                  }
                                  disabled={!isFollowing}
                                  getHistory={({
                                    tableName,
                                    columnName,
                                  }: Record<'tableName' | 'columnName', string>) => {
                                    getHistory({
                                      variables: {
                                        input: {
                                          tableName,
                                          columnName,
                                          companyId: +companyId,
                                          rowId: location.id as string,
                                          source: '',
                                        },
                                      },
                                    })
                                  }}
                                  overviewPendingRequest={overviewPendingRequest}
                                />
                              )
                            })
                          ) : (
                            <Flex
                              sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                mt: 4,
                              }}
                            >
                              <Button
                                label={copy.buttons.addHeadquartersLocation}
                                sx={{
                                  borderRadius: 10,
                                  color: 'primary',
                                }}
                                variant="outline"
                                onPress={() => onAddLocation(true)}
                                disabled={loading || !isFollowing}
                              />
                            </Flex>
                          )}
                        </SupportAutomationTestingWrapper>
                        <SupportAutomationTestingWrapper id="other-location">
                          <Paragraph sx={{ mt: 4 }}>Other locations</Paragraph>
                          {!isAddOverview &&
                            otherLocationsEdit?.map((location, index) => (
                              <LocationForm
                                {...locationFormProps}
                                key={index}
                                location={location}
                                onChangeLocation={data => onChangeOtherLocationEdit(data, index)}
                                newData={location}
                                oldData={getOldLocationData(location)}
                                setOldData={() =>
                                  onChangeOtherLocationEdit(getOldLocationData(location), index)
                                }
                                disabled={!isFollowing}
                                getHistory={({
                                  tableName,
                                  columnName,
                                }: Record<'tableName' | 'columnName', string>) => {
                                  getHistory({
                                    variables: {
                                      input: {
                                        tableName,
                                        columnName,
                                        companyId: +companyId,
                                        rowId: location.id as string,
                                        source: '',
                                      },
                                    },
                                  })
                                }}
                                overviewPendingRequest={overviewPendingRequest}
                              />
                            ))}
                          {otherLocationsState.map((location, index) => (
                            <LocationForm
                              {...locationFormProps}
                              key={index}
                              location={location}
                              onRemoveLocation={() => onRemoveOtherLocation(index)}
                              onChangeLocation={data => onChangeOtherLocation(data, index)}
                              newData={location}
                              oldData={getOldLocationData(location)}
                              setOldData={() =>
                                onChangeOtherLocation(getOldLocationData(location), index)
                              }
                              disabled={!isFollowing}
                              getHistory={({
                                tableName,
                                columnName,
                              }: Record<'tableName' | 'columnName', string>) => {
                                getHistory({
                                  variables: {
                                    input: {
                                      tableName,
                                      columnName,
                                      companyId: +companyId,
                                      rowId: location.id as string,
                                      source: '',
                                    },
                                  },
                                })
                              }}
                              overviewPendingRequest={overviewPendingRequest}
                            />
                          ))}
                        </SupportAutomationTestingWrapper>
                        <Flex
                          sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            mt: 4,
                          }}
                        >
                          <Button
                            label={copy.buttons.addOtherLocation}
                            sx={{
                              borderRadius: 10,
                              color: 'primary',
                            }}
                            variant="outline"
                            onPress={() => onAddLocation()}
                            disabled={loading || !isFollowing}
                          />
                        </Flex>
                      </>
                    )}
                  </Box>

                  {locationModalVisible && (
                    <Modal
                      sx={{ maxHeight: '90vh', width: '50vw', maxWidth: '50vw', padding: 0 }}
                      buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4, m: 0 }}
                      buttons={[
                        {
                          label: 'Cancel',
                          disabled: isAppending,
                          type: 'secondary',
                          action: () => setLocationModalVisible(false),
                        },
                        {
                          label: 'Add new location',
                          disabled: isAppending || !!getLocationError([appendLocation]).length,
                          type: 'primary',
                          action: async () => {
                            if (!checkTimeETL()) return
                            try {
                              setIsAppending(true)
                              if (!appendLocation.city && !appendLocation.country) {
                                locationRef.current.onSubmit()
                                return
                              }
                              await doAppendLocations({
                                variables: {
                                  input: {
                                    companyId: +companyId,
                                    locations: [appendLocation],
                                  },
                                },
                              })
                              await getCompanyLocations()
                              setLocationModalVisible(false)
                            } catch (err) {
                              setError(err && err.message)
                              setLocationModalVisible(false)
                            } finally {
                              setIsAppending(false)
                            }
                          },
                        },
                      ]}
                    >
                      <Heading sx={{ fontWeight: 600, mt: 4 }} as={'h4'}>
                        {copy.modals.location.title}
                      </Heading>
                      <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
                        <LocationForm
                          ref={locationRef}
                          companyId={companyId}
                          sx={{
                            border: 0,
                            p: 0,
                            m: 5,
                            mb: 0,
                          }}
                          isAddPage={!!isAddOverview}
                          location={appendLocation as LocationFields}
                          onChangeLocation={data => setAppendLocation(data)}
                          reason={reason}
                          setReason={setReason}
                          setHistoryModal={() => {}}
                          getHistory={() => {}}
                          showViewHistory={() => false}
                          showPendingChangeRequest={() => {
                            return false
                          }}
                          handleUpdateField={async () => {}}
                          oldData={{} as LocationFields}
                          newData={{} as LocationFields}
                          setOldData={() => {}}
                        />
                      </Box>
                    </Modal>
                  )}
                </>
              }
            />
          ))}

        {isTaxonomy && (
          <Taxonomy
            taxonomyState={taxonomyState}
            setTaxonomyState={setTaxonomyState}
            setError={setError}
            showViewHistory={showViewHistory}
            showPendingChangeRequest={showPendingChangeRequest}
            overviewPendingRequest={overviewPendingRequest}
            viewHistory={viewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
          />
        )}
        {isFinancials && (
          <Financials
            companyId={companyId}
            isEdit={isEditFinancials}
            onFinish={onFinish}
            onCancel={onCancel}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            financialState={financialState}
            setFinancialState={setFinancialState}
            setError={setError}
          />
        )}
        {isInvestments && (
          <Investments
            companyId={companyId}
            isEdit={true}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={setError}
          />
        )}
        {isEditFundraising && (
          <Fundraising
            companyId={String(companyId)}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={handleError}
            reason={reason}
            setReason={setReason}
          />
        )}
        {isEditBusiness && (
          <BusinessForm
            onCancel={onCancel}
            companyId={companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={handleError}
          />
        )}
        {isEditPeople && (
          <PeopleForm
            companyId={+companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={handleError}
          />
        )}
        {isEditAcquisitions && (
          <Acquisitions
            isEdit={isEditAcquisitions}
            onCancel={onCancel}
            onFinish={onFinish}
            companyId={companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            companySource={companySource}
            setError={(error: Error) => {
              onError(error)
              setError(error.message || '')
            }}
          />
        )}
        {isEditAcquirees && (
          <Acquirees
            isEdit={isEditAcquirees}
            onCancel={onCancel}
            onFinish={onFinish}
            companyId={companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            companySource={companySource}
            setError={(error: Error) => {
              onError(error)
              setError(error.message || '')
            }}
          />
        )}
        {isEditIpos && (
          <Ipos
            isEdit={isEditIpos}
            onCancel={onCancel}
            onFinish={onFinish}
            companyId={companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            companySource={companySource}
            setError={(error: Error) => {
              onError(error)
              setError(error.message || '')
            }}
          />
        )}

        {isEditNews && <News isEdit={isEditNews} refetchViewHistoryCols={refetchViewHistoryCols} />}

        {isEditPartnerships && (
          <Partnerships
            isEdit={isEditPartnerships}
            refetchViewHistoryCols={refetchViewHistoryCols}
          />
        )}

        {isEditUseCase && (
          <UseCaseFormPage
            isEdit={isEditUseCase}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={handleError}
          />
        )}

        {isEditTechnology && (
          <TechnologyTotalForm
            onCancel={onCancel}
            companyId={companyId}
            showViewHistory={showViewHistory}
            refetchViewHistoryCols={refetchViewHistoryCols}
            setError={handleError}
          />
        )}

        {modalVisible && (
          <Modal
            buttons={[
              {
                label: copy.modals.leave.buttons.no,
                type: 'outline',
                action: onModalCancel,
              },
              {
                label: copy.modals.leave.buttons.yes,
                type: 'primary',
                action: onModalConfirm,
              },
            ]}
          >
            <Heading center as="h4">
              {copy.modals.leave.title}
            </Heading>
          </Modal>
        )}

        {message.title && message.content && (
          <Modal
            sx={{ minWidth: 500 }}
            buttons={[
              {
                label: copy.buttons.ok,
                type: 'primary',
                action: () => {
                  setMessage({ title: '', content: '' })
                },
              },
            ]}
          >
            <Flex>
              <Icon icon="alert" size="small" background="red" color="white" />
              <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                {message.title}
              </Heading>
            </Flex>
            <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
              {message.content}
            </Paragraph>
          </Modal>
        )}

        {historyModal && (
          <Modal
            sx={{ p: 4, maxWidth: '70vw', alignItems: 'flex-start', minWidth: '730px' }}
            buttons={[
              {
                label: 'OK',
                action: () => {
                  setHistoryModal(false)
                },
                type: 'primary',
                sx: {
                  p: '10px 60px',
                },
              },
            ]}
            buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
          >
            <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
              {copy.modals.overrides.title}
            </Heading>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
              <OverridesHistory loading={getHistoryLoading} data={historyData} rowId={rowId} />
            </Box>
          </Modal>
        )}

        {logoModal && (
          <Modal
            sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '300px' }}
            buttonsStyle={{
              justifyContent: 'flex-end',
              width: '100%',
            }}
            buttons={[
              {
                label: strings.common.cancel,
                type: 'secondary',
                sx: { p: '10px 60px' },
                action: () => {
                  setLogoState(undefined)
                  setLogoModal(false)
                  setReason('')
                  setInvalidLogo(false)
                },
              },
              {
                label: strings.common.submit,
                type: 'primary',
                sx: { p: '10px 60px' },
                disabled:
                  !logoState ||
                  invalidLogo ||
                  (!isAdd &&
                    invalidUpdateData(
                      oldData.overview.hashed_image,
                      logoState?.hash,
                      reason,
                      isOverridesUser,
                      false,
                      false
                    )),
                action: async () => {
                  if (!isAdd && logoState && companyId) {
                    await handleUpdateLogo(logoState, +companyId)
                  }
                  setLogoModal(false)
                },
              },
            ]}
            updating={logoUpdating}
          >
            <Heading sx={{ fontWeight: 300, mb: 4 }} as={'h4'}>
              {copy.modals.logo.title}
            </Heading>
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', width: '100%', pr: 12 }}>
              <CompanyLogoForm
                state={logoState ? [logoState] : []}
                onChangeFile={handleChangeLogo}
                reason={reason}
                setReason={setReason}
                reasonRequired={!isOverridesUser && !isAdd}
                logo={_logoUrl}
                hideReason={isAdd}
                invalidImage={invalidLogo}
                setInvalidImage={setInvalidLogo}
              />
            </Box>
          </Modal>
        )}

        <PendingCRModal />

        {successModal && (
          <Modal
            sx={{ p: 4, maxWidth: '60vw', minWidth: '600px' }}
            buttons={[
              {
                label: copy.modals.viewCompanyRecord,
                type: 'primary',
                action: () => {
                  newCompanyId && history.push(Routes.COMPANY.replace(':id', newCompanyId))
                },
              },
              {
                label: copy.modals.addAnotherCompany,
                type: 'outline',
                action: () => {
                  setSuccessModal(false)
                  setFormState({} as FormFieldsState)
                  setFormErrors([])
                  setTaxonomyState({
                    tabActive: 'primary',
                    tagGroupChildrenSelected: [],
                  })
                  _setLocationState([defaultLocations])
                  _setOtherLocationsState([{ ...defaultLocations, is_headquarters: 0 }])
                  _setAliasState([''])
                  _setFileState([])
                  _setFinancialState([defaultFinancial])
                  setNewCompanyId('')
                  onFinish()

                  if (!isAddOverview) {
                    history.push(Routes.ADD_COMPANY_OVERVIEW)
                  }
                },
              },
            ]}
            buttonsStyle={{ width: '100%', justifyContent: 'center' }}
          >
            <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
              Success
            </Heading>
            <Paragraph center sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
              Added Company Successfully
            </Paragraph>
          </Modal>
        )}

        {confirmModalVisible && (
          <Modal
            buttons={[
              {
                label: copy.taxonomy.modals.confirm.buttons.no,
                type: 'outline',
                action: () => {
                  setConfirmModalVisible(false)
                },
              },
              {
                label: copy.taxonomy.modals.confirm.buttons.yes,
                type: 'primary',
                action: async () => {
                  try {
                    await onSubmitForms(true)
                  } catch (e) {
                    setError(e && e.message)
                  } finally {
                    setConfirmModalVisible(false)
                  }
                },
              },
            ]}
          >
            <Heading center as="h4">
              {copy.taxonomy.modals.confirm.title}
            </Heading>
          </Modal>
        )}

        {(isAddOverview || isAddTaxonomy || isAddFinancials) && (
          <FooterCTAs
            buttons={[
              {
                label: copy.buttons.cancel,
                variant: 'outlineWhite',
                onClick: () => onCancel(),
                disabled: submitting,
              },
              {
                label: copy.buttons.submit,
                onClick: () => onSubmitForms(),
                disabled: submitting,
              },
            ]}
          />
        )}
      </Section>
    </CompanyContext.Provider>
  )
}

export default CompanyFormPage
