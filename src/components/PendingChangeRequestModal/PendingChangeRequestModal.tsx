import { Box } from '@theme-ui/components'
import React from 'react'
import { Flex } from 'theme-ui'
import { Button, Modal, Updating } from '../../components'
import { ButtonType } from '../../components/Modal/Modal'
import { ConfirmChangeRequest, PendingChangeRequest } from '../../components/PendingChangeRequest'
import { IPengdingCQData } from '../../components/PendingChangeRequest/PendingChangeRequest'
import { Heading } from '../../components/primitives'
import { IHandleActionPendingCRFn } from '../../hooks/useChangeRequest'
import { EnumVariantKeys } from '../../types/enums'

export enum StateModalEnum {
  ApproveRejectScreen = 1,
  ConfirmScreen = 2,
}

export type Props = {
  onPressOK(rejectReason: string): void
  onPressCancel(refetch: boolean): void
  handleActionPendingCR: IHandleActionPendingCRFn
  setError(error: Error): void
  loading: boolean
  data: IPengdingCQData[]
  isSaving: boolean
  stateModal: any
  setStateModal: any
  confirmApproved: IPengdingCQData[]
  setConfirmApproved: any
  confirmReject: IPengdingCQData[]
  setConfirmReject: any
  isCanApproveOrDecline: boolean
}

export const PendingChangeRequestModal = (props: Props) => {
  const {
    loading,
    data,
    onPressCancel,
    handleActionPendingCR,
    isSaving,
    stateModal,
    setStateModal,
    confirmApproved,
    setConfirmApproved,
    confirmReject,
    setConfirmReject,
    isCanApproveOrDecline,
    onPressOK,
  } = props

  const [rejectReason, setRejectReason] = React.useState('')

  const dataShow =
    data?.filter(
      s => ![...confirmApproved, ...confirmReject].some(c => c.dataOverrideId === s.dataOverrideId)
    ) || []

  const clearSelection = () => {
    setConfirmApproved([])
    setConfirmReject([])
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
        maxWidth: '70vw',
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
      {stateModal === StateModalEnum.ApproveRejectScreen && !loading && (
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
            onPressCancel(false)
          }}
        />
      )}
      {stateModal === StateModalEnum.ApproveRejectScreen && (
        <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
          <PendingChangeRequest
            loading={loading}
            data={dataShow}
            isCanApproveOrDecline={isCanApproveOrDecline}
            handleActionPendingCR={handleActionPendingCR}
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
                clearSelection()
                setRejectReason('')
                setStateModal(StateModalEnum.ApproveRejectScreen)
              },
              type: EnumVariantKeys.secondary,
              visible: stateModal === StateModalEnum.ConfirmScreen && data?.length,
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
                onPressCancel(false)
                clearSelection()
                setStateModal(StateModalEnum.ApproveRejectScreen)
              },
              type: 'secondary',
              visible: stateModal === StateModalEnum.ConfirmScreen,
              disabled: loading,
            },
            {
              label: stateModal === StateModalEnum.ApproveRejectScreen ? 'OK' : 'Confirm',
              action: async () => {
                await onPressOK(rejectReason)
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
    </Modal>
  )
}
export default PendingChangeRequestModal
