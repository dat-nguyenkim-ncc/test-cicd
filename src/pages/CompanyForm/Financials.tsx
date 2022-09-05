import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Box } from 'theme-ui'
import { Button, FooterCTAs, FundingRound, Modal, Updating } from '../../components'
import { FundingFields, FundingForm, FundingRoundItem } from '../../components/FundingRound'
import { Section, Heading } from '../../components/primitives'
import strings from '../../strings'
import { FormOption, GetCompanyOverrideInput, RoundTypesOption } from '../../types'
import {
  ColumnNames,
  FieldNames,
  FormRoundFieldsState,
  EnumFundingModalMode,
  TableNames,
  validateDate,
  validateInvestor,
  validateMoney,
  UpdateFundingState,
  OverridesCompanyDataInput,
  getAddCompanyFinancialsInput,
  trimTheString,
  getNumPending,
  Value2LabelPipe,
  editCRDisabled,
  findCQ,
  scrollToElement,
  formatFundingRoundTypes,
} from './helpers'
import { expandStatus } from './mock'
import moment from 'moment'
import { localstorage, LocalstorageFields } from '../../utils'
import {
  addFinancials,
  appendNewFinancials,
  appendNewInvestors,
  getCompanyFinancials,
  OVERRIDE_COMPANY_DATA,
  UpdateStatusInput1,
  GET_FUNDING_ROUND_TYPES,
} from './graphql'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import {
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumReverseCompanySource,
  Routes,
} from '../../types/enums'
import { ViewHistoryProps } from './CompanyForm'
import { Investor } from '../../components/InvestorForm'
import { onError } from '../../sentry'
import CompanyContext from './provider/CompanyContext'
import useChangeRequest from '../../hooks/useChangeRequest'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import { ETLRunTimeContext, UserContext } from '../../context'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

type FundingFieldOptions = Partial<RoundTypesOption>

export const fields = (options: FundingFieldOptions = {}): FundingFields[] => [
  {
    name: FieldNames?.roundType1,
    key: 'roundType1',
    type: 'dropdown',
    option: options.roundType1,
    table: TableNames?.FUNDINGS,
    disableOverride: true,
  },
  {
    name: FieldNames?.roundType2,
    key: 'roundType2',
    type: 'dropdown',
    customOptions: (formState?: FormRoundFieldsState): FormOption[] => {
      return formState && options.roundType2 ? options.roundType2[formState?.roundType1] : []
    },
    table: TableNames?.FUNDINGS,
    required: true,
  },
  {
    name: FieldNames?.investment,
    key: 'investment',
    format: validateMoney,
    formatError: 'Invalid money',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.date,
    key: 'date',
    placeholder: DEFAULT_VIEW_DATE_FORMAT,
    format: validateDate,
    formatError: 'Invalid date',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.source,
    key: 'source',
    type: 'input',
    format: (v: string | number) =>
      EnumReverseCompanySource[v as keyof typeof EnumReverseCompanySource]?.toLocaleUpperCase() ||
      (v as string),
    placeholder: 'BCG',
    required: true,
    disabled: true,
  },
  {
    name: FieldNames?.valuation,
    key: 'valuation',
    format: validateMoney,
    formatError: 'Invalid money',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.comment,
    key: 'comment',
    type: 'textarea',
    maxlength: 2083,
    table: TableNames?.FUNDINGS,
  },
]

type FinancialsProps = {
  companyId: number
  isEdit?: boolean
  onCancel(): void
  onFinish(): void
  info?: React.ReactElement
  financialState: FundingForm[]
  setFinancialState(state: FundingForm[]): void
  setError(error: string): void
} & ViewHistoryProps

let isFirstRun = true

const Financials = ({
  companyId,
  isEdit,
  onCancel,
  onFinish,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  info,
  financialState,
  setFinancialState,
  setError,
}: FinancialsProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { cr: rowId } = useParams<any>()

  const {
    handleUpdateStatus,
    viewHistory,
    isOverridesUser,
    hasHistoryField,
    companySource,
  } = React.useContext(CompanyContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const localCompanyFinancials = localstorage.get(LocalstorageFields.COMPANY_FINANCIALS)

  const history = useHistory()
  const firstUpdate = useRef(true)

  const [errorForm, setErrorForm] = useState<number[]>([])

  const [financialEditState, setFinancialEditState] = useState<FundingForm[]>([])
  const [editingFinancial, setEditingFinancial] = useState<FundingForm>()
  const [oldData, setOldData] = useState<FundingForm[]>([])
  const [viewState, setViewState] = useState<FundingForm[]>([])
  const [fundingRoundModalVisible, setFundingRoundModalVisible] = useState(false)
  const [pendingUpdateFunding, setPendingUpdateFunding] = useState<UpdateFundingState>(
    {} as UpdateFundingState
  )
  const [pendingUpdateInvestor, setPendingUpdateInvestor] = useState<OverridesCompanyDataInput[]>(
    []
  )
  const [updatedCR, setUpdatedCR] = useState<boolean>(false)

  // GRAPHQL
  const [addCompanyFinancials, { loading }] = useMutation(addFinancials)
  const [appendCompanyFinancials, { loading: appendLoading }] = useMutation(appendNewFinancials, {
    onCompleted: () => {
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
  })
  const { data: fundingRoundTypes, loading: loadingFundingRoundsTypes } = useQuery(
    GET_FUNDING_ROUND_TYPES
  )
  const [getFinancials, { data, loading: queryLoading }] = useLazyQuery(getCompanyFinancials, {
    variables: {
      id: +companyId || localstorage.get(LocalstorageFields.COMPANY_ID),
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      const viewState: FundingForm[] = []
      const editState: FundingForm[] = data.getCompanyFinancials.fundingRounds.map((e: any) => {
        const editStateItem = {
          expandStatus: e.expandStatus,
          selfDeclared: e.selfDeclared,
          id: e.funding_id,
          sourceRoundType: e.sourceRoundType,
          round: {
            roundType1: String(e.roundType1.id),
            roundType2: String(e.roundType2.id),
            investment: e.investment,
            date: e.date ? moment(e.date).format(DEFAULT_VIEW_DATE_FORMAT) : '',
            source: e.source,
            valuation: e.valuation,
            comment: e.comment,
            // readonly
            apiAppend: e.apiAppend,
            investmentCurrency: e.investmentCurrency,
            sourceInvestment: e.sourceInvestment,
          },
          investors: [...(e.lead_investors || []), ...(e.investors || [])].map((obj: Investor) => ({
            ...obj,
            isEdit: true,
            isLead: e.lead_investors.some((item: Investor) => item.investor_id === obj.investor_id),
          })),
        }

        const viewItem = {
          ...editStateItem,
          round: {
            ...editStateItem.round,
            roundType1: e.roundType1.name,
            roundType2: e.roundType2.name,
          },
        }

        viewState.push(viewItem)

        return editStateItem
      })
      setFinancialEditState(editState)
      setOldData(editState)
      setViewState(viewState)
    },
  })
  const [appendInvestors, { loading: appendInvestorLoading }] = useMutation(appendNewInvestors)
  const [updateFunding, { loading: isUpdating }] = useMutation<
    any,
    { input: OverridesCompanyDataInput[]; isAppendData?: boolean }
  >(OVERRIDE_COMPANY_DATA)

  const isLoading = !!(
    loading ||
    appendLoading ||
    queryLoading ||
    appendInvestorLoading ||
    isUpdating ||
    loadingFundingRoundsTypes
  )

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    showPendingChangeRequest,
    handleClickShowPendingCR,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleAfterReject: async () => {
      await getFinancials()
    },
    handleApproveUpdateNewData: async data => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        updateStatus(
          data.rowId || '',
          Value2LabelPipe(expandStatus, data.newValue) as EnumExpandStatus
        )
      } else {
        await getFinancials()
      }
    },
    defaultSource: companySource,
    companyId: +companyId,
  })

  const roundTypes = useMemo(() => {
    if (fundingRoundTypes && fundingRoundTypes.getFundingRoundTypes) {
      return formatFundingRoundTypes(fundingRoundTypes.getFundingRoundTypes)
    }
    return {
      roundType1: [],
      roundType2: {},
    }
  }, [fundingRoundTypes])

  const fundingFields: FundingFields[] = useMemo(() => {
    const { roundType1, roundType2 } = roundTypes
    return fields({ roundType1, roundType2 })
  }, [roundTypes])

  const refetchData = async () => {
    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
    await getFinancials()
  }

  const onChangeFinancialsEdit = (key: number) => (state: FundingForm) => {
    if (key === -1) return
    let cloneState = [...financialEditState]
    cloneState[key] = state
    setFinancialEditState([...cloneState])
  }

  const onChangeFinancials = (key: number) => (state: FundingForm) => {
    let cloneState = [...financialState]
    cloneState[key] = state
    setFinancialState([...cloneState])
  }

  const addFundingRound = async () => {
    if (!checkTimeETL()) return
    await setFinancialState([
      ...(isEdit ? [] : financialState),
      ...[
        {
          round: {
            roundType1: '',
            roundType2: '',
            investment: '',
            date: '',
            source: companySource || '',
            valuation: '',
            comment: '',
            // readonly
            apiAppend: 1,
          },
          investors: [],
        },
      ],
    ])

    if (isEdit) {
      setFundingRoundModalVisible(true)
    }
  }

  const onRemoveFundingRound = (index: number) => {
    if (!isEdit) {
      const cloneState = [...financialState]
      cloneState.splice(index, 1)
      setFinancialState(cloneState)
    }
  }

  const insertInvestor = async (financials: FundingForm[], afterSuccessAppending?: () => void) => {
    if (!checkTimeETL()) return
    const mapInvestorFn = (elem: Investor) => {
      const { isLead, ...e } = elem
      return {
        ...e,
        investor_id: e.investor_id || '',
        external_investor_id: e.external_investor_id || '',
        source: e.source || null,
        children: undefined,
      }
    }

    const fundingRoundHasNewInvestor = financials.filter(
      round =>
        round.investors.filter(
          investor =>
            !investor.isEdit && (!!investor.investor_name.length || !!investor.investor_type.length)
        ).length
    )

    const newInvestor = fundingRoundHasNewInvestor.map(round => ({
      funding_id: round.id,
      lead_investors: round.investors
        .filter(
          investor =>
            investor.isLead &&
            !investor.isEdit &&
            (!!investor.investor_name.length || !!investor.investor_type.length)
        )
        .map(mapInvestorFn),
      investors: round.investors
        .filter(
          investor =>
            !investor.isLead &&
            !investor.isEdit &&
            (!!investor.investor_name.length || !!investor.investor_type.length)
        )
        .map(mapInvestorFn),
    }))

    if (!!newInvestor.length) {
      if (!fundingRoundHasNewInvestor.some(round => validateInvestor([round])?.length)) {
        try {
          await appendInvestors({ variables: { companyId: +companyId, fundings: newInvestor } })
          afterSuccessAppending && afterSuccessAppending()
          refetchViewHistoryCols && refetchViewHistoryCols()
        } catch (error) {
          setError(error.message || '')
          onError(error)
        }
      } else {
        setError('Duplicate Investors.')
      }
    }
  }

  const onSubmitForm = async () => {
    if (!checkTimeETL()) return
    if (errorForm.length) return

    const fundings = getAddCompanyFinancialsInput(financialState, companySource)

    /** Use at 2 case
     * Case 1: Append when edit
     * Case 2: Add funding (add page)
     **/
    const input = {
      companyId: +companyId || localstorage.get(LocalstorageFields.COMPANY_ID),
      fundings,
    }

    try {
      const errorInvestor: number[] = validateInvestor(financialState)
      if (errorInvestor.length > 0) {
        throw Error(`Investors duplicated`)
      }

      if (!isEdit) {
        await addCompanyFinancials({
          variables: {
            input: {
              companyId: input.companyId ? +input.companyId : 0,
              fundings: input.fundings,
            },
          },
        })
      } else {
        // TODO append investor to funding round
        await insertInvestor(financialEditState)

        if (!!fundings.length) {
          await appendCompanyFinancials({
            variables: { input: { companyId: +companyId, fundings: input.fundings } },
          })
        }
      }
      setFundingRoundModalVisible(false)
      onFinish()
      if (isEdit) {
        refetchData()
      } else history.push(Routes.COMPANY.replace(':id', companyId.toString()))
    } catch (error) {
      setError(error.message)
    }
  }

  const onChangeOldState = (column: string, value: string, investor_id: string) => {
    const cloneState = [...oldData].map(round => {
      return {
        ...round,
        investors: round.investors.map(investor => ({
          ...investor,
          investor_name:
            column === ColumnNames.INVESTOR_NAME && investor_id === investor.investor_id
              ? value
              : investor.investor_name,
          investor_type:
            column === ColumnNames.INVESTOR_TYPE && investor_id === investor.investor_id
              ? value
              : investor.investor_type,
        })),
      }
    }) as FundingForm[]
    onChangeOldData(cloneState)
    setFinancialEditState(cloneState)
  }

  const onChangeOldData = (state: FundingForm[]) => {
    setOldData(state)
    setViewState(state.map((f, i) => ({ ...f, round: viewState[i].round })))
  }

  const exitEditing = () => {
    setPendingUpdateFunding({} as UpdateFundingState)
    setPendingUpdateInvestor([])
    setFundingRoundModalVisible(false)
    setEditingFinancial(undefined)
    setErrorForm([])
  }

  // Modal
  const onCloseModal = () => {
    if (fundingModalMode === EnumFundingModalMode.EDITING) {
      const idx = financialEditState.findIndex(item => item.id === editingFinancial?.id)
      if (idx !== -1) onChangeFinancialsEdit(idx!)(oldData[idx!])
      exitEditing()
    }
    if (updatedCR) refetchData()

    setFundingRoundModalVisible(false)
  }

  const getOriginValue = (record: OverridesCompanyDataInput, funding: FundingForm) => {
    const { sourceRoundType } = funding
    const { columnName, tableName, oldValue } = record
    if (tableName === TableNames.FUNDINGS && columnName === ColumnNames.ROUND_2_ID) {
      return sourceRoundType || ''
    }

    return oldValue
  }

  const onUpdateFunding = async (records: OverridesCompanyDataInput[], isAppendData = false) => {
    if (!checkTimeETL()) return
    if (!records?.length) return

    const input = records.map(record => {
      const funding = viewState.find(({ id }) => id === record.id) || ({} as FundingForm)
      return {
        ...record,
        oldValue: getOriginValue(record, funding),
        companyId: +companyId,
      }
    })

    await updateFunding({ variables: { input, isAppendData } })

    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
  }

  const fundingModalMode = !!editingFinancial?.id
    ? EnumFundingModalMode.EDITING
    : EnumFundingModalMode.ADDING

  const updateStatus = (id: string | number, newStatus: EnumExpandStatus) => {
    const mapFn = (item: FundingForm) => {
      return item.id === id ? { ...item, expandStatus: newStatus } : item
    }
    setFinancialEditState(financialEditState.map(mapFn))
    onChangeOldData(oldData.map(mapFn))
  }

  const handleUnfollowFundingRound = async (reasonInput: UpdateStatusInput1, el: FundingForm) => {
    const { id, reason, status: newStatus } = reasonInput
    const input = {
      id: id,
      companyId: +companyId,
      reason: reason,
      tableName: TableNames.FUNDINGS,
      columnName: ColumnNames.FCT_STATUS_ID,
      source: el.round.source,
      newValue:
        newStatus === EnumExpandStatus.FOLLOWING
          ? EnumExpandStatusId.FOLLOWING
          : EnumExpandStatusId.UNFOLLOWED,
      oldValue:
        newStatus === EnumExpandStatus.FOLLOWING
          ? EnumExpandStatusId.UNFOLLOWED
          : EnumExpandStatusId.FOLLOWING,
    }

    try {
      await handleUpdateStatus(input)

      if (isOverridesUser) {
        updateStatus(el.id || '', newStatus)
      }
    } catch (error) {
      onError(error)
      setError(error?.message || '')
    }
  }

  const roundProps = {
    isOverride: isOverridesUser,
    handleClickShowPendingCR,
    overviewPendingRequest,
    companyId,
  }

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })

  const handleUpdateFunding = async (
    editingFinancial: FundingForm,
    pendingUpdateInvestor: OverridesCompanyDataInput[],
    pendingUpdateFunding: UpdateFundingState
  ) => {
    if (!editingFinancial) return
    try {
      const records = [...pendingUpdateInvestor, ...Object.values(pendingUpdateFunding)].filter(
        (item: OverridesCompanyDataInput) =>
          trimTheString(item.newValue) !== trimTheString(item.oldValue)
      )

      if (!!records?.length) {
        await onUpdateFunding(
          records,
          editingFinancial.expandStatus === EnumExpandStatus.CHANGE_REQUEST
        )
      }

      let hasNewInvestor = false
      await insertInvestor(financialEditState, () => {
        hasNewInvestor = true
      })

      if (hasNewInvestor || !!records?.length || updatedCR) {
        await refetchData()
      } else {
        const idx = financialEditState.findIndex(item => item.id === editingFinancial?.id)
        if (idx !== -1) {
          onChangeFinancialsEdit(idx!)({
            ...oldData[idx!],
            expandStatus: financialEditState[idx!].expandStatus,
          })
        }
      }
    } catch (err) {
      setError(err.message)
      onError(err)
    } finally {
      exitEditing()
    }
  }

  //Effect
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      if (isEdit) {
        getFinancials({
          variables: {
            id: +companyId,
          },
        })
      }
      return
    }
  }, [isEdit, getFinancials, companyId, localCompanyFinancials])

  useEffect(() => {
    if (rowId && isFirstRun) {
      const funding = oldData.find(
        e =>
          e.id === rowId ||
          e.investors.some(({ funding_investor_id }) => funding_investor_id === rowId)
      )
      if (funding?.id) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(funding?.id || ''))
          if (
            !viewPendingCQFn({
              tableName: TableNames.FUNDINGS,
              columnName: ColumnNames.FCT_STATUS_ID,
              rowId: funding.id as string,
              source: funding.round.source as string,
              companyId: +companyId,
            })
          ) {
            setEditingFinancial(funding)
            setFundingRoundModalVisible(true)
          }

          isFirstRun = false
        }, 0)
      }
    }
  }, [oldData, rowId, viewPendingCQFn, companyId])

  return (
    <>
      {queryLoading && !fundingRoundModalVisible ? (
        <Section sx={{ bg: 'white', p: 5, mt: 5, maxWidth: 'none' }}>
          <Updating sx={{ p: 5 }} loading />
        </Section>
      ) : (
        <>
          <Section
            sx={{
              maxWidth: 'none',
              ...(isEdit ? { bg: 'transparent', px: 0, mt: -5 } : { bg: 'white', p: 5, mt: 5 }),
            }}
          >
            {isEdit &&
              !!viewState?.length &&
              viewState.map(el => {
                const overrideIdentity: GetCompanyOverrideInput = {
                  tableName: TableNames.FUNDINGS,
                  columnName: ColumnNames.FCT_STATUS_ID,
                  companyId: +companyId,
                  rowId: el.id as string,
                  source: el.round.source as string,
                }
                return (
                  <Box key={el.id} id={el.id}>
                    <FundingRoundItem
                      sx={{ mb: 5 }}
                      isOverride={isOverridesUser}
                      funding={el}
                      unfollowFundingRound={input => handleUnfollowFundingRound(input, el)}
                      buttons={[
                        {
                          label: 'Edit',
                          action: () => {
                            if (!checkTimeETL()) return
                            setEditingFinancial(el)
                            setFundingRoundModalVisible(true)
                          },
                          type: 'secondary',
                          isCancel: true,
                          disabled:
                            (el.expandStatus !== EnumExpandStatus.FOLLOWING &&
                              el.expandStatus !== EnumExpandStatus.CHANGE_REQUEST) ||
                            editCRDisabled(
                              findCQ(overviewPendingRequest, overrideIdentity)?.users || [],
                              user,
                              el.expandStatus === EnumExpandStatus.CHANGE_REQUEST
                            ),
                        },
                      ]}
                      viewHistoryFn={iden => viewHistoryFn({ ...iden, companyId: +companyId })}
                      viewPendingCQFn={iden => viewPendingCQFn({ ...iden, companyId: +companyId })}
                      handleAppendDataCQAction={handleAppendDataCQAction}
                      getNumPending={iden => {
                        return getNumPending(overviewPendingRequest, iden)
                      }}
                      viewHistory={() => viewHistoryFn(overrideIdentity)}
                      viewPendingChangeRequest={viewPendingCQFn(overrideIdentity)}
                      totalItemPendingCR={getNumPending(overviewPendingRequest, overrideIdentity)}
                      pendingCR={overviewPendingRequest}
                    />
                  </Box>
                )
              })}

            {!isEdit &&
              !!financialState.length &&
              financialState.map((el, index) => (
                <FundingRound
                  {...roundProps}
                  sx={{ border: '2px solid black' }}
                  key={index}
                  fields={fundingFields}
                  financials={el}
                  errorForm={errorForm}
                  setErrorForm={setErrorForm}
                  onChangeFinancials={onChangeFinancials(index)}
                  onRemove={() => onRemoveFundingRound(index)}
                  showViewHistory={showViewHistory}
                  showPendingChangeRequest={showPendingChangeRequest}
                  roundTypes={roundTypes}
                />
              ))}

            <Button
              onPress={addFundingRound}
              sx={{
                width: '100%',
                borderRadius: 10,
                color: 'primary',
                bg: 'white',
                mt: 5,
              }}
              variant="outline"
              label={copy.buttons.addFundingRound}
              icon={'add'}
            />
          </Section>

          {fundingRoundModalVisible && (
            <Modal
              sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
              buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
              buttons={[
                {
                  label: copy.financials.modals.cancel,
                  action: () => {
                    onCloseModal()
                  },
                  type: 'secondary',
                  disabled: isLoading,
                },
                {
                  label:
                    fundingModalMode === EnumFundingModalMode.EDITING
                      ? copy.financials.modals.save
                      : copy.financials.modals.addFundingRound,
                  action: async () => {
                    if (fundingModalMode === EnumFundingModalMode.EDITING) {
                      await handleUpdateFunding(
                        editingFinancial!,
                        pendingUpdateInvestor,
                        pendingUpdateFunding
                      )
                    } else {
                      await onSubmitForm()
                    }
                  },
                  type: 'primary',
                  disabled: isLoading || !!errorForm.length,
                },
              ]}
            >
              <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
                {(fundingModalMode === EnumFundingModalMode.EDITING ? `Edit` : `Add`) +
                  ` Funding Round`}
              </Heading>
              <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh' }}>
                {fundingModalMode === EnumFundingModalMode.EDITING ? (
                  <FundingRound
                    {...roundProps}
                    sx={{ width: '100%', border: 0, mt: 0, pt: 0 }}
                    companyId={companyId}
                    isEdit={true}
                    fields={fundingFields}
                    financials={financialEditState.find(item => item.id === editingFinancial?.id)!}
                    oldRound={oldData.find(item => item.id === editingFinancial?.id)!}
                    setOldRound={(round: FundingForm) => {
                      onChangeOldData(
                        oldData.map(item => (item.id === editingFinancial?.id ? round : item))
                      )
                    }}
                    errorForm={errorForm}
                    setErrorForm={setErrorForm}
                    onChangeFinancials={onChangeFinancialsEdit(
                      financialEditState.findIndex(item => item.id === editingFinancial?.id)
                    )}
                    showViewHistory={showViewHistory}
                    refetchViewHistoryCols={refetchViewHistoryCols}
                    showPendingChangeRequest={showPendingChangeRequest}
                    refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                    onChangeOldState={onChangeOldState}
                    setPendingUpdateFunding={setPendingUpdateFunding}
                    pendingUpdateFunding={pendingUpdateFunding}
                    setPendingUpdateInvestor={(investorInput: OverridesCompanyDataInput) => {
                      const index = pendingUpdateInvestor.findIndex(item => {
                        const { tableName, columnName, id, source } = item

                        const {
                          tableName: tableName1,
                          columnName: columnName1,
                          id: id1,
                          source: source1,
                        } = investorInput

                        return (
                          tableName === tableName1 &&
                          columnName === columnName1 &&
                          id === id1 &&
                          source === source1
                        )
                      })
                      if (index > -1) {
                        const cloneState = [...pendingUpdateInvestor]
                        cloneState[index] = investorInput
                        setPendingUpdateInvestor(cloneState)
                      } else setPendingUpdateInvestor([...pendingUpdateInvestor, investorInput])
                    }}
                    refetchAPI={() => {
                      refetchViewHistoryCols()
                      getFinancials()
                    }}
                    queryLoading={queryLoading}
                    overviewPendingRequest={overviewPendingRequest}
                    setUpdatedCR={setUpdatedCR}
                    roundTypes={roundTypes}
                  />
                ) : (
                  <FundingRound
                    {...roundProps}
                    sx={{ width: '100%', border: 0, mt: 0, pt: 0 }}
                    fields={fundingFields}
                    financials={financialState[financialState.length - 1]}
                    errorForm={errorForm}
                    setErrorForm={setErrorForm}
                    onChangeFinancials={onChangeFinancials(financialState.length - 1)}
                    showViewHistory={showViewHistory}
                    showPendingChangeRequest={showPendingChangeRequest}
                    refetchAPI={getFinancials}
                    roundTypes={roundTypes}
                  />
                )}
              </Box>
            </Modal>
          )}
          <PendingCRModal />

          {isEdit && (
            <FooterCTAs
              buttons={[
                {
                  label: copy.buttons.backToCompanyRecord,
                  variant: 'outlineWhite',
                  onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
                  disabled: loading,
                },
              ]}
            />
          )}
        </>
      )}
    </>
  )
}
export default Financials
