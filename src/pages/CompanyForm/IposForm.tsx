import { useApolloClient, useMutation } from '@apollo/client'
import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Box } from 'theme-ui'
import { Button, FooterCTAs, Modal, Updating } from '../../components'
import { Heading, Section } from '../../components/primitives'
import strings from '../../strings'
import { localstorage, LocalstorageFields } from '../../utils'
import { ViewHistoryProps } from './CompanyForm'
import {
  APPEND_NEW_IPOS,
  GET_COMPANY_IPOS,
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
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  OverridesCompanyDataInput,
  scrollToElement,
  TableNames,
  transformPostDate,
  trimTheString,
  Value2LabelPipe,
} from './helpers'
import IpoRound, {
  IpoFieldNameKeys,
  IpoForm,
  UpdateIpoState,
} from '../../components/IpoRound/IpoRound'
import { IpoRoundItem } from '../../components/IpoRound'
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

const Ipos = ({
  info,
  companyId,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  onCancel,
  onFinish,
  companySource,
  isEdit,
  ...props
}: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { cr: rowId } = useParams<any>()

  const { handleUpdateStatus, isOverridesUser, viewHistory, hasHistoryField } = useContext(
    CompanyContext
  )
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const history = useHistory()

  // STATE
  const [addState, setAddState] = useState<IpoForm[]>([])
  const [editState, setEditState] = useState<IpoForm[]>([])
  const [errorForm, setErrorForm] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [oldData, setOldData] = useState<IpoForm[]>([])
  const [editingItem, setEditingItem] = useState<IpoForm>()
  const [pendingUpdateData, setPendingUpdateData] = useState<UpdateIpoState>({} as UpdateIpoState)

  // GRAPHQL
  const client = useApolloClient()
  const [appendNewIpos] = useMutation(APPEND_NEW_IPOS, {
    onCompleted: () => {
      getIpos()
      if (isOverridesUser) refetchViewHistoryCols()
      else refetchViewPendingChangeRequestCols()
    },
  })
  const [overrideData] = useMutation(OVERRIDE_COMPANY_DATA)

  // METHOD

  const addIpos = async (addState: IpoForm[]) => {
    if (!errorForm.length) {
      const ipos = addState.map((item: IpoForm) => ({
        amount: item.amount || null,
        went_public_on: item.went_public_on ? transformPostDate(item.went_public_on) : '',
        share_price: item.share_price || null,
        shares_outstanding: item.shares_outstanding || null,
        shares_sold: item.shares_sold || null,
        stock_exchange: item.stock_exchange || null,
        stock_symbol: item.stock_symbol || null,
        valuation: item.valuation || null,
      }))

      const input = {
        company_id: companyId || localstorage.get(LocalstorageFields.COMPANY_ID),
        ipos,
      }

      await appendNewIpos({
        variables: {
          input: {
            company_id: input.company_id ? +input.company_id : 0,
            ipos: input.ipos,
          },
        },
      })
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
        source: companySource,
      },
    ])
  }

  const onChangeRoundData = (index: number) => (state: IpoForm) => {
    let cloneState = [...addState]
    cloneState[index] = state
    localstorage.set(LocalstorageFields.COMPANY_IPOS, JSON.stringify(cloneState))
    setAddState([...cloneState])
  }

  const onChangeRoundEditData = (index: number) => (state: IpoForm) => {
    if (index === -1) return
    let cloneState = [...editState]
    cloneState[index] = state
    setEditState([...cloneState])
  }

  const onUpdateIpo = async (records: OverridesCompanyDataInput[], isAppendData = false) => {
    if (!checkTimeETL()) return
    if (!records?.length) return
    const input = records.map(record => {
      return { ...record, companyId: +companyId }
    })

    await overrideData({ variables: { input, isAppendData } })

    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
  }

  const getIpos = React.useCallback(async () => {
    setIsLoading(true)
    const result = await client.query({
      query: GET_COMPANY_IPOS,
      variables: { companyId: +companyId },
      fetchPolicy: 'network-only',
    })
    const resData = result?.data?.getCompanyIpos.map((item: any) => ({
      ...item,
      valuation: item.valuation?.value,
      share_price: item.share_price?.value,
      amount: item.amount?.value,
      went_public_on: item.went_public_on
        ? moment(item.went_public_on).format(DEFAULT_VIEW_DATE_FORMAT)
        : null,
    })) as IpoForm[]

    setEditState(resData)
    setOldData(resData)
    setIsLoading(false)
  }, [client, companyId])

  const updateStatus = (id: string | number, newStatus: EnumExpandStatus) => {
    const mapFn = (item: IpoForm) => {
      return item.ipo_id === id ? { ...item, expandStatus: newStatus } : item
    }
    setEditState(editState.map(mapFn))
    setOldData(oldData.map(mapFn))
  }

  const handleUnfollowRound = async (reasonInput: UpdateStatusInput1, el: IpoForm) => {
    const { id, reason, status: newStatus } = reasonInput

    const input = {
      id: id,
      companyId: +companyId,
      reason: reason,
      tableName: TableNames.IPO,
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
        updateStatus(el.ipo_id || '', newStatus)
      }
    } catch (error) {
      props.setError(error)
    }
  }

  const {
    PendingCRModal,
    overviewPendingRequest,
    showPendingChangeRequest,
    handleClickShowPendingCR,
    refetchViewPendingChangeRequestCols,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleAfterReject: () => {
      getIpos()
    },
    handleApproveUpdateNewData: async data => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        updateStatus(
          data.rowId || '',
          Value2LabelPipe(expandStatus, data.newValue) as EnumExpandStatus
        )
      } else {
        await getIpos()
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

  const handleUpdateIpo = async (editingItem: IpoForm, pendingUpdateData: UpdateIpoState) => {
    try {
      setIsUpdating(true)
      const records = [...Object.values(pendingUpdateData)].filter(
        (item: OverridesCompanyDataInput) =>
          trimTheString(item.newValue) !== trimTheString(item.oldValue)
      )
      if (!!records?.length) {
        await onUpdateIpo(records, editingItem?.expandStatus === EnumExpandStatus.CHANGE_REQUEST)
        getIpos()
      } else {
        const idx = editState.findIndex(item => item.ipo_id === editingItem.ipo_id)
        if (idx !== -1) onChangeRoundEditData(idx!)(oldData[idx!])
      }
    } catch (err) {
      props.setError(err)
    } finally {
      setEditingItem(undefined)
      setIsUpdating(false)
    }
  }

  // EFFECTS
  useEffect(() => {
    getIpos()
  }, [getIpos])

  useEffect(() => {
    if (rowId && isFirstRun) {
      const ipo = oldData.find(e => e.ipo_id === rowId)
      if (ipo?.ipo_id) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(ipo?.ipo_id || ''))
          if (
            !viewPendingCQFn({
              tableName: TableNames.IPO,
              columnName: ColumnNames.FCT_STATUS_ID,
              rowId: ipo.ipo_id as string,
              source: ipo.source || '',
              companyId: +companyId,
            })
          ) {
            setEditingItem(ipo)
          }
          isFirstRun = false
        }, 0)
      }
    }
  }, [oldData, rowId, viewPendingCQFn, companyId])

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
              ...(isEdit ? { bg: 'transparent', px: 0, mt: -5 } : { bg: 'white', p: 5, mt: 5 }),
              maxWidth: 'none',
            }}
          >
            {(editState || []).map(el => {
              const overrideIdentity = {
                tableName: TableNames.IPO,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: el.ipo_id as string,
                source: el.source as string,
                companyId: +companyId,
              }
              return (
                <Box id={el.ipo_id} key={el.ipo_id}>
                  <IpoRoundItem
                    {...roundProps}
                    sx={{ mb: 5 }}
                    ipo={el}
                    unfollowIpoRound={input => handleUnfollowRound(input, el)}
                    buttons={[
                      {
                        label: 'Edit',
                        action: async () => {
                          if (!checkTimeETL()) return
                          setEditingItem(el)
                          setPendingUpdateData({} as UpdateIpoState)
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
                <IpoRound
                  {...roundProps}
                  sx={{ border: '2px solid black' }}
                  key={index}
                  ipo={el}
                  onRemove={() => onRemoveRound(index)}
                  onChangeRoundData={onChangeRoundData(index)}
                  companyId={companyId}
                  errorForm={errorForm}
                  setErrorForm={(errorFields: IpoFieldNameKeys[]) => {
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
              label={copy.buttons.addIpoRound}
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
            buttons={[
              {
                label: copy.buttons.backToCompanyRecord,
                variant: 'outlineWhite',
                onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
              },
            ]}
          />
        </>
      )}

      {editingItem && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.ipos.modals.cancel,
              disabled: isUpdating,
              type: 'secondary',
              action: () => {
                setEditingItem(undefined)
                const idx = editState.findIndex(item => item.ipo_id === editingItem.ipo_id)
                if (idx !== -1) onChangeRoundEditData(idx!)(oldData[idx!])
              },
            },
            {
              label: copy.ipos.modals.save,
              disabled: isUpdating,
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                await handleUpdateIpo(editingItem, pendingUpdateData)
              },
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            Edit IPO
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh' }}>
            <IpoRound
              {...roundProps}
              sx={{ m: 0, py: 0 }}
              isEdit={true}
              ipo={editState.find(item => item.ipo_id === editingItem?.ipo_id)!}
              onChangeRoundData={onChangeRoundEditData(
                editState.findIndex(item => item.ipo_id === editingItem.ipo_id)
              )}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              oldData={oldData.find(({ ipo_id }) => ipo_id === editingItem.ipo_id)}
              setOldData={(round: IpoForm) => {
                setOldData(oldData.map(item => (item.ipo_id === editingItem.ipo_id ? round : item)))
              }}
              setPendingUpdateData={setPendingUpdateData}
              pendingUpdateData={pendingUpdateData}
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
              label: copy.ipos.modals.cancel,
              disabled: isUpdating,
              type: 'secondary',
              action: () => setAddState([]),
            },
            {
              label: copy.ipos.modals.addIpoRound,
              disabled: isUpdating || !!errorForm.length,
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setIsUpdating(true)
                  await addIpos(addState)
                } catch (err) {
                  console.log(err)
                } finally {
                  setIsUpdating(false)
                  setAddState([])
                }
              },
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            Add IPO
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh' }}>
            <IpoRound
              {...roundProps}
              sx={{ m: 0, py: 0 }}
              ipo={addState[0]}
              onChangeRoundData={onChangeRoundData(0)}
              companyId={companyId}
              errorForm={errorForm}
              setErrorForm={(errorFields: IpoFieldNameKeys[]) => {
                let cloneError = [...errorForm]
                if (!!errorFields?.length && !errorForm?.includes(0)) {
                  cloneError?.push(0)
                } else if (!errorFields.length && cloneError.indexOf(0) > -1)
                  cloneError?.splice(cloneError.indexOf(0), 1)
                setErrorForm && setErrorForm(cloneError)
              }}
              showViewHistory={(...args) => false}
              refetchViewHistoryCols={undefined}
            />
          </Box>
        </Modal>
      )}

      <PendingCRModal />
    </>
  )
}

export default Ipos
