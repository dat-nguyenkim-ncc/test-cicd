import { Box } from '@theme-ui/components'
import React, { useState } from 'react'
import { Flex } from 'theme-ui'
import { Button, Modal, Updating } from '../../components'
import { ErrorModal } from '../../components/ErrorModal'
import { ButtonType } from '../../components/Modal/Modal'
import { ConfirmChangeRequest, PendingChangeRequest } from '../../components/PendingChangeRequest'
import { IPengdingCQData } from '../../components/PendingChangeRequest/PendingChangeRequest'
import { Heading } from '../../components/primitives'
import { UserContext } from '../../context'
import { IHandleActionPendingCRFn } from '../../hooks/useChangeRequest'
import { onError } from '../../sentry'
import { EnumUserGroups, EnumVariantKeys } from '../../types/enums'

enum StateModalEnum {
  ApproveRejectScreen = 1,
  ConfirmScreen = 2,
}

export type Props = {
  loading: boolean
  data: IPengdingCQData[]
  onPressOK(refetch: boolean): void
  handleApproveUpdateNewData(data: IPengdingCQData): Promise<void> | void
  handleActionPendingCR: IHandleActionPendingCRFn
  setIsSaving(v: boolean): void
  isSaving: boolean
  setError(error: Error): void
  // setRejectReason(s: string): void
  // rejectReason: string
  approvedCR?: IPengdingCQData
  rejectCR?: IPengdingCQData[]
}

export const PendingChangeRequestModal = (props: Props) => {
  const { user } = React.useContext(UserContext)

  const {
    loading,
    data,
    onPressOK,
    handleApproveUpdateNewData,
    handleActionPendingCR,
    isSaving,
    setIsSaving,
    approvedCR,
    rejectCR,
  } = props

  const [stateModal, setStateModal] = useState<StateModalEnum>(StateModalEnum.ApproveRejectScreen)
  const [confirmApproved, setConfirmApproved] = useState<IPengdingCQData[]>([])

  const [confirmReject, setConfirmReject] = useState<IPengdingCQData[]>([])
  React.useEffect(() => {
    setStateModal(
      approvedCR || (rejectCR && data.length === rejectCR.length)
        ? StateModalEnum.ConfirmScreen
        : StateModalEnum.ApproveRejectScreen
    )
    setConfirmApproved(approvedCR ? [approvedCR] : [])
    setConfirmReject(
      (approvedCR && rejectCR) || (rejectCR && data.length === rejectCR.length) ? rejectCR : []
    )
  }, [approvedCR, rejectCR, data])

  const [rejectReason, setRejectReason] = React.useState('')

  const [error, setError] = React.useState<string | undefined>()

  const dataShow =
    data?.filter(
      s => ![...confirmApproved, ...confirmReject].some(c => c.dataOverrideId === s.dataOverrideId)
    ) || []

  const isCanApproveOrDecline = user?.groups?.every(g => g.name !== EnumUserGroups.KT)

  const handlePressOK = async () => {
    try {
      if (stateModal === StateModalEnum.ApproveRejectScreen) {
        if (!isCanApproveOrDecline) {
          await onPressOK(true)
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
              dataOverrideId: approveItem.dataOverrideId,
            } as IPengdingCQData,
            [approveItem],
            rejectReason,
            true
          )
          await handleApproveUpdateNewData(confirmApproved[0])
        } else if (confirmReject.length > 0) {
          await handleActionPendingCR(
            {
              tableName: confirmReject[0].tableName,
              columnName: confirmReject[0].columnName,
              companyId: +confirmReject[0].companyId,
              rowId: confirmReject[0].rowId,
              source: confirmReject[0].source,
              dataOverrideId: confirmReject[0].dataOverrideId,
            } as IPengdingCQData,
            confirmReject,
            rejectReason,
            false
          )
        }
        await onPressOK(true)
      }
    } catch (error) {
      setError(error.message)
      onError(error)
      setIsSaving(false)
    }
  }

  if (isSaving)
    return (
      <Modal sx={{ width: 500 }}>
        <Updating loading noPadding text="Saving" />
      </Modal>
    )

  return (
    <Modal
      sx={{
        p: 5,
        maxWidth: '60vw',
        alignItems: 'flex-start',
        minWidth: '900px',
        position: 'relative',
      }}
    >
      <Heading sx={{ fontWeight: 600, mb: 4, flex: 11 }} as={'h4'}>
        {stateModal === StateModalEnum.ApproveRejectScreen
          ? `Pending Request ${dataShow?.length ? `(${dataShow?.length || 0})` : ''}`
          : `Confirmation`}
      </Heading>
      {stateModal === StateModalEnum.ApproveRejectScreen && (
        <Button
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
          }}
          icon="remove"
          size="tiny"
          variant="black"
          onPress={() => {
            onPressOK(false)
          }}
        />
      )}
      {stateModal === StateModalEnum.ApproveRejectScreen && (
        <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
          <PendingChangeRequest
            loading={loading}
            data={dataShow}
            isCanApproveOrDecline={isCanApproveOrDecline}
            handleActionPendingCR={async (requestInfo, changeRequests, rejectReason, isAprrove) => {
              try {
                setIsSaving(true)
                await handleActionPendingCR(requestInfo, changeRequests, rejectReason, isAprrove)
                onPressOK(true)
                setIsSaving(false)
              } catch (error) {
                setError(error.message)
                onError(error)
                setIsSaving(false)
              }
            }}
            handleRejectAll={() => {
              setConfirmReject(data)
              setStateModal(StateModalEnum.ConfirmScreen)
            }}
            actionItem={(isApproved: boolean, item: IPengdingCQData) => {
              if (item)
                if (isApproved) {
                  setConfirmApproved(data.filter(s => s.dataOverrideId === item.dataOverrideId))
                  setConfirmReject(data.filter(s => s.dataOverrideId !== item.dataOverrideId))

                  setStateModal(StateModalEnum.ConfirmScreen)
                } else {
                  const newRejectItems = [...confirmReject, item]
                  setConfirmReject(newRejectItems)
                  if ([...newRejectItems, ...confirmApproved].length === data?.length) {
                    setStateModal(StateModalEnum.ConfirmScreen)
                  }
                }
            }}
          />
        </Box>
      )}
      {stateModal === StateModalEnum.ConfirmScreen && isCanApproveOrDecline && (
        <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
          <ConfirmChangeRequest
            itemApproveds={confirmApproved}
            itemDeclineds={confirmReject}
            setRejectReason={setRejectReason}
            rejectReason={rejectReason}
          />
        </Box>
      )}
      <Flex sx={{ justifyContent: 'space-between', width: '100%', mt: 25, flex: 1 }}>
        <Flex sx={{ justifyContent: 'flex-start', flex: 1 }}>
          {[
            {
              label: 'Back',
              action: () => {
                setConfirmApproved([])
                setConfirmReject([])
                setRejectReason('')
                setStateModal(StateModalEnum.ApproveRejectScreen)
              },
              type: EnumVariantKeys.secondary,
              visible: stateModal === StateModalEnum.ConfirmScreen,
              disabled: loading,
              sx: { pl: 0 },
            } as ButtonType,
          ]
            .filter(s => s.visible)
            .map(b => (
              <Button
                key={b.label}
                sx={{ ...b.sx }}
                variant={b.type}
                label={b.label}
                onPress={b.action}
                disabled={b.disabled}
                icon={b.icon}
              />
            ))}
        </Flex>

        <Flex sx={{ justifyContent: 'flex-end', flex: 1 }}>
          {([
            {
              label: 'Cancel',
              action: () => {
                onPressOK(false)
                setStateModal(StateModalEnum.ApproveRejectScreen)
              },
              type: 'secondary',
              visible: stateModal === StateModalEnum.ConfirmScreen,
              disabled: loading,
            },
            {
              label: stateModal === StateModalEnum.ApproveRejectScreen ? 'OK' : 'Confirm',
              action: async () => {
                await handlePressOK()
              },
              type: 'primary',
              disabled:
                loading ||
                (confirmApproved.length === 0 && confirmReject.length === 0) ||
                (stateModal === StateModalEnum.ConfirmScreen &&
                  confirmReject.length &&
                  !rejectReason),
              visible: isCanApproveOrDecline,
            },
          ] as ButtonType[])
            .filter(s => s.visible)
            .map(b => (
              <Button
                key={b.label}
                sx={{ ...b.sx, p: '10px 60px' }}
                variant={b.type}
                label={b.label}
                onPress={b.action}
                disabled={b.disabled}
                icon={b.icon}
              />
            ))}
        </Flex>
      </Flex>
      {error && (
        <ErrorModal
          message={error}
          onOK={() => {
            onPressOK(true)
          }}
        />
      )}
    </Modal>
  )
}
