import React from 'react'
import { ViewInterface } from '../../types'
import { EnumExpandStatus } from '../../types/enums'
import ReasonSwitch, { Props as ReasonSwitchProps } from '../ReasonSwitch/ReasonSwitch'

export type FollowingActionProps = ViewInterface<{
  isFollowing: boolean
  onSave(reason: string): Promise<void>
  isHorizontal?: boolean | undefined
  disabled?: boolean
  hideSwitch?: boolean
}> &
  Omit<ReasonSwitchProps, 'switchProps'>

export default function FollowingAction(props: FollowingActionProps) {
  const [loading, setLoading] = React.useState(false)

  return (
    <ReasonSwitch
      isHorizontal={props.isHorizontal}
      disabled={props.disabled}
      switchProps={{
        checked: props.isFollowing,
        onToggle: () => {},
        disabled: props.disabled,
        hide: props.hideSwitch
      }}
      isLoading={loading}
      onSave={async (reason: string) => {
        try {
          setLoading(true)
          await props.onSave(reason)
        } finally {
          setLoading(false)
        }
      }}
      viewHistory={props.viewHistory}
      viewPendingChangeRequest={props.viewPendingChangeRequest}
      reasonProps={{
        ...props.reasonProps,
        oldValue: props.isFollowing ? EnumExpandStatus.FOLLOWING : EnumExpandStatus.UNFOLLOWED,
        newValue: props.isFollowing ? EnumExpandStatus.UNFOLLOWED : EnumExpandStatus.FOLLOWING,
      }}
    />
  )
}
