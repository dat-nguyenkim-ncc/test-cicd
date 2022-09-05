import { useApolloClient, useMutation } from '@apollo/client'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Box } from 'theme-ui'
import { Button, FooterCTAs, Modal, Updating } from '../../components'
import { AcquisitionRound, AcquisitionRoundItem } from '../../components/AcquisitionRound'
import {
  AcquisitionFieldNameKeys,
  AcquisitionForm,
  UpdateAcquisitionState,
} from '../../components/AcquisitionRound/AcquisitionRound'
import { Heading, Section } from '../../components/primitives'
import strings from '../../strings'
import { localstorage, LocalstorageFields } from '../../utils'
import { ViewHistoryProps } from './CompanyForm'
import {
  appendNewInvestors,
  APPEND_NEW_ACQUISITIONS,
  GET_COMPANY_ACQUISITIONS,
  OVERRIDE_COMPANY_DATA,
  UpdateStatusInput1,
} from './graphql'
import moment from 'moment'
import {
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumReverseApiSource,
  Routes,
} from '../../types/enums'
import { Investor } from '../../components/InvestorForm'
import {
  ColumnNames,
  OverridesCompanyDataInput,
  trimTheString,
  TableNames,
  validateInvestor,
  getNumPending,
  Value2LabelPipe,
  editCRDisabled,
  findCQ,
  scrollToElement,
  transformPostDate,
} from './helpers'
import { onError } from '../../sentry'
import CompanyContext from './provider/CompanyContext'
import useChangeRequest from '../../hooks/useChangeRequest'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import { expandStatus } from './mock'
import { ETLRunTimeContext, UserContext } from '../../context'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

type Props = {
  info?: React.ReactElement
  acquisition?: any
  companyId: number
  oldData?: any
  onCancel?(): void
  onFinish(): void
  companySource: EnumReverseApiSource
  isEdit?: boolean
  setError(s: Error): void
} & ViewHistoryProps

let isFirstRun = true

const Acquisitions = ({
  info,
  companyId,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  onCancel,
  onFinish,
  companySource,
  isEdit,
  acquisition,
  ...props
}: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const { cr: rowId } = useParams<any>()

  const {
    refreshNumPending,
    handleUpdateStatus,
    viewHistory,
    isOverridesUser,
    hasHistoryField,
  } = useContext(CompanyContext)

  const history = useHistory()

  // STATE
  const [addState, setAddState] = useState<AcquisitionForm[]>([])
  const [editState, setEditState] = useState<AcquisitionForm[]>([])
  const [errorForm, setErrorForm] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [oldData, setOldData] = useState<AcquisitionForm[]>([])
  const [editingItem, setEditingItem] = useState<AcquisitionForm>()
  const [pendingUpdateData, setPendingUpdateData] = useState<UpdateAcquisitionState>(
    {} as UpdateAcquisitionState
  )
  const [pendingUpdateInvestor, setPendingUpdateInvestor] = useState<OverridesCompanyDataInput[]>(
    []
  )

  // GRAPHQL
  const client = useApolloClient()
  const [appendNewAcquisitions] = useMutation(APPEND_NEW_ACQUISITIONS, {
    onCompleted: () => {
      if (isOverridesUser) refetchViewHistoryCols()
      else refetchViewPendingChangeRequestCols()
    },
  })
  const [appendInvestors, { loading: appendInvestorLoading }] = useMutation(appendNewInvestors)
  const [overrideData] = useMutation(OVERRIDE_COMPANY_DATA)

  // METHOD

  const appendInvestor = async (editState: AcquisitionForm[], cb?: () => void) => {
    if (!checkTimeETL()) return
    const acquisitionsHasNewInvestor = editState.filter(
      round =>
        round.investors.filter(investor => !investor.isEdit && !!investor.investor_name.length)
          .length
    )

    const newInvestors = acquisitionsHasNewInvestor.map(round => ({
      funding_id: round.acquisition_id,
      lead_investors: [],
      investors: round.investors
        .filter(investor => !investor.isEdit && !!investor.investor_name.length)
        .map((item: Investor) => ({
          investor_name: item.investor_name,
          investor_type: item.investor_type,
          investor_id: item.investor_id || '',
          external_investor_id: item.external_investor_id || '',
          source: item.source || null,
        })),
    }))

    if (!!newInvestors.length) {
      if (!acquisitionsHasNewInvestor.some(round => validateInvestor(undefined, [round])?.length)) {
        try {
          await appendInvestors({
            variables: { isFunding: false, companyId: +companyId, fundings: newInvestors },
          })
          cb && cb()
          refetchViewHistoryCols && refetchViewHistoryCols()
        } catch (error) {
          props.setError(error)
          onError(error)
          console.log(error)
        }
      } else {
        props.setError(new Error('Duplicate Investors.'))
      }
    }
  }

  const addAcquisiton = async (addState: AcquisitionForm[]) => {
    const readyToAdd = addState.filter(item => item.acquisition_date)
    const errorInvestor: number[] = validateInvestor([], addState)
    if (errorInvestor.length > 0) {
      throw Error(`Investors duplicated`)
    }

    if (!errorForm.length && readyToAdd.length !== 0) {
      const acquisitions = readyToAdd.map((item: AcquisitionForm) => ({
        price: item.price,
        acquisition_date: item.acquisition_date ? transformPostDate(item.acquisition_date) : null,
        source: companySource,
        comment: item.comment || null,
        investors: item.investors
          .filter(investor => investor.investor_name || investor.investor_type)
          .map((investor: Investor) => ({
            investor_name: investor.investor_name,
            investor_type: investor.investor_type,
            investor_id: investor.investor_id || '',
            external_investor_id: investor.external_investor_id || '',
            source: investor.source || null,
          })),
        expandStatus: EnumExpandStatus.FOLLOWING,
        status: item.status,
      }))

      const input = {
        companyId: companyId || localstorage.get(LocalstorageFields.COMPANY_ID),
        acquisitions,
      }
      await appendNewAcquisitions({
        variables: {
          input: {
            companyId: input.companyId ? +input.companyId : 0,
            acquisitions: input.acquisitions,
          },
        },
      })
    }
  }

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    try {
      await appendInvestor(editState)
      await addAcquisiton(addState)

      onFinish()
      history.push(Routes.COMPANY.replace(':id', companyId.toString()))
    } catch (error) {
      props.setError(error)
    }
  }

  const onRemoveRound = (index: number) => {
    const cloneState = [...addState]
    cloneState.splice(index, 1)
    setAddState(cloneState)
  }

  const onAddRound = () => {
    if (!checkTimeETL()) return
    setAddState([
      ...addState,
      {
        price: '',
        acquisition_date: '',
        investors: [],
        source: companySource,
      },
    ])
  }

  const onChangeRoundData = (index: number) => (state: AcquisitionForm) => {
    let cloneState = [...addState]
    cloneState[index] = state
    localstorage.set(LocalstorageFields.COMPANY_ACQUISITIONS, JSON.stringify(cloneState))
    setAddState([...cloneState])
  }

  const onChangeRoundEditData = (index: number) => (state: AcquisitionForm) => {
    if (index === -1) return
    let cloneState = [...editState]
    cloneState[index] = state
    setEditState([...cloneState])
  }

  const onUpdateAcquisition = async (
    records: OverridesCompanyDataInput[],
    isAppendData = false
  ) => {
    if (!records?.length) return

    const input = records.map(record => {
      return { ...record, companyId: +companyId }
    })
    await overrideData({ variables: { input, isAppendData } })
    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
  }

  const getAcquisitions = React.useCallback(async () => {
    setIsLoading(true)
    const result = await client.query({
      query: GET_COMPANY_ACQUISITIONS,
      variables: { companyId: +companyId },
      fetchPolicy: 'network-only',
    })

    const resData = result?.data?.getCompanyAcquisitions.map((item: any) => ({
      ...item,
      acquisition_date: moment(item.acquisition_date).format(DEFAULT_VIEW_DATE_FORMAT),
      investors: item.investors.map((e: Investor) => ({ ...e, isEdit: true })),
    })) as AcquisitionForm[]

    setEditState(resData)
    setOldData(resData)
    setIsLoading(false)
  }, [client, companyId])

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
    })
    setOldData(cloneState)
    setEditState(cloneState)
  }

  const updateStatus = (id: string | number, newStatus: EnumExpandStatus) => {
    const mapFn = (item: AcquisitionForm) => {
      return item.acquisition_id === id ? { ...item, expandStatus: newStatus } : item
    }
    setEditState(editState.map(mapFn))
    setOldData(oldData.map(mapFn))
  }

  const handleUnfollowRound = async (reasonInput: UpdateStatusInput1, el: AcquisitionForm) => {
    const { id, reason, status: newStatus } = reasonInput

    const input = {
      id: id,
      companyId: +companyId,
      reason: reason,
      tableName: TableNames.ACQUISITIONS,
      columnName: ColumnNames.FCT_STATUS_ID,
      source: el.source as string,
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
        updateStatus(el.acquisition_id || '', newStatus)
      }
    } catch (error) {
      props.setError(error)
    }
  }

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    showPendingChangeRequest,
    handleClickShowPendingCR,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleAfterReject: () => {
      getAcquisitions()
    },
    handleApproveUpdateNewData: async data => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        updateStatus(data.rowId, Value2LabelPipe(expandStatus, data.newValue) as EnumExpandStatus)
      } else {
        await getAcquisitions()
      }
    },
    defaultSource: companySource,
    companyId: +companyId,
  })

  const roundProps = {
    isOverride: isOverridesUser,
    handleClickShowPendingCR,
    overviewPendingRequest,
    showPendingChangeRequest,
    companyId,
  }

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })

  const handleUpdateAcquisition = async (
    editingItem: AcquisitionForm,
    pendingUpdateInvestor: OverridesCompanyDataInput[],
    pendingUpdateData: UpdateAcquisitionState
  ) => {
    try {
      setIsUpdating(true)
      const records = [...pendingUpdateInvestor, ...Object.values(pendingUpdateData)].filter(
        (item: OverridesCompanyDataInput) =>
          trimTheString(item.newValue) !== trimTheString(item.oldValue)
      )
      if (!!records?.length) {
        await onUpdateAcquisition(
          records,
          editingItem?.expandStatus === EnumExpandStatus.CHANGE_REQUEST
        )
      }
      let hasNewInvestor = false
      await appendInvestor(editState, () => {
        hasNewInvestor = true
      })
      if (hasNewInvestor || !!records?.length) {
        await getAcquisitions()
        refreshNumPending && refreshNumPending()
      } else {
        const idx = editState.findIndex(item => item.acquisition_id === editingItem?.acquisition_id)
        if (idx !== -1) {
          onChangeRoundEditData(idx!)({
            ...oldData[idx!],
            expandStatus: editState[idx!].expandStatus,
          })
        }
      }
    } catch (error) {
      props.setError(error)
    } finally {
      setEditingItem(undefined)
      setIsUpdating(false)
    }
  }

  // EFFECTS
  useEffect(() => {
    getAcquisitions()
  }, [getAcquisitions])

  useEffect(() => {
    if (rowId && isFirstRun) {
      const acquisition = editState.find(
        e =>
          e.acquisition_id === rowId ||
          e.investors.some(({ funding_investor_id }) => funding_investor_id === rowId)
      )
      if (acquisition?.acquisition_id) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(acquisition?.acquisition_id || ''))

          if (
            !viewPendingCQFn({
              tableName: TableNames.ACQUISITIONS,
              columnName: ColumnNames.FCT_STATUS_ID,
              rowId: acquisition.acquisition_id as string,
              source: acquisition.source || '',
              companyId: +companyId,
            })
          ) {
            setEditingItem(acquisition)
          }
          isFirstRun = false
        }, 0)
      }
    }
  }, [editState, rowId, viewPendingCQFn, companyId])

  return (
    <>
      {isLoading ? (
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
            {(editState || []).map((el, index) => {
              const overrideIdentity = {
                tableName: TableNames.ACQUISITIONS,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: el.acquisition_id as string,
                source: el.source || '',
                companyId: +companyId,
              }

              return (
                <Box id={el.acquisition_id} key={el.acquisition_id}>
                  <AcquisitionRoundItem
                    sx={{ mb: 5 }}
                    isOverride={isOverridesUser}
                    acquisition={el}
                    unfollowAcquisitionRound={input => handleUnfollowRound(input, el)}
                    buttons={[
                      {
                        label: 'Edit',
                        action: async () => {
                          if (!checkTimeETL()) return
                          setEditingItem(el)
                          setPendingUpdateData({} as UpdateAcquisitionState)
                          setPendingUpdateInvestor([])
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
                    viewHistory={viewHistoryFn(overrideIdentity)}
                    viewPendingChangeRequest={viewPendingCQFn(overrideIdentity)}
                    totalItemPendingCR={getNumPending(overviewPendingRequest, overrideIdentity)}
                    pendingCR={overviewPendingRequest}
                  />
                </Box>
              )
            })}

            {!isEdit &&
              (addState || []).map((el, index) => (
                <AcquisitionRound
                  {...roundProps}
                  sx={{ border: '2px solid black' }}
                  key={index}
                  acquisition={el}
                  onRemove={() => onRemoveRound(index)}
                  onChangeRoundData={onChangeRoundData(index)}
                  companyId={companyId}
                  errorForm={errorForm}
                  setErrorForm={(errorFields: AcquisitionFieldNameKeys[]) => {
                    let cloneError = [...errorForm]
                    if (!!errorFields?.length && !errorForm?.includes(index)) {
                      cloneError?.push(index)
                    } else if (!errorFields.length && cloneError.indexOf(index) > -1)
                      cloneError?.splice(cloneError.indexOf(index), 1)
                    setErrorForm && setErrorForm(cloneError)
                  }}
                  showViewHistory={showViewHistory}
                />
              ))}

            <Button
              onPress={onAddRound}
              label={copy.buttons.addAcquisitionRound}
              sx={{
                width: '100%',
                borderRadius: 10,
                color: 'primary',
                bg: 'white',
                mt: 5,
              }}
              variant="outline"
              icon={'add'}
            />
          </Section>

          <FooterCTAs
            buttons={
              !isEdit
                ? [
                    {
                      label: copy.buttons.cancel,
                      variant: 'outlineWhite',
                      onClick: onCancel,
                      disabled: appendInvestorLoading,
                    },
                    {
                      label: copy.buttons.save,
                      onClick: onSubmit,
                      disabled: appendInvestorLoading,
                    },
                  ]
                : [
                    {
                      label: copy.buttons.backToCompanyRecord,
                      variant: 'outlineWhite',
                      onClick: () =>
                        history.push(Routes.COMPANY.replace(':id', companyId.toString())),
                    },
                  ]
            }
          />
        </>
      )}
      {editingItem && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.acquisitions.modals.cancel,
              disabled: isUpdating,
              type: 'secondary',
              action: () => {
                setEditingItem(undefined)
                const idx = editState.findIndex(
                  item => item.acquisition_id === editingItem.acquisition_id
                )
                if (idx !== -1) onChangeRoundEditData(idx!)(oldData[idx!])
              },
            },
            {
              label: copy.acquisitions.modals.save,
              disabled: isUpdating,
              type: 'primary',
              action: async () => {
                await handleUpdateAcquisition(editingItem, pendingUpdateInvestor, pendingUpdateData)
              },
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            Edit Acquisition
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh' }}>
            <AcquisitionRound
              {...roundProps}
              sx={{ m: 0, py: 0 }}
              isEdit={true}
              acquisition={
                editState.find(item => item.acquisition_id === editingItem?.acquisition_id)!
              }
              onChangeRoundData={onChangeRoundEditData(
                editState.findIndex(item => item.acquisition_id === editingItem.acquisition_id)
              )}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              oldData={oldData.find(
                ({ acquisition_id }) => acquisition_id === editingItem.acquisition_id
              )}
              setOldData={(round: AcquisitionForm) => {
                setOldData(
                  oldData.map(item =>
                    item.acquisition_id === editingItem.acquisition_id ? round : item
                  )
                )
              }}
              onChangeOldState={onChangeOldState}
              setPendingUpdateData={setPendingUpdateData}
              pendingUpdateData={pendingUpdateData}
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
              refetchAPI={getAcquisitions}
              queryLoading={isLoading}
            />
          </Box>
        </Modal>
      )}

      {isEdit && !!addState.length && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.acquisitions.modals.cancel,
              disabled: isUpdating,
              type: 'secondary',
              action: () => setAddState([]),
            },
            {
              label: copy.acquisitions.modals.addAcquisitionRound,
              disabled: isUpdating || !!errorForm.length || addState.some(i => !i.acquisition_date),
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setIsUpdating(true)
                  const readyToAdd = addState.filter(item => item.acquisition_date)
                  if (readyToAdd.length) {
                    await addAcquisiton(readyToAdd)
                    await getAcquisitions()
                  }
                  setAddState([])
                } catch (error) {
                  props.setError(error)
                } finally {
                  setIsUpdating(false)
                }
              },
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            Add Acquisition
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh' }}>
            <AcquisitionRound
              {...roundProps}
              sx={{ m: 0, py: 0 }}
              acquisition={addState[0]}
              onChangeRoundData={onChangeRoundData(0)}
              companyId={companyId}
              errorForm={errorForm}
              setErrorForm={(errorFields: AcquisitionFieldNameKeys[]) => {
                let cloneError = [...errorForm]
                if (!!errorFields?.length && !errorForm?.includes(0)) {
                  cloneError?.push(0)
                } else if (!errorFields.length && cloneError.indexOf(0) > -1)
                  cloneError?.splice(cloneError.indexOf(0), 1)
                setErrorForm && setErrorForm(cloneError)
              }}
              showViewHistory={(...args) => false}
              refetchViewHistoryCols={undefined}
              refetchAPI={getAcquisitions}
              queryLoading={isLoading}
            />
          </Box>
        </Modal>
      )}

      <PendingCRModal />
    </>
  )
}

export default Acquisitions
