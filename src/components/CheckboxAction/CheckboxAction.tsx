import React from 'react'
import { Flex } from 'theme-ui'
import { Checkbox } from '..'
import { EnumInvestor } from '../../types/enums'
import { ViewIdentity, ViewOverride } from '../FCTStatusAction/FCTStatusAction'
import ReasonPopover, { ReasonPopoverProps } from '../ReasonPopover'

export type Props = {
  identity: ViewIdentity
  isCheck: boolean
  reasonRequired?: boolean
  selfDeclared?: boolean
  users: string[]
  handleUpdateStatus(reason: string, identity: ViewIdentity): Promise<void> | void

  disabled?: boolean
  isHorizontal?: boolean | undefined
} & ViewOverride

export default function CheckboxAction({
  isCheck,
  identity,
  reasonRequired,
  handleUpdateStatus,
  viewPendingCQFn,
  viewHistoryFn,
  getNumPending,
  disabled,
  isHorizontal = false,
}: Props) {
  const [reason, setReason] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const reasonProps = {
    reasonRequired: reasonRequired,
    oldValue: isCheck ? EnumInvestor.LEAD : EnumInvestor.SUPPORT,
    newValue: !isCheck ? EnumInvestor.LEAD : EnumInvestor.SUPPORT,
    totalItemPendingCR: getNumPending(identity),
  } as ReasonPopoverProps

  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <ReasonPopover
        {...reasonProps}
        sx={
          isHorizontal
            ? {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }
            : {
                display: 'flex',
                flexDirection: 'column',
              }
        }
        disabled={disabled}
        viewSx={
          isHorizontal
            ? {
                flexDirection: 'column-reverse',
                gap: 1,
                mx: 3,
                justifyContent: 'flex-end',
                flex: 1,
              }
            : {
                flexDirection: 'column-reverse',
                gap: 1,
                mb: 3,
                justifyContent: 'flex-end',
                flex: 1,
                textAlign: 'right',
              }
        }
        reason={reason}
        setReason={setReason}
        viewHistory={viewHistoryFn(identity)}
        viewPendingChangeRequest={viewPendingCQFn(identity)}
        buttons={[
          {
            label: 'Save',
            isCancel: true,
            action: async () => {
              try {
                setLoading(true)
                await handleUpdateStatus(reason, identity)
              } finally {
                setReason('')
                setLoading(false)
              }
            },
            disabled: loading,
          },
        ]}
      >
        <Checkbox disabled={disabled} size="small" square checked={isCheck} onPress={() => {}} />
      </ReasonPopover>
    </Flex>
  )
}
