import { useLazyQuery, useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { debounce } from 'lodash'
import { Box, Flex } from 'theme-ui'
import { Button, TextField } from '..'
import {
  GET_COMPANY_OVERRIDES_HISTORY,
  OVERRIDE_COMPANY_DATA,
} from '../../pages/CompanyForm/graphql'
import { ChangeFieldEvent, FieldStates } from '../../types'
import ReasonPopover from '../ReasonPopover'
import { EnumCompanySource, EnumExpandStatusId } from '../../types/enums'
import Modal from '../Modal'
import { Heading } from '../primitives'
import strings from '../../strings'
import { OverridesHistory } from '../OverridesHistory'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  SourceIndependentTables,
  TableNames,
} from '../../pages/CompanyForm/helpers'
import { HasPendingCQField, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import { FieldTypes } from '../TextField'
import { Palette } from '../../theme'
import { FORM_CHANGE_DEBOUNCE_TIME, popoverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import {
  IHandleAppendDataCQAction,
  IHandleClickShowPendingCR,
  IHandleUpdateStatus,
} from '../../pages/CompanyForm/provider/CompanyContext'
import { IShowPendingChangeRequest } from '../../hooks/useChangeRequest'
import { ETLRunTimeContext, UserContext } from '../../context'
import { compareString } from '../../utils/helper'

type ProfileFormProps = {
  getUser?(): string
  isEdit?: boolean
  state?: string[]
  editState?: ProfileEditType[]
  companyId: number
  type: FieldTypes
  buttonLabel: string
  placeholder?: string
  onChange?(arr: string[]): void
  onChangeEdit?(arr: ProfileEditType[]): void
  onAddField?(): void
  oldState?: ProfileEditType[]
  setOldState?(v: ProfileEditType[]): void
  validate(v: string, maxlength?: number): keyof FieldStates
  disabled?: boolean
  setError(err: Error): void

  // Change request
  overviewPendingRequest?: HasPendingCQField[]
  refetchViewPendingChangeRequestCols?: () => Promise<any>
  handleClickShowPendingCR?: IHandleClickShowPendingCR
  showPendingChangeRequest?: IShowPendingChangeRequest
  handleAppendDataCQAction?: IHandleAppendDataCQAction
  isOverridesUser?: boolean
  handleUpdateStatus?: IHandleUpdateStatus
} & ViewHistoryProps

export type ProfileEditType = {
  company_id: string
  expand_status_id: string
  profile_id: string
  profile_type_id: string
  profile_type_name: string
  profile_value: string
  selfDeclared?: boolean
}

const ProfileForm = ({
  isEdit,
  state = [],
  editState = [],
  companyId,
  type,
  buttonLabel,
  placeholder,
  onChange,
  onChangeEdit = e => {},
  showViewHistory,
  refetchViewHistoryCols,
  onAddField,
  oldState = [],
  setOldState = () => {},
  validate,
  disabled,
  setError,

  overviewPendingRequest = [],
  refetchViewPendingChangeRequestCols = async () => {},
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
}: ProfileFormProps) => {
  const {
    error,
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const [onEditProfile, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [comment, setComment] = useState('')
  const [historyModal, setHistoryModal] = useState(false)

  const onChangeField = useCallback(
    debounce((value: string, index: number) => {
      const cloneState = [...state]
      cloneState[index] = value
      onChange && onChange(cloneState)
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [state, onChange]
  )

  const onChangeEditField = useCallback(
    debounce((value: string, id: string) => {
      onChangeEdit &&
        onChangeEdit(
          editState.map(item => {
            return item.profile_id === id ? { ...item, profile_value: value } : item
          })
        )
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [editState, onChangeEdit]
  )

  const onBlurField = () => {}

  const onUpdateProfile = async (item: ProfileEditType) => {
    if (!checkTimeETL()) return
    const isAppendData = item.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST
    const input = [
      {
        companyId: +item.company_id,
        reason: comment,
        id: item.profile_id,
        oldValue: oldState.find((e: ProfileEditType) => e.profile_id === item.profile_id)
          ?.profile_value,
        newValue: item.profile_value,
        tableName: TableNames.PROFILE,
        columnName: 'profile_value',
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditProfile({
        variables: {
          input,
          isAppendData,
        },
      })
      if (isOverridesUser || isAppendData) {
        setOldState(editState || [])
      } else {
        refetchViewPendingChangeRequestCols()
      }
      refetchViewHistoryCols && (await refetchViewHistoryCols())
      setComment('')
    } catch (error) {
      setError(error)
    }
  }

  const onRemove = (index: number) => {
    const cloneState = [...state]
    cloneState.splice(index, 1)
    onChange && onChange(cloneState)
  }

  const getError = (v: string) => {
    if (!v) return 'default'
    const duplicate = [
      ...state,
      ...(editState || []).map(({ profile_value }) => profile_value),
    ].filter(s => compareString(s, v))

    const isUnfollow = editState.some(
      ({ expand_status_id, profile_value }) =>
        compareString(profile_value, v) && expand_status_id === EnumExpandStatusId.UNFOLLOWED
    )
    return duplicate.length > 1
      ? `${error.duplicated.replace('$value', 'This value')}${
          isUnfollow ? ` Please re-follow the existing value` : ''
        }`
      : error.invalid.replace('$value', 'This value')
  }

  return (
    <Box sx={{ mt: 4 }}>
      {isEdit &&
        editState?.map((item, index: number) => {
          const isFollowing = item.expand_status_id === EnumExpandStatusId.FOLLOWING
          const isAppendCQ = item.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST

          const users =
            findCQ(
              overviewPendingRequest,
              {
                tableName: TableNames.PROFILE,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: item.profile_id,
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.PROFILE)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          const isShowViewHistory = showViewHistory(
            TableNames?.PROFILE,
            'profile_value',
            item.profile_id,
            EnumCompanySource.BCG
          )
          const oldValue = oldState[index]?.profile_value
          const fieldState = validate(item.profile_value)
          const cannotUpdate =
            fieldState === 'error' ||
            invalidUpdateData(
              oldValue,
              item.profile_value,
              comment,
              isOverridesUser,
              false,
              isAppendCQ
            ) ||
            !item.profile_value

          const { total: numPending } = findCQ(
            overviewPendingRequest,
            {
              tableName: TableNames.PROFILE,
              columnName: 'profile_value',
              rowId: item.profile_id,
              source: EnumCompanySource.BCG,
            },
            SourceIndependentTables.includes(TableNames.PROFILE)
          ) || {
            total: 0,
          }

          const isShowPendingCQ = numPending > 0

          return (
            <Flex
              id={`profile-${item.profile_id}`}
              key={item.profile_id}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
            >
              <ReasonPopover
                sx={{ flex: 1 }}
                reasonRequired={reasonRequired}
                zIndex={popoverZIndex}
                disabled={!isEdit || fieldDisabled}
                positions={['top', 'bottom']}
                buttons={[
                  {
                    label: isEdit ? 'Submit' : 'Update',
                    action: () => onUpdateProfile(item),
                    type: 'primary',
                    isCancel: true,
                    disabled: loading || cannotUpdate,
                  },
                ]}
                oldValue={oldValue}
                newValue={item.profile_value}
                reason={comment}
                setReason={setComment}
                label={isShowViewHistory || isShowPendingCQ ? ' ' : ''}
                // Note RevertChange After Submit
                callCancelCBAfterAction={callCancelCBAfterAction}
                onCancelCallBack={() => onChangeEditField(oldValue, item.profile_id)}
                onClickOutSide={() => onChangeEditField(oldValue, item.profile_id)}
                viewHistory={
                  !isShowViewHistory
                    ? undefined
                    : () => {
                        setHistoryModal(true)
                        getHistory({
                          variables: {
                            input: {
                              tableName: TableNames?.PROFILE,
                              columnName: 'profile_value',
                              companyId: companyId ? +companyId : 0,
                              rowId: item.profile_id,
                              source: EnumCompanySource.BCG,
                            },
                          },
                        })
                      }
                }
                viewPendingChangeRequest={
                  !isShowPendingCQ
                    ? undefined
                    : () => {
                        handleClickShowPendingCR({
                          tableName: TableNames?.PROFILE,
                          columnName: 'profile_value',
                          companyId: companyId ? +companyId : 0,
                          rowId: item.profile_id,
                          source: EnumCompanySource.BCG,
                        })
                      }
                }
                totalItemPendingCR={numPending}
              >
                <TextField
                  name={`edit${index}`}
                  key={index}
                  disabled={fieldDisabled}
                  fieldState={fieldState}
                  value={item.profile_value}
                  onChange={(event: ChangeFieldEvent) =>
                    onChangeEditField(event.target.value, item.profile_id)
                  }
                  placeholder={placeholder}
                  onBlur={() => {}}
                  type={type}
                />
              </ReasonPopover>
              <FCTStatusAction
                disabled={disabled}
                reasonRequired={reasonRequired}
                identity={{
                  tableName: TableNames.PROFILE,
                  columnName: ColumnNames.FCT_STATUS_ID,
                  rowId: item.profile_id,
                  source: EnumCompanySource.BCG,
                }}
                fctStatusId={item.expand_status_id as EnumExpandStatusId}
                selfDeclared={!!item.selfDeclared}
                handleAppendDataCQAction={handleAppendDataCQAction}
                viewHistoryFn={({ tableName, columnName, rowId }) => {
                  return showViewHistory(tableName, columnName, rowId, EnumCompanySource.BCG)
                    ? () => {
                        setHistoryModal(true)
                        getHistory({
                          variables: {
                            input: {
                              tableName,
                              columnName,
                              rowId,
                              companyId: companyId ? +companyId : 0,
                              source: EnumCompanySource.BCG,
                            },
                          },
                        })
                      }
                    : undefined
                }}
                viewPendingCQFn={({ tableName, columnName, rowId }) => {
                  return showPendingChangeRequest(
                    tableName,
                    columnName,
                    rowId,
                    EnumCompanySource.BCG
                  )
                    ? () => {
                        handleClickShowPendingCR({
                          tableName,
                          columnName,
                          rowId,
                          companyId: companyId ? +companyId : 0,
                          source: EnumCompanySource.BCG,
                        })
                      }
                    : undefined
                }}
                handleUpdateStatus={async (reason, identity) => {
                  const input = {
                    id: identity.rowId,
                    tableName: identity.tableName,
                    columnName: identity.columnName,
                    source: identity.source as string,
                    companyId: +companyId,
                    reason: reason,
                    newValue: isFollowing
                      ? EnumExpandStatusId.UNFOLLOWED
                      : EnumExpandStatusId.FOLLOWING,
                    oldValue: isFollowing
                      ? EnumExpandStatusId.FOLLOWING
                      : EnumExpandStatusId.UNFOLLOWED,
                  }

                  await handleUpdateStatus(input)
                }}
                getNumPending={identity => {
                  return getNumPending(overviewPendingRequest, identity)
                }}
                users={users}
              />
            </Flex>
          )
        })}

      {!isEdit &&
        state.map((e: string, index: number) => {
          const fieldState = validate(e)
          return (
            <Flex key={index} sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                name={`profile-${index}`}
                fieldState={fieldState}
                value={e}
                onChange={(event: ChangeFieldEvent) => onChangeField(event.target.value, index)}
                placeholder={placeholder}
                onBlur={onBlurField}
                type={type}
                tooltipError={fieldState === 'error' ? getError(e) : undefined}
              />

              {((editState && editState.length > 0) || state.length > 1) && (
                <Button
                  sx={{ ml: 3 }}
                  onPress={() => onRemove(index)}
                  icon="remove"
                  size="tiny"
                  variant="black"
                />
              )}
            </Flex>
          )
        })}

      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          my: 5,
          width: '100%',
        }}
      >
        <Button
          label={buttonLabel || 'Add +'}
          sx={{
            borderRadius: 10,
            flex: 1,
            color: Palette.primary,
          }}
          variant="outline"
          onPress={onAddField}
        />
      </Flex>

      {historyModal && (
        <Modal
          sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '600px' }}
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
            <OverridesHistory
              loading={getHistoryLoading}
              data={getHistoryData?.getCompanyOverrideHistory}
            />
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default ProfileForm
