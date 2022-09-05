import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client'
import { Box, Text } from '@theme-ui/components'
import React from 'react'
import { FormConfirm, Modal } from '../components'
import { IPengdingCQData } from '../components/PendingChangeRequest/PendingChangeRequest'
import { getPendingCRgql } from '../pages/CompanyForm/graphql'
import {
  APPROVE_PENDING_REQUEST,
  DeclineChangeRequestInput,
  DECLINE_PENDING_REQUEST,
  GET_PENDING_CR_BY_ID,
} from '../pages/CompanyForm/graphql/pendingChangeRequests'
import { EnumReverseApiSource, EnumUserGroups } from '../types/enums'
import { GetCompanyOverrideInput } from '../types'
import { onError } from '../sentry'
import { ErrorModal } from '../components/ErrorModal'
import { SourceIndependentTables, transformPostDate } from '../pages/CompanyForm/helpers'
import { HasHistoryField, HasPendingCQField } from '../pages/CompanyForm/CompanyForm'
import { UserContext } from '../context'
import { PendingChangeRequestModal } from '../components'
import { StateModalEnum } from '../components/PendingChangeRequestModal/PendingChangeRequestModal'
import { isDateColumns } from '../components/OverridesHistory/OverridesHistory'

export type OpenConfirmMetadata = {
  isAppendData?: boolean
  isApprove: boolean
}

export type IShowPendingChangeRequest = (
  tableName: string,
  name: string,
  rowId: string,
  source?: string
) => boolean

export type IHandleActionPendingCRFn = (
  requestInfo: GetCompanyOverrideInput,
  changeRequests: IPengdingCQData[],
  rejectReason: string,
  isAprrove: boolean
) => Promise<void>

export type HandleAfterApproveData = {
  tableName: string
  columnName: string
  rowId: string
  newValue: string
  comment?: string
}

type Props = {
  refetchViewHistoryCols?(): void
  handleApproveUpdateNewData(
    data: HandleAfterApproveData,
    isAppendData?: boolean
  ): Promise<void> | void
  handleAfterReject?(data: GetCompanyOverrideInput, isAppendData?: boolean): Promise<void> | void
  handleAfterApprove?(input: { item: { tableName: string } }): Promise<void> | void
  defaultSource: string
  companyId: number
}

const errorNoRecord = 'Unable to carry out request as this change request has already been handled'

export default function useChangeRequest(props: Props) {
  const {
    refetchViewHistoryCols = () => {},
    handleAfterReject = () => {},
    handleApproveUpdateNewData,
    handleAfterApprove = () => {},
    defaultSource,
    companyId,
  } = props

  const { user } = React.useContext(UserContext)
  const isCanApproveOrDecline = user?.groups?.every(g => g.name !== EnumUserGroups.KT)

  const { data: pcrByCompanyId, refetch: refetchViewPendingChangeRequestCols } = useQuery<{
    getPendingCRByCompanyId: Array<HasPendingCQField>
  }>(GET_PENDING_CR_BY_ID, {
    variables: { companyId: +companyId },
    skip: !companyId,
  })

  const [getPendingCR, { loading: getCRLoading, data: getCRData }] = useLazyQuery(getPendingCRgql, {
    fetchPolicy: 'no-cache',
  })
  const pendingCRData: IPengdingCQData[] = getCRData?.getCompanyPendingChangeRequest || []
  const overviewPendingRequest = React.useMemo(
    () => pcrByCompanyId?.getPendingCRByCompanyId || [],
    [pcrByCompanyId]
  )

  const [loading, setLoading] = React.useState(false)
  const [pendingCRModal, setPendingCRModal] = React.useState(false)
  const [isCancelChangeRequest, setCancelChangeRequest] = React.useState(false)
  const [dataOvrIdsForCancel, setDataOvrIdsForCancel] = React.useState<
    | { dataOverrideIds: number[]; requestInfo: GetCompanyOverrideInput; isAppendData: boolean }
    | undefined
  >()
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, _setError] = React.useState('')
  const [approveError, setApproveError] = React.useState<string | undefined>('')
  const setError = (e?: Error) => {
    onError(e)
    _setError(e?.message || '')
  }

  const [stateModal, setStateModal] = React.useState<StateModalEnum>(
    StateModalEnum.ApproveRejectScreen
  )
  const [confirmApproved, setConfirmApproved] = React.useState<IPengdingCQData[]>([])
  const [confirmReject, setConfirmReject] = React.useState<IPengdingCQData[]>([])

  const [updateNewData, setUpdateNewData] = React.useState<IPengdingCQData[]>([])
  const [companyOverrideInput, setCompanyOverrideInput] = React.useState<GetCompanyOverrideInput>()

  const [isAppendData, setIsAppendData] = React.useState(false)
  const client = useApolloClient()

  const showPendingChangeRequest = (
    tableName: string,
    name: string,
    rowId: string,
    source: string = EnumReverseApiSource[defaultSource as keyof typeof EnumReverseApiSource]
  ) => {
    return (
      overviewPendingRequest?.filter(
        x =>
          x.tableName === tableName &&
          x.columnName === name &&
          x.rowId === rowId &&
          (SourceIndependentTables.includes(tableName)
            ? true
            : x.source === source || x.source === 'NA')
      )[0]?.total > 0
    )
  }

  const handleClickShowPendingCR = async (input: GetCompanyOverrideInput) => {
    setCompanyOverrideInput(input)
    setPendingCRModal(true)
    setIsSaving(false)
    getPendingCR({ variables: { input: { ...input, companyId: +(input.companyId || companyId) } } })
  }

  const refetch = React.useCallback(
    async (requestInfo: GetCompanyOverrideInput) => {
      if (requestInfo) {
        await Promise.all([
          getPendingCR({
            variables: {
              input: {
                tableName: requestInfo.tableName,
                columnName: requestInfo.columnName,
                companyId: +requestInfo.companyId,
                rowId: requestInfo.rowId,
                source: requestInfo.source,
              },
            },
          }),
          refetchViewHistoryCols && refetchViewHistoryCols(),
          refetchViewPendingChangeRequestCols(),
        ])
      }
    },
    [refetchViewHistoryCols, refetchViewPendingChangeRequestCols, getPendingCR]
  )

  const declinePendingCR = React.useCallback(
    async (
      dataOverrideIds: number[],
      rejectReason: string,
      meta?: { requestInfo?: GetCompanyOverrideInput; isAppendData?: boolean }
    ) => {
      await client.mutate<any, { input: DeclineChangeRequestInput }>({
        mutation: DECLINE_PENDING_REQUEST,
        variables: {
          input: {
            dataOverrideIds,
            reason: rejectReason,
          },
        },
      })
      if (meta?.requestInfo) {
        await handleAfterReject(meta?.requestInfo, !!meta?.isAppendData)
      }
    },
    [client, handleAfterReject]
  )

  const approvePendingRequest = React.useCallback(
    async input => {
      await client.mutate({
        mutation: APPROVE_PENDING_REQUEST,
        variables: { input },
      })
      await handleAfterApprove(input)
    },
    [client, handleAfterApprove]
  )

  const handleActionPendingCR = React.useCallback(
    async (
      requestInfo: GetCompanyOverrideInput,
      changeRequests: IPengdingCQData[] = [],
      rejectReason: string,
      isAprrove?: boolean
    ) => {
      try {
        setUpdateNewData(changeRequests)
        if (isAprrove) {
          const changeRequest = changeRequests[0]

          if (changeRequest) {
            const isDate = isDateColumns(changeRequest.columnName)
            await approvePendingRequest({
              item: {
                tableName: changeRequest.tableName,
                columnName: changeRequest.columnName,
                reason: changeRequest.comment,
                oldValue:
                  isDate && changeRequest.oldValue
                    ? transformPostDate(changeRequest.oldValue)
                    : changeRequest.oldValue,
                newValue:
                  isDate && changeRequest.newValue
                    ? transformPostDate(changeRequest.newValue)
                    : changeRequest.newValue,
                companyId,
                id: requestInfo.rowId,
                source: changeRequest.source,
                dataOverrideId: changeRequest.dataOverrideId,
              },
              reason: rejectReason,
            })
          }
        } else {
          const dataOverrideIds = changeRequests.map(item => item.dataOverrideId)
          if (changeRequests.length === 1 && changeRequests[0].user === user.email) {
            setDataOvrIdsForCancel({ dataOverrideIds, requestInfo, isAppendData })
            setCancelChangeRequest(true)
            setPendingCRModal(false)
          } else {
            await declinePendingCR(dataOverrideIds, rejectReason, { isAppendData, requestInfo })
          }
        }
      } catch (error) {
        setApproveError(error.message)
        throw error
      } finally {
        setIsAppendData(false)
        setConfirmApproved([])
        setConfirmReject([])
        setStateModal(StateModalEnum.ApproveRejectScreen)
      }
    },
    [
      user.email,
      companyId,
      approvePendingRequest,
      declinePendingCR,
      setDataOvrIdsForCancel,
      setCancelChangeRequest,
      setPendingCRModal,
      isAppendData,
    ]
  )

  const onAllowCancelCR = React.useCallback(async () => {
    try {
      await declinePendingCR(dataOvrIdsForCancel?.dataOverrideIds || [], '', {
        isAppendData: dataOvrIdsForCancel?.isAppendData,
        requestInfo: dataOvrIdsForCancel?.requestInfo,
      })
      setDataOvrIdsForCancel(undefined)
      setCancelChangeRequest(false)
      if (!dataOvrIdsForCancel?.isAppendData) {
        setPendingCRModal(true)
        dataOvrIdsForCancel?.requestInfo && refetch(dataOvrIdsForCancel?.requestInfo)
      }
    } catch (error) {
      setError(error)
      setCancelChangeRequest(false)
    }
  }, [
    declinePendingCR,
    setDataOvrIdsForCancel,
    setCancelChangeRequest,
    setPendingCRModal,
    refetch,
    dataOvrIdsForCancel,
  ])

  const onCancelChangeRequest = (isAppendData: boolean = false) => {
    setDataOvrIdsForCancel(undefined)
    setCancelChangeRequest(false)
    !isAppendData && setPendingCRModal(true)
  }

  const onOpenConfirmModal = React.useCallback(
    async (
      companyId: number,
      input: GetCompanyOverrideInput,
      dataOverrideIds: number[],
      { isApprove, isAppendData }: OpenConfirmMetadata
    ) => {
      setIsAppendData(!!isAppendData)
      setPendingCRModal(true)
      try {
        setLoading(true)
        const { data } = await client.query<{ getCompanyPendingChangeRequest: IPengdingCQData[] }>({
          query: getPendingCRgql,
          variables: { input },
        })
        setCompanyOverrideInput(input)

        const pendingCRData: IPengdingCQData[] = data?.getCompanyPendingChangeRequest || []
        const items = pendingCRData.filter(item => dataOverrideIds.includes(item.dataOverrideId))
        if (items.length) {
          if (!isApprove && items.length === 1 && items[0].user === user.email) {
            setDataOvrIdsForCancel({
              dataOverrideIds,
              requestInfo: {
                tableName: items[0].tableName,
                columnName: items[0].columnName,
                companyId: +companyId,
                rowId: items[0].rowId,
              },
              isAppendData: !!isAppendData,
            })
            setCancelChangeRequest(true)
            setPendingCRModal(false)
          } else {
            setConfirmApproved(isApprove ? items : [])
            setConfirmReject(
              isApprove
                ? pendingCRData.filter(item => !dataOverrideIds.includes(item.dataOverrideId))
                : items
            )

            setStateModal(StateModalEnum.ConfirmScreen)
          }
        }
      } catch (error) {
        setError(error)
        setPendingCRModal(false)
      } finally {
        setLoading(false)
      }
    },
    [client, user.email]
  )

  const handlePressCancel = React.useCallback(
    async (refetch: boolean) => {
      try {
        setIsSaving(true)
        if (refetch) {
          await Promise.all([refetchViewPendingChangeRequestCols(), refetchViewHistoryCols()])
        }
        setPendingCRModal(false)
      } catch (error) {
        setError(error)
      } finally {
        setIsSaving(false)
      }
    },
    [refetchViewHistoryCols, refetchViewPendingChangeRequestCols]
  )

  const handlePressOK = React.useCallback(
    async (rejectReason: string) => {
      try {
        if (stateModal === StateModalEnum.ApproveRejectScreen) {
          if (!isCanApproveOrDecline) {
            await handlePressCancel(true)
          } else {
            setStateModal(StateModalEnum.ConfirmScreen)
          }
        } else if (stateModal === StateModalEnum.ConfirmScreen) {
          setIsSaving(true)

          if (confirmApproved.length > 0) {
            const approveItem = confirmApproved[0]
            await handleActionPendingCR(
              {
                tableName: approveItem.tableName,
                columnName: approveItem.columnName,
                companyId: +approveItem.companyId,
                rowId: approveItem.rowId,
                source: approveItem.source,
              },
              confirmApproved,
              rejectReason,
              true
            )
            await handleApproveUpdateNewData(confirmApproved[0], isAppendData)
          } else if (confirmReject.length > 0) {
            await handleActionPendingCR(
              {
                tableName: confirmReject[0].tableName,
                columnName: confirmReject[0].columnName,
                companyId: +confirmReject[0].companyId,
                rowId: confirmReject[0].rowId,
                source: confirmReject[0].source,
              },
              confirmReject,
              rejectReason,
              false
            )
          }
          await handlePressCancel(true)
        }
      } catch (error) {
        onError(error)
        setIsSaving(false)
      }
    },
    [
      confirmApproved,
      confirmReject,
      handleActionPendingCR,
      handleApproveUpdateNewData,
      handlePressCancel,
      isCanApproveOrDecline,
      stateModal,
      isAppendData,
    ]
  )

  const handleAppendDataCQAction = React.useCallback(
    async (identity: HasHistoryField, isApprove: boolean) => {
      const pending = overviewPendingRequest?.filter(
        r =>
          r.tableName === identity.tableName &&
          r.rowId === identity.rowId &&
          (SourceIndependentTables.includes(identity.tableName) || r.source === identity.source)
      )

      if (pending?.length) {
        onOpenConfirmModal(
          +companyId,
          { ...identity, companyId: +companyId },
          pending.map(item => item.dataOverrideId),
          {
            isApprove,
            isAppendData: true,
          }
        )
      }
    },
    [overviewPendingRequest, companyId, onOpenConfirmModal]
  )

  const PendingCRModal = React.useCallback(() => {
    return (
      <>
        {pendingCRModal && (
          <PendingChangeRequestModal
            data={pendingCRData}
            loading={getCRLoading || loading}
            isCanApproveOrDecline={isCanApproveOrDecline}
            setError={setError}
            isSaving={isSaving}
            onPressCancel={async refetch => {
              if (!getCRLoading && !loading) {
                if (!pendingCRData.length) {
                  setLoading(true)
                  await Promise.all([
                    refetchViewPendingChangeRequestCols(),
                    refetchViewHistoryCols(),
                  ]).then((res: any) => {
                    if (res[1]?.data?.getCompanyOverridesByCompanyId) {
                      const dataUpdated = res[1].data.getCompanyOverridesByCompanyId.find(
                        (item: any) =>
                          item.rowId === companyOverrideInput?.rowId &&
                          item.columnName === companyOverrideInput?.columnName
                      )
                      if (dataUpdated) {
                        handleApproveUpdateNewData(dataUpdated, true)
                      } else if (
                        companyOverrideInput &&
                        !res[0].data.getPendingCRByCompanyId.find(
                          (item: any) =>
                            item.rowId === companyOverrideInput?.rowId &&
                            item.columnName === companyOverrideInput?.columnName
                        )
                      ) {
                        handleAfterReject(
                          {
                            tableName: companyOverrideInput.tableName,
                            columnName: companyOverrideInput.columnName,
                            companyId: +companyOverrideInput.companyId,
                            rowId: companyOverrideInput.rowId,
                            source: companyOverrideInput.source,
                          },
                          !!isAppendData
                        )
                      }
                    }
                  })
                  setLoading(false)
                } else if (
                  isAppendData &&
                  !confirmApproved.length &&
                  !confirmReject.length &&
                  companyOverrideInput
                ) {
                  await handleAfterReject(
                    {
                      tableName: companyOverrideInput.tableName,
                      columnName: companyOverrideInput.columnName,
                      companyId: +companyOverrideInput.companyId,
                      rowId: companyOverrideInput.rowId,
                      source: companyOverrideInput.source,
                    },
                    !!isAppendData
                  )
                }
              }
              handlePressCancel(refetch)
            }}
            onPressOK={handlePressOK}
            handleActionPendingCR={handleActionPendingCR}
            stateModal={stateModal}
            setStateModal={setStateModal}
            confirmApproved={confirmApproved}
            setConfirmApproved={setConfirmApproved}
            confirmReject={confirmReject}
            setConfirmReject={setConfirmReject}
          />
        )}

        {isCancelChangeRequest && (
          <Modal
            sx={{
              p: 4,
              maxWidth: '60vw',
              alignItems: 'flex-start',
              minWidth: '480px',
            }}
          >
            <Box sx={{ p: 3, width: '100%' }}>
              <FormConfirm
                onConfirm={onAllowCancelCR}
                onCancel={() => onCancelChangeRequest(isAppendData)}
                color="gold"
                bgColor="bgGold"
                textConfirm="Swipe to Cancel"
              >
                <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
                  Are you sure to cancel your
                  <span style={{ fontWeight: 'bold' }}> Change Request ?</span>
                </Text>
              </FormConfirm>
            </Box>
          </Modal>
        )}
        {error && <ErrorModal message={error} onOK={() => _setError('')} />}
        {approveError && (
          <ErrorModal
            message={approveError}
            onOK={async () => {
              setApproveError(undefined)
              if (errorNoRecord === approveError) {
                await handleApproveUpdateNewData(updateNewData[0], true)
              }
              handlePressCancel(true)
            }}
          />
        )}
      </>
    )
  }, [
    isAppendData,
    handlePressOK,
    handlePressCancel,
    isCanApproveOrDecline,
    pendingCRModal,
    pendingCRData,
    getCRLoading,
    handleActionPendingCR,
    isCancelChangeRequest,
    onAllowCancelCR,
    isSaving,
    loading,
    error,
    stateModal,
    setStateModal,
    confirmApproved,
    setConfirmApproved,
    confirmReject,
    setConfirmReject,
    approveError,
    handleApproveUpdateNewData,
    updateNewData,
    companyOverrideInput,
    handleAfterReject,
    refetchViewHistoryCols,
    refetchViewPendingChangeRequestCols,
  ])

  return {
    showPendingChangeRequest,
    openPendingCRModel: () => setPendingCRModal(true),
    PendingCRModal,
    overviewPendingRequest: pcrByCompanyId?.getPendingCRByCompanyId || [],
    refetchViewPendingChangeRequestCols,
    getPendingCR,
    pendingCRData,
    getCRLoading,
    handleClickShowPendingCR,
    setCancelChangeRequest,
    setDataOvrIdsForCancel,
    onOpenConfirmModal,
    handleAppendDataCQAction,
  }
}
