import { useLazyQuery, useMutation } from '@apollo/client'
import React, { useCallback, useState } from 'react'
import { debounce } from 'lodash'
import { useParams } from 'react-router-dom'
import { Box, Flex, Label } from 'theme-ui'
import { ProfileEditType, ProfileGroupItem } from '.'
import { Button, Dropdown, Modal, MultiSelect, TextField } from '..'
import { ETLRunTimeContext, UserContext } from '../../context'
import { IShowPendingChangeRequest } from '../../hooks/useChangeRequest'
import { textareaIds } from '../../pages/CompanyForm/BusinessForm'
import { HasPendingCQField, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import {
  GET_COMPANY_OVERRIDES_HISTORY,
  OVERRIDE_COMPANY_DATA,
} from '../../pages/CompanyForm/graphql'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  OverridesCompanyDataInput,
  ProfileType,
  scrollToElement,
  SourceIndependentTables,
  TableNames,
  validateNumber,
  yesNoOptions,
} from '../../pages/CompanyForm/helpers'
import {
  IHandleAppendDataCQAction,
  IHandleClickShowPendingCR,
  IHandleUpdateStatus,
} from '../../pages/CompanyForm/provider/CompanyContext'
import strings from '../../strings'
import { Palette } from '../../theme'
import { ChangeFieldEvent, FieldStates } from '../../types'
import { EnumCompanySource, EnumExpandStatusId } from '../../types/enums'
import { checkLength, generateId, maxProfileLength } from '../../utils'
import { FORM_CHANGE_DEBOUNCE_TIME, reasonPopverZIndex } from '../../utils/consts'
import { compareString } from '../../utils/helper'
import { FCTStatusAction } from '../FCTStatusAction'
import { OverridesHistory } from '../OverridesHistory'
import { Heading, Paragraph } from '../primitives'
import ReasonPopover from '../ReasonPopover'

type Props = {
  label: string
  group: ProfileType[]
  editState: ProfileEditType[]
  setEditState(state: ProfileEditType[]): void
  oldState: ProfileEditType[]
  loading: boolean
  handleAddProfiles: (profiles: { profile_type_id: string; new_value: string[] }[]) => Promise<void>
  setError(err: Error): void
  refetchData(): void

  // Change request
  companyId: number
  overviewPendingRequest?: HasPendingCQField[]
  refetchViewPendingChangeRequestCols?: () => Promise<any>
  handleClickShowPendingCR?: IHandleClickShowPendingCR
  showPendingChangeRequest?: IShowPendingChangeRequest
  handleAppendDataCQAction?: IHandleAppendDataCQAction
  isOverridesUser?: boolean
  handleUpdateStatus?: IHandleUpdateStatus
} & ViewHistoryProps

type StateType = {
  [x: string]: string[]
}

let indexNew = 0
let isFirstRun = true

const ProfileGroupForm = ({
  label,
  group,
  editState,
  setEditState,
  oldState,
  loading,
  handleAddProfiles,
  setError,
  showViewHistory,
  refetchData,

  // Override
  companyId,
  overviewPendingRequest = [],
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
}: Props) => {
  const {
    error,
    pages: { addCompanyForm: copy },
  } = strings

  // Context
  const { user } = React.useContext(UserContext)
  const { isRunning, checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { cr: rowId } = useParams<any>()

  // State
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false)
  const [state, setState] = useState<StateType>({})
  const [comment, setComment] = useState<string>('')
  const [historyModal, setHistoryModal] = useState(false)
  const [pendingUpdateProfile, setPendingUpdateProfile] = useState<OverridesCompanyDataInput[]>([])
  const [pendingUpdateAppendProfile, setPendingUpdateAppendProfile] = useState<
    OverridesCompanyDataInput[]
  >([])

  // Graphql
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })
  const [onEditProfile, { loading: updating }] = useMutation(OVERRIDE_COMPANY_DATA)

  const validate = useCallback(
    (v: string, item?: ProfileType) => {
      if (!v) return 'default'
      const getDuplicate = (type: ProfileType) => {
        if (addModalVisible) {
          return state[type.profile_type_id]?.filter(value => compareString(value, v))
        }
        return editState?.filter(
          s => type.profile_type_id === s.profile_type_id && compareString(s.profile_value, v)
        )
      }
      const duplicate = item ? getDuplicate(item) : []
      if (
        (item?.isNumber && validateNumber(v) === 'Invalid number') ||
        checkLength(v, maxProfileLength) ||
        duplicate?.length > 1
      )
        return 'error'
      return 'default'
    },
    [addModalVisible, state, editState]
  )

  const getError = (v: string, newState: string[], data: ProfileEditType[], showValue: boolean) => {
    if (!v) return 'default'
    const duplicate = [
      ...newState,
      ...(data || []).map(({ profile_value }) => profile_value),
    ].filter(s => compareString(s, v))
    const isUnfollow = data.some(
      ({ expand_status_id, profile_value }) =>
        compareString(profile_value, v) && expand_status_id === EnumExpandStatusId.UNFOLLOWED
    )

    return duplicate.length > 1
      ? `${error.duplicated.replace('$value', `${showValue ? `"${v}"` : 'This value'}`)}${
          isUnfollow ? ` Please re-follow the existing value` : ''
        }`
      : error.invalid.replace('$value', `${showValue ? `"${v}"` : 'This value'}`)
  }

  const onChangeField = React.useCallback(
    debounce((v: string, id: string, index: number) => {
      const cloneState = state[id] || ['']
      cloneState[index] = v
      setState({ ...state, [id]: cloneState })
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [state, setState]
  )

  const onChangeEditField = React.useCallback(
    debounce((v: string, p: ProfileEditType) => {
      const cloneState = editState.map(item => {
        return item.profile_id === p.profile_id ? { ...item, profile_value: v } : item
      })
      if (!cloneState.find(e => e.profile_id === p.profile_id))
        cloneState.push({
          ...p,
          profile_id: `${p.profile_type_id}-${++indexNew}`,
          profile_value: v,
        })
      setEditState(cloneState)
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [editState, setEditState]
  )

  const onCancel = (v: string, p: ProfileEditType) => {
    p.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST
      ? setPendingUpdateAppendProfile(
          pendingUpdateAppendProfile.filter(item => item.id !== p.profile_id)
        )
      : setPendingUpdateProfile(pendingUpdateProfile.filter(item => item.id !== p.profile_id))
    onChangeEditField(v, p)
    setComment('')
  }

  const onUpdateProfile = (p: ProfileEditType) => {
    const isAppend = p.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST
    const input: OverridesCompanyDataInput = {
      id: p.profile_id,
      tableName: TableNames.PROFILE,
      columnName: ColumnNames.PROFILE_VALUE,
      oldValue: oldState.find(item => item.profile_id === p.profile_id)?.profile_value || '',
      newValue: p.profile_value,
      source: EnumCompanySource.BCG,
      companyId: +companyId,
      reason: comment,
    }
    const pending = (isAppend ? pendingUpdateAppendProfile : pendingUpdateProfile).filter(
      item => item.id !== p.profile_id
    )
    pending.push(input)
    isAppend ? setPendingUpdateAppendProfile(pending) : setPendingUpdateProfile(pending)
    setComment('')
  }

  const onSave = async () => {
    try {
      if (!checkTimeETL()) return
      if (addModalVisible) {
        const profiles = Object.keys(state).map(key => ({
          profile_type_id: key,
          new_value: state[key].filter(e => e.length > 0).map(v => v.trim()),
        }))
        if (profiles?.length) {
          await handleAddProfiles(profiles)
        }
      } else {
        const newProfile = editState.reduce((pre, cur) => {
          if (isNaN(+cur.profile_id) && !!cur.profile_value.trim()) {
            const profileIndex = pre.findIndex(
              ({ profile_type_id }) => profile_type_id === cur.profile_type_id
            )
            if (profileIndex > -1) {
              pre[profileIndex] = {
                ...pre[profileIndex],
                new_value: [...pre[profileIndex].new_value, cur.profile_value.trim()],
              }
            } else
              pre.push({
                profile_type_id: cur.profile_type_id,
                new_value: [cur.profile_value.trim()],
              })
          }
          return pre
        }, [] as { profile_type_id: string; new_value: string[] }[])
        // Update profile
        if (!!pendingUpdateProfile.length || !!pendingUpdateAppendProfile.length) {
          !!pendingUpdateProfile.length &&
            (await onEditProfile({
              variables: {
                input: pendingUpdateProfile,
                isAppendData: false,
              },
            }))
          !!pendingUpdateAppendProfile.length &&
            (await onEditProfile({
              variables: {
                input: pendingUpdateAppendProfile,
                isAppendData: true,
              },
            }))
          if (!newProfile?.length) {
            refetchData()
          }
        }
        // Add new profile
        if (newProfile?.length) {
          await handleAddProfiles(newProfile)
        }
      }
    } catch (error) {
      setError(error)
    } finally {
      closeModal()
    }
  }

  const closeModal = () => {
    setAddModalVisible(false)
    setEditModalVisible(false)
    setState({})
    setEditState(oldState)
    setPendingUpdateProfile([])
    setPendingUpdateAppendProfile([])
  }

  React.useEffect(() => {
    if (rowId && isFirstRun) {
      const profile = oldState.find(e => e.profile_id === rowId)
      if (profile?.profile_id) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(generateId(label)))
          if (!isRunning) setEditModalVisible(true)
          isFirstRun = false
        }, 0)
      }
    }
  }, [oldState, rowId, companyId, isRunning, label])

  return (
    <>
      <Flex id={`${generateId(label)}`}>
        <Paragraph bold>{label}</Paragraph>
        {!!oldState.length && (
          <Button
            sx={{ height: 'auto' }}
            color="primary"
            variant="invert"
            icon="pencil"
            onPress={async () => {
              if (!checkTimeETL()) return
              setEditModalVisible(true)
            }}
          />
        )}
      </Flex>

      {oldState.length ? (
        <ProfileGroupItem group={group} state={oldState} />
      ) : (
        <Flex
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            my: 5,
            width: '100%',
          }}
        >
          <Button
            label={`Add ${label} +`}
            sx={{
              borderRadius: 10,
              flex: 1,
              color: Palette.primary,
            }}
            variant="outline"
            onPress={() => {
              if (!checkTimeETL()) return
              setAddModalVisible(true)
            }}
          />
        </Flex>
      )}
      {(addModalVisible || editModalVisible) && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 4 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.buttons.cancel,
              type: 'secondary',
              action: () => {
                closeModal()
              },
              disabled: loading || updating,
            },
            {
              label: copy.buttons.save,
              type: 'primary',
              action: onSave,
              disabled:
                loading ||
                updating ||
                (addModalVisible &&
                  Object.keys(state).some(key =>
                    state[key].some(
                      v =>
                        validate(
                          v,
                          group.find(({ profile_type_id }) => profile_type_id === key)
                        ) === 'error'
                    )
                  )) ||
                (editModalVisible &&
                  (!!pendingUpdateProfile.length || !!pendingUpdateAppendProfile.length
                    ? editState.filter(
                        item => item.expand_status_id !== EnumExpandStatusId.CHANGE_REQUEST
                      )
                    : editState.filter(item => Number.isNaN(Number(item.profile_id)))
                  ).some(
                    p =>
                      validate(
                        p.profile_value,
                        group.find(({ profile_type_id }) => profile_type_id === p.profile_type_id)
                      ) === 'error'
                  )),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add ${label}`}
          </Heading>
          {addModalVisible ? (
            // Add form
            <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
              {group.map((item, index) => {
                const value = state[item.profile_type_id] || ['']
                return (
                  <React.Fragment key={index}>
                    <Flex
                      sx={{
                        mb: 4,
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {item.options || item.isBoolean ? (
                        item.isSingle ? (
                          <Dropdown
                            label={item.profile_type_name}
                            name={item.profile_type_name}
                            onChange={v => {
                              setState({
                                ...state,
                                [item.profile_type_id]: [v.target.value],
                              })
                            }}
                            options={
                              item.options?.map(value => ({ label: value, value })) || yesNoOptions
                            }
                            value={value[0]}
                            sx={{ width: '100%' }}
                          />
                        ) : (
                          <MultiSelect
                            id={`${item.profile_type_name}-${index}`}
                            label={item.profile_type_name}
                            bg={'gray03'}
                            state={state[item.profile_type_id] || []}
                            positions={['bottom', 'top']}
                            options={item.options?.map(value => ({ label: value, value })) || []}
                            onChange={value => {
                              setState({
                                ...state,
                                [item.profile_type_id]: value.map(v => v.toString()),
                              })
                            }}
                          />
                        )
                      ) : (
                        <Box sx={{ width: '100%' }}>
                          <Flex>
                            <Label sx={{ flex: 1 }}>{item.profile_type_name}</Label>
                            {!item.isSingle && (
                              <Button
                                sx={{ color: 'primary', py: 0, alignSelf: 'start' }}
                                size="tiny"
                                label="+ Add New"
                                variant="invert"
                                onPress={() => {
                                  setState({
                                    ...state,
                                    [item.profile_type_id]: [...value, ''],
                                  })
                                }}
                              ></Button>
                            )}
                          </Flex>

                          {value.map((v, index) => {
                            const fieldState = validate(v, item)
                            return (
                              <Flex
                                key={index}
                                sx={{
                                  mb: 4,
                                  width: '100%',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <TextField
                                  name={`profile-${index}`}
                                  fieldState={fieldState as keyof FieldStates}
                                  value={v}
                                  onChange={(event: ChangeFieldEvent) => {
                                    onChangeField(event.target.value, item.profile_type_id, index)
                                  }}
                                  type={
                                    textareaIds.includes(+item.profile_type_id)
                                      ? 'textarea'
                                      : 'input'
                                  }
                                  tooltipError={
                                    fieldState === 'error'
                                      ? getError(v, state[item.profile_type_id] || [], [], false)
                                      : undefined
                                  }
                                />

                                {value.length > 1 && (
                                  <Button
                                    sx={{ ml: 3 }}
                                    onPress={() => {
                                      const cloneState = [...value]
                                      cloneState.splice(index, 1)
                                      setState({ ...state, [item.profile_type_id]: cloneState })
                                    }}
                                    icon="remove"
                                    size="tiny"
                                    variant="black"
                                  />
                                )}
                              </Flex>
                            )
                          })}
                        </Box>
                      )}
                    </Flex>
                  </React.Fragment>
                )
              })}
            </Box>
          ) : (
            // Edit form
            <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
              {group.map((item, index) => {
                const value = editState.filter(p => p.profile_type_id === item.profile_type_id)
                const addNewProfile = () => {
                  setEditState([
                    ...editState,
                    {
                      company_id: '',
                      expand_status_id: '',
                      profile_id: `${item.profile_type_id}-${++indexNew}`,
                      profile_type_id: item.profile_type_id,
                      profile_type_name: item.profile_type_name,
                      profile_value: '',
                    },
                  ])
                }

                return (
                  <React.Fragment key={index}>
                    <Flex
                      sx={{
                        mb: 4,
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Flex>
                          <Label sx={{ flex: 1 }}>{item.profile_type_name}</Label>
                          {!item.isSingle && (
                            <Button
                              sx={{ color: 'primary', py: 0, alignSelf: 'start' }}
                              size="tiny"
                              label="+ Add New"
                              variant="invert"
                              onPress={addNewProfile}
                            ></Button>
                          )}
                        </Flex>

                        {(value.length
                          ? value
                          : [
                              {
                                company_id: '',
                                expand_status_id: '',
                                profile_id: `id`,
                                profile_type_id: item.profile_type_id,
                                profile_type_name: item.profile_type_name,
                                profile_value: '',
                              },
                            ]
                        ).map((v, idx) => {
                          const isFollowing = v.expand_status_id === EnumExpandStatusId.FOLLOWING
                          const isAppendCQ =
                            v.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST
                          const isEdit = true
                          const isFakeId = isNaN(+v.profile_id)

                          const users =
                            findCQ(
                              overviewPendingRequest,
                              {
                                tableName: TableNames.PROFILE,
                                columnName: ColumnNames.FCT_STATUS_ID,
                                rowId: v.profile_id,
                                source: EnumCompanySource.BCG,
                              },
                              SourceIndependentTables.includes(TableNames.PROFILE)
                            )?.users || []

                          const editDisabled = editCRDisabled(users, user, isAppendCQ)
                          const fieldDisabled =
                            (((!isFakeId && item.options && !item.isSingle) || !isFollowing) &&
                              !isAppendCQ) ||
                            editDisabled

                          const reasonRequired = !isOverridesUser && !isAppendCQ

                          const isShowViewHistory = showViewHistory(
                            TableNames?.PROFILE,
                            ColumnNames.PROFILE_VALUE,
                            v.profile_id,
                            EnumCompanySource.BCG
                          )

                          const oldValue =
                            oldState.find(o => o.profile_id === v.profile_id)?.profile_value || ''
                          const fieldState = validate(v.profile_value, item) as keyof FieldStates
                          const cannotUpdate =
                            fieldState === 'error' ||
                            invalidUpdateData(
                              oldValue,
                              v.profile_value,
                              comment,
                              isOverridesUser,
                              false,
                              isAppendCQ
                            ) ||
                            !v.profile_value

                          const { total: numPending } = findCQ(
                            overviewPendingRequest,
                            {
                              tableName: TableNames.PROFILE,
                              columnName: ColumnNames.PROFILE_VALUE,
                              rowId: v.profile_id,
                              source: EnumCompanySource.BCG,
                            },
                            SourceIndependentTables.includes(TableNames.PROFILE)
                          ) || {
                            total: 0,
                          }
                          const isShowPendingCQ = numPending > 0

                          return (
                            <Flex
                              key={idx}
                              sx={{
                                mb: idx + 1 < value.length ? 4 : 0,
                                width: '100%',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <ReasonPopover
                                sx={{ flex: 1 }}
                                reasonRequired={reasonRequired}
                                zIndex={reasonPopverZIndex}
                                disabled={!isEdit || fieldDisabled}
                                positions={
                                  index + 1 < group.length ? ['bottom', 'top'] : ['top', 'bottom']
                                }
                                buttons={[
                                  {
                                    label: isEdit ? 'Submit' : 'Update',
                                    action: () => {
                                      onUpdateProfile(v)
                                    },
                                    type: 'primary',
                                    isCancel: true,
                                    disabled: loading || cannotUpdate,
                                  },
                                ]}
                                oldValue={oldValue}
                                newValue={v.profile_value}
                                reason={comment}
                                setReason={setComment}
                                label={isShowViewHistory || isShowPendingCQ ? ' ' : ''}
                                onCancelCallBack={() => onCancel(oldValue, v)}
                                onClickOutSide={() => onCancel(oldValue, v)}
                                viewHistory={
                                  !isShowViewHistory
                                    ? undefined
                                    : () => {
                                        setHistoryModal(true)
                                        getHistory({
                                          variables: {
                                            input: {
                                              tableName: TableNames?.PROFILE,
                                              columnName: ColumnNames.PROFILE_VALUE,
                                              companyId: companyId ? +companyId : 0,
                                              rowId: v.profile_id,
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
                                          columnName: ColumnNames.PROFILE_VALUE,
                                          companyId: companyId ? +companyId : 0,
                                          rowId: v.profile_id,
                                          source: EnumCompanySource.BCG,
                                        })
                                      }
                                }
                                totalItemPendingCR={numPending}
                              >
                                {item.options || item.isBoolean ? (
                                  <Dropdown
                                    name={item.profile_type_name}
                                    value={v.profile_value}
                                    onChange={e => {
                                      onChangeEditField(e.target.value, v)
                                    }}
                                    options={
                                      item.options?.map(value => ({ label: value, value })) ||
                                      yesNoOptions
                                    }
                                    sx={{
                                      width: '100%',
                                      opacity:
                                        (!isFakeId &&
                                          (isFollowing || (isAppendCQ && !editDisabled))) ||
                                        isFakeId
                                          ? 1
                                          : 0.5,
                                    }}
                                    hideArrow={!isFakeId && !isAppendCQ && !item.isSingle}
                                    disabled={!isFakeId && fieldDisabled}
                                    variant={fieldState === 'error' ? 'error' : 'black'}
                                    error={
                                      fieldState === 'error'
                                        ? getError(v.profile_value, [], value, true)
                                        : undefined
                                    }
                                  />
                                ) : (
                                  <TextField
                                    name={`profile-${idx}`}
                                    fieldState={fieldState}
                                    value={v.profile_value}
                                    onChange={(e: ChangeFieldEvent) => {
                                      onChangeEditField(e.target.value, v)
                                    }}
                                    type={
                                      textareaIds.includes(+item.profile_type_id)
                                        ? 'textarea'
                                        : 'input'
                                    }
                                    disabled={!isFakeId && fieldDisabled}
                                    tooltipError={
                                      fieldState === 'error'
                                        ? getError(v.profile_value, [], value, false)
                                        : undefined
                                    }
                                  />
                                )}
                              </ReasonPopover>

                              {value.length > 1 && isFakeId && (
                                <Button
                                  sx={{ ml: 3 }}
                                  onPress={() => {
                                    setEditState(
                                      editState.filter(p => p.profile_id !== v.profile_id)
                                    )
                                  }}
                                  icon="remove"
                                  size="tiny"
                                  variant="black"
                                />
                              )}
                              {!isFakeId && (!item.isSingle || !isFollowing) && (
                                <FCTStatusAction
                                  reasonRequired={reasonRequired}
                                  identity={{
                                    tableName: TableNames.PROFILE,
                                    columnName: ColumnNames.FCT_STATUS_ID,
                                    rowId: v.profile_id,
                                    source: EnumCompanySource.BCG,
                                  }}
                                  fctStatusId={v.expand_status_id as EnumExpandStatusId}
                                  selfDeclared={!!v.selfDeclared}
                                  handleAppendDataCQAction={handleAppendDataCQAction}
                                  viewHistoryFn={({ tableName, columnName, rowId }) => {
                                    return showViewHistory(
                                      tableName,
                                      columnName,
                                      rowId,
                                      EnumCompanySource.BCG
                                    )
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
                                  followingProps={{
                                    reasonProps: {
                                      positions:
                                        index + 1 < group.length
                                          ? ['bottom', 'top']
                                          : ['top', 'bottom'],
                                    },
                                  }}
                                />
                              )}
                            </Flex>
                          )
                        })}
                      </Box>
                    </Flex>
                  </React.Fragment>
                )
              })}
            </Box>
          )}
        </Modal>
      )}

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
    </>
  )
}

export default ProfileGroupForm
