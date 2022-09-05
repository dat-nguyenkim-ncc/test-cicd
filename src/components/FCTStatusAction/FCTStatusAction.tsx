import React from 'react'
import { ETLRunTimeContext, UserContext } from '../../context'
import { changeRequestActionDisabled } from '../../pages/CompanyForm/helpers'
import { IHandleAppendDataCQAction } from '../../pages/CompanyForm/provider/CompanyContext'
import { EnumExpandStatus, EnumExpandStatusId } from '../../types/enums'
import ChangeRequestAction from './ChangeRequestAction'
import FollowingAction, { FollowingActionProps } from './FollowingAction'

export type ViewIdentity = {
  tableName: string
  columnName: string
  rowId: string
  source: string
}

export type ViewOverride = {
  viewPendingCQFn(identity: ViewIdentity): (() => void) | undefined
  viewHistoryFn(identity: ViewIdentity): (() => void) | undefined
  getNumPending(identity: ViewIdentity): number
}

export type Props = {
  identity: ViewIdentity
  fctStatusId: EnumExpandStatus | EnumExpandStatusId
  reasonRequired?: boolean
  selfDeclared?: boolean
  users: string[]
  handleAppendDataCQAction: IHandleAppendDataCQAction
  handleUpdateStatus(reason: string, identity: ViewIdentity): Promise<void> | void

  disabled?: boolean
  hideSwitch?: boolean
  isHorizontal?: boolean | undefined
  followingProps?: Partial<FollowingActionProps>
} & ViewOverride

export default function FCTStatusAction({
  users,
  fctStatusId,
  selfDeclared,
  identity,
  reasonRequired,
  handleUpdateStatus,
  handleAppendDataCQAction,
  viewPendingCQFn,
  viewHistoryFn,
  getNumPending,
  disabled,
  hideSwitch,
  isHorizontal,
  followingProps,
}: Props) {
  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const isFollowing =
    fctStatusId === EnumExpandStatus.FOLLOWING || +fctStatusId === +EnumExpandStatusId.FOLLOWING

  const isAppendCQ =
    fctStatusId === EnumExpandStatus.CHANGE_REQUEST ||
    fctStatusId === EnumExpandStatusId.CHANGE_REQUEST

  return (
    <>
      {isAppendCQ ? (
        <ChangeRequestAction
          disabled={disabled}
          isSelfDeclared={selfDeclared}
          hiddenButtons={changeRequestActionDisabled(users, user)}
          onApprove={async () => {
            if (!checkTimeETL()) return
            await handleAppendDataCQAction(identity, true)
          }}
          onReject={async () => {
            if (!checkTimeETL()) return
            await handleAppendDataCQAction(identity, false)
          }}
        />
      ) : (
        <FollowingAction
          {...followingProps}
          disabled={disabled}
          hideSwitch={hideSwitch}
          isHorizontal={isHorizontal || false}
          isFollowing={isFollowing}
          onSave={async (reason: string) => {
            if (!checkTimeETL()) return
            await handleUpdateStatus(reason, identity)
          }}
          viewHistory={viewHistoryFn(identity)}
          viewPendingChangeRequest={viewPendingCQFn(identity)}
          reasonProps={{
            reasonRequired: reasonRequired,
            oldValue: isFollowing ? EnumExpandStatus.FOLLOWING : EnumExpandStatus.UNFOLLOWED,
            newValue: isFollowing ? EnumExpandStatus.UNFOLLOWED : EnumExpandStatus.FOLLOWING,
            totalItemPendingCR: getNumPending(identity),
            ...followingProps?.reasonProps,
          }}
        />
      )}
    </>
  )
}
