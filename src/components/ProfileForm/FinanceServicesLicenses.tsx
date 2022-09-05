import { useLazyQuery, useMutation } from '@apollo/client'
import { debounce, isEmpty } from 'lodash'
import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Flex, Label } from 'theme-ui'
import { FinancialServiceOverview } from '.'
import { Button, Dropdown, Icon, Modal, TextField, Tooltip } from '..'
import { ETLRunTimeContext, UserContext } from '../../context'
import { IShowPendingChangeRequest } from '../../hooks/useChangeRequest'
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
  yesNoOptions,
} from '../../pages/CompanyForm/helpers'
import {
  IHandleAppendDataCQAction,
  IHandleClickShowPendingCR,
  IHandleUpdateStatus,
} from '../../pages/CompanyForm/provider/CompanyContext'
import strings from '../../strings'
import { Palette } from '../../theme'
import { ChangeFieldEvent } from '../../types'
import { EnumCompanySource, EnumExpandStatusId } from '../../types/enums'
import { FORM_CHANGE_DEBOUNCE_TIME, reasonPopverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import { OverridesHistory } from '../OverridesHistory'
import { Heading, Paragraph } from '../primitives'
import ReasonPopover from '../ReasonPopover'

export type FinanceServiceLicense = {
  license_type: string
  license_jurisdiction: string
  id: number
  fctStatusId: number
  selfDeclared: boolean
}

export type FinanceServiceLicenseType = ProfileType & { field: keyof FinanceServiceLicense }

type Props = {
  group: FinanceServiceLicenseType[]
  label: string
  editState: FinanceServiceLicense[]
  setEditState(state: FinanceServiceLicense[]): void
  oldState: FinanceServiceLicense[]
  loading: boolean
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
  handleAddProfiles: (profiles: FinanceServiceLicense[]) => Promise<void>
} & ViewHistoryProps

let isFirstRun = true
const FinanceServiceLicenseGroupForm = ({
  group,
  label,
  editState = [],
  setEditState,
  oldState,
  loading,
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
  handleAddProfiles,
}: Props) => {
  const {
    error,
    pages: { addCompanyForm: copy },
  } = strings

  // Context
  const { user } = React.useContext(UserContext)

  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })
  const [onEditProfile, { loading: updating }] = useMutation(OVERRIDE_COMPANY_DATA)

  // State
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false)
  const [state, setState] = useState<FinanceServiceLicense[]>([])
  const [comment, setComment] = useState<string>('')
  const [historyModal, setHistoryModal] = useState(false)
  const [pendingUpdateProfile, setPendingUpdateProfile] = useState<OverridesCompanyDataInput[]>([])
  const [pendingUpdateAppendProfile, setPendingUpdateAppendProfile] = useState<
    OverridesCompanyDataInput[]
  >([])
  const { isRunning, checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { cr: rowId } = useParams<any>()

  React.useEffect(() => {
    if (rowId && isFirstRun) {
      const keyAndId = (rowId || '').toString().split('_')
      const profile = keyAndId[0] === 'license' && oldState.find(e => e.id === +keyAndId[1])
      if (profile) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          if (!isRunning) setEditModalVisible(true)

          scrollToElement(
            document.getElementById(`license-${keyAndId[1]}`),
            document.getElementById(`scroll-box`)
          )

          isFirstRun = false
        }, 0)
      }
    }
  }, [oldState, rowId, companyId, isRunning, label])

  const getValue = (i: FinanceServiceLicense) => {
    return `${i.license_jurisdiction.trim().toLowerCase()}_${i.license_type.trim().toLowerCase()}`
  }

  const validate = (v: FinanceServiceLicense, field?: keyof FinanceServiceLicense) => {
    if (field && isEmpty(v[field])) return getError(error.invalid)
    if (field && isEmpty(v.license_jurisdiction) && isEmpty(v.license_type))
      return getError(error.invalid)
    if (!field) {
      const copyState = [...(addModalVisible ? state : editState)]
      const duplicate = copyState.filter(i => getValue(i) === getValue(v))
      if (duplicate.length > 1) return getError(error.duplicated)
    }
  }

  const onChangeField = useCallback(
    debounce((v: string, id: number, field: keyof FinanceServiceLicense) => {
      const item = state.find(({ id: itemId }) => id === itemId) || ({} as FinanceServiceLicense)
      const index = state.findIndex(({ id: itemId }) => id === itemId) || 0
      const value = typeof v === 'string' ? v.trim() : v
      setState([
        ...state.slice(0, index),
        { ...item, [field]: value },
        ...state.slice(index + 1, state.length),
      ])
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [state, setState]
  )

  const onChangeEditField = useCallback(
    debounce((v: string | number, p: FinanceServiceLicense, field: string, id: number) => {
      const item =
        editState.find(({ id: itemId }) => id === itemId) || ({} as FinanceServiceLicense)
      const index = editState.findIndex(({ id: itemId }) => id === itemId) || 0
      const value = typeof v === 'string' ? v.trim() : v
      setEditState([
        ...editState.slice(0, index),
        { ...item, [field]: value },
        ...editState.slice(index + 1, editState.length),
      ])
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [editState, setEditState]
  )

  const onUpdateProfile = (p: FinanceServiceLicense, field: keyof FinanceServiceLicense) => {
    const input: OverridesCompanyDataInput = {
      id: p.id?.toString(),
      tableName: TableNames.FINANCE_SERVICES_LICENSES,
      columnName: field,
      oldValue: (oldState.find(item => item.id === p.id)?.[field] as string) || '',
      newValue: p[field] as string,
      source: EnumCompanySource.BCG,
      companyId: +companyId,
      reason: comment,
    }
    const isAppend = p.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST
    const pending = isAppend ? pendingUpdateAppendProfile : pendingUpdateProfile
    const index = pending.findIndex(item => {
      return +item.id === p.id && field === item.columnName
    })
    if (index > -1) {
      const cloneState = [...pending]
      cloneState[index] = input
      isAppend ? setPendingUpdateAppendProfile(cloneState) : setPendingUpdateProfile(cloneState)
    } else
      isAppend
        ? setPendingUpdateAppendProfile([...pending, input])
        : setPendingUpdateProfile([...pending, input])
  }

  const onSave = async () => {
    if (!checkTimeETL()) return
    try {
      if (addModalVisible) {
        const profiles = state.map(({ license_jurisdiction, license_type }) => ({
          license_type,
          license_jurisdiction,
        }))
        if (profiles.length) {
          await handleAddProfiles(profiles as FinanceServiceLicense[])
        }
      } else {
        // append profile
        const newProfile = editState.reduce(
          (pre, cur) => {
            const { id, license_jurisdiction, license_type } = cur
            if (id < 0)
              pre.push({
                license_type,
                license_jurisdiction,
              })
            return pre
          },
          [] as {
            license_type: string
            license_jurisdiction: string
          }[]
        )
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
          setComment('')
          if (!newProfile?.length) {
            refetchData()
          }
        }
        if (newProfile?.length) {
          await handleAddProfiles(newProfile as FinanceServiceLicense[])
        }
      }
    } catch (error) {
      setError(error as Error)
    } finally {
      closeModal()
    }
  }

  const closeModal = () => {
    setAddModalVisible(false)
    setEditModalVisible(false)
    setState([])
    setEditState([])
  }

  const getError = (str: string) => {
    return str.replace('$value', 'This value')
  }

  const getLastedFakeId = useCallback((copyState: FinanceServiceLicense[]) => {
    if (!copyState.length) {
      return -1
    }
    const ids = copyState.map(item => Math.abs(item.id))
    return -(Math.max(...ids) + 1)
  }, [])

  return (
    <>
      <Flex sx={{}}>
        <Paragraph bold>{label}</Paragraph>
        {!!oldState.length && (
          <Button
            sx={{ height: 'auto' }}
            color="primary"
            variant="invert"
            icon="pencil"
            onPress={async () => {
              setEditState(oldState)
              setEditModalVisible(true)
            }}
          />
        )}
      </Flex>

      {oldState.length ? (
        <FinancialServiceOverview
          group={group}
          oldState={oldState}
          sx={{ my: 5 }}
        ></FinancialServiceOverview>
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
              setAddModalVisible(true)
              setState([
                {
                  fctStatusId: +EnumExpandStatusId.FOLLOWING,
                  id: getLastedFakeId(state),
                  license_jurisdiction: '',
                  license_type: '',
                  selfDeclared: false,
                },
              ])
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
                (addModalVisible
                  ? state
                  : !!pendingUpdateProfile.length || !!pendingUpdateAppendProfile.length
                  ? editState.filter(
                      value => String(value.fctStatusId) !== EnumExpandStatusId.CHANGE_REQUEST
                    )
                  : editState.filter(value => value.id < 0)
                ).some(
                  v =>
                    !!validate(v) ||
                    !!validate(v, 'license_jurisdiction') ||
                    !!validate(v, 'license_type')
                ),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add ${label}`}
          </Heading>
          {addModalVisible ? (
            <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
              <Flex sx={{ mb: 2, justifyContent: 'end' }}>
                {
                  <Button
                    sx={{ color: 'primary', py: 0, height: '40px' }}
                    size="normal"
                    label="+ Add New"
                    variant="outline"
                    onPress={() => {
                      setState([
                        ...state,
                        {
                          fctStatusId: +EnumExpandStatusId.FOLLOWING,
                          id: getLastedFakeId(state),
                          license_jurisdiction: '',
                          license_type: '',
                          selfDeclared: false,
                        },
                      ])
                    }}
                  ></Button>
                }
              </Flex>
              {
                <Flex
                  sx={{
                    mb: 4,
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    {state.map((v, index) => {
                      const itemErrorMessage = validate(v)
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
                            <Box sx={{ flex: 1 }}>
                              {group.map((item, i) => {
                                const fieldErrorMessage = itemErrorMessage
                                  ? undefined
                                  : validate(v, item.field)
                                return item.options || item.isBoolean ? (
                                  <React.Fragment key={i}>
                                    <Label>{item.profile_type_name}</Label>
                                    <Dropdown
                                      name={item.profile_type_name}
                                      onChange={event => {
                                        onChangeField(event.target.value, v.id, item.field)
                                      }}
                                      options={
                                        item.options?.map(value => ({
                                          label: value,
                                          value,
                                        })) || []
                                      }
                                      value={v[item.field] as string}
                                      sx={{ width: '100%', mb: i + 1 < group.length ? 4 : 0 }}
                                      variant={fieldErrorMessage ? 'error' : 'black'}
                                      error={fieldErrorMessage}
                                    />
                                  </React.Fragment>
                                ) : (
                                  <TextField
                                    key={i}
                                    name={`profile-${index}`}
                                    fieldState={fieldErrorMessage ? 'error' : 'default'}
                                    value={v[item.field] as string}
                                    onChange={(event: ChangeFieldEvent) => {
                                      onChangeField(event.target.value, v.id, item.field)
                                    }}
                                    type={'input'}
                                    label={item.profile_type_name}
                                    sx={{ mb: i + 1 < group.length ? 4 : 0 }}
                                    tooltipError={fieldErrorMessage}
                                  />
                                )
                              })}
                            </Box>
                            {itemErrorMessage && (
                              <Box sx={{ ml: 3 }}>
                                <Tooltip content={itemErrorMessage} isShow={true}>
                                  <Icon
                                    icon={'alert'}
                                    size="small"
                                    background="red"
                                    color="white"
                                  />
                                </Tooltip>
                              </Box>
                            )}
                            {state.length > 1 && (
                              <Button
                                sx={{ ml: 3 }}
                                onPress={() => {
                                  const cloneState = [...state]
                                  cloneState.splice(index, 1)
                                  setState([...cloneState])
                                }}
                                icon="remove"
                                size="tiny"
                                variant="black"
                              />
                            )}
                          </Flex>
                          {index + 1 < state.length ? (
                            <Box key={index} sx={{ borderTop: '1px solid black', m: '50px' }}></Box>
                          ) : undefined}
                        </React.Fragment>
                      )
                    })}
                  </Box>
                </Flex>
              }
            </Box>
          ) : (
            <Box
              sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}
              id={`scroll-box`}
            >
              <React.Fragment>
                <Flex
                  sx={{
                    mb: 4,
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Flex sx={{ mb: 2, justifyContent: 'end' }}>
                      {
                        <Button
                          sx={{ color: 'primary', py: 0, height: '40px' }}
                          size="normal"
                          label="+ Add New"
                          variant="outline"
                          onPress={() => {
                            setEditState([
                              ...editState,
                              {
                                fctStatusId: +EnumExpandStatusId.FOLLOWING,
                                id: getLastedFakeId(editState),
                                license_jurisdiction: '',
                                license_type: '',
                                selfDeclared: false,
                              },
                            ])
                          }}
                        ></Button>
                      }
                    </Flex>

                    {(editState.length
                      ? editState
                      : [
                          {
                            id: getLastedFakeId(editState),
                            license_jurisdiction: '',
                            license_type: '',
                            fctStatusId: +EnumExpandStatusId.FOLLOWING,
                            selfDeclared: false,
                          } as FinanceServiceLicense,
                        ]
                    ).map((v, idx) => {
                      const isFollowing = v.fctStatusId === +EnumExpandStatusId.FOLLOWING
                      const isAppendCQ = v.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST
                      const users =
                        findCQ(
                          overviewPendingRequest,
                          {
                            tableName: TableNames.FINANCE_SERVICES_LICENSES,
                            columnName: ColumnNames.FCT_STATUS_ID,
                            rowId: v.id?.toString(),
                            source: EnumCompanySource.BCG,
                          },
                          SourceIndependentTables.includes(TableNames.FINANCE_SERVICES_LICENSES)
                        )?.users || []

                      const isFakeId = v.id <= 0
                      const itemErrorMessage = validate(v)
                      const fieldDisabled =
                        (!isFollowing && !isAppendCQ) ||
                        editCRDisabled(users, user, isAppendCQ) ||
                        isFakeId
                      const reasonRequired = !isOverridesUser && !isAppendCQ

                      return (
                        <React.Fragment key={`license-${v.id}`}>
                          <Flex
                            sx={{
                              width: '100%',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 2,
                            }}
                            id={`license-${v.id}`}
                          >
                            <Box sx={{ flex: 1 }}>
                              {group.map(({ field, isBoolean, options, profile_type_name }, i) => {
                                const isShowViewHistory = showViewHistory(
                                  TableNames?.FINANCE_SERVICES_LICENSES,
                                  field,
                                  v.id?.toString(),
                                  EnumCompanySource.BCG
                                )

                                const oldValue =
                                  (oldState.find(o => o.id === v.id)?.[field] as string) || ''
                                const fieldErrorMessage = itemErrorMessage
                                  ? undefined
                                  : validate(v, field)
                                const cannotUpdate =
                                  !!fieldErrorMessage ||
                                  invalidUpdateData(
                                    oldValue,
                                    v[field] as string,
                                    comment,
                                    isOverridesUser,
                                    false,
                                    isAppendCQ
                                  ) ||
                                  !v[field] ||
                                  !!itemErrorMessage

                                const { total: numPending } = findCQ(
                                  overviewPendingRequest,
                                  {
                                    tableName: TableNames.FINANCE_SERVICES_LICENSES,
                                    columnName: field,
                                    rowId: v.id?.toString(),
                                    source: EnumCompanySource.BCG,
                                  },
                                  SourceIndependentTables.includes(
                                    TableNames.FINANCE_SERVICES_LICENSES
                                  )
                                ) || {
                                  total: 0,
                                }

                                const isShowPendingCQ = numPending > 0
                                const isEdit = true
                                return (
                                  <ReasonPopover
                                    key={`${idx}-${i}`}
                                    sx={{ flex: 1, mb: i < group.length - 1 ? '20px' : 0 }}
                                    reasonRequired={reasonRequired}
                                    zIndex={reasonPopverZIndex}
                                    disabled={!isEdit || fieldDisabled}
                                    positions={
                                      idx + 1 < editState.length
                                        ? ['bottom', 'top']
                                        : ['top', 'bottom']
                                    }
                                    buttons={[
                                      {
                                        label: isEdit ? 'Submit' : 'Update',
                                        action: () => {
                                          onUpdateProfile(v, field)
                                          setComment('')
                                        },
                                        type: 'primary',
                                        isCancel: true,
                                        disabled: loading || cannotUpdate,
                                      },
                                    ]}
                                    oldValue={oldValue}
                                    newValue={v[field] as string}
                                    reason={comment}
                                    setReason={setComment}
                                    label={profile_type_name}
                                    onCancelCallBack={() =>
                                      onChangeEditField(oldValue, v, field, v.id)
                                    }
                                    onClickOutSide={() =>
                                      onChangeEditField(oldValue, v, field, v.id)
                                    }
                                    viewHistory={
                                      !isShowViewHistory
                                        ? undefined
                                        : () => {
                                            setHistoryModal(true)
                                            getHistory({
                                              variables: {
                                                input: {
                                                  tableName: TableNames?.FINANCE_SERVICES_LICENSES,
                                                  columnName: field,
                                                  companyId: companyId ? +companyId : 0,
                                                  rowId: v.id?.toString(),
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
                                              tableName: TableNames?.FINANCE_SERVICES_LICENSES,
                                              columnName: field,
                                              companyId: companyId ? +companyId : 0,
                                              rowId: v.id?.toString(),
                                              source: EnumCompanySource.BCG,
                                            })
                                          }
                                    }
                                    totalItemPendingCR={numPending}
                                  >
                                    {options || isBoolean ? (
                                      <Dropdown
                                        name={profile_type_name}
                                        value={v[field] as string}
                                        onChange={e => {
                                          onChangeEditField(e.target.value, v, field, v.id)
                                        }}
                                        options={
                                          options?.map(value => ({ label: value, value })) ||
                                          yesNoOptions
                                        }
                                        sx={{ width: '100%' }}
                                        disabled={!isFakeId && fieldDisabled}
                                        variant={fieldErrorMessage ? 'error' : 'black'}
                                        error={getError(error.invalid)}
                                      />
                                    ) : (
                                      <TextField
                                        name={`profile-${idx}`}
                                        fieldState={fieldErrorMessage ? 'error' : 'default'}
                                        value={v[field] as string}
                                        onChange={(e: ChangeFieldEvent) => {
                                          onChangeEditField(e.target.value, v, field, v.id)
                                        }}
                                        type={'input'}
                                        disabled={!isFakeId && fieldDisabled}
                                        tooltipError={getError(error.invalid)}
                                      />
                                    )}
                                  </ReasonPopover>
                                )
                              })}
                            </Box>
                            {itemErrorMessage && (
                              <Box sx={{ ml: 3 }}>
                                <Tooltip content={itemErrorMessage} isShow={true}>
                                  <Icon
                                    icon={'alert'}
                                    size="small"
                                    background="red"
                                    color="white"
                                  />
                                </Tooltip>
                              </Box>
                            )}
                            {editState.length > 1 && isFakeId && (
                              <Button
                                sx={{ ml: 3 }}
                                onPress={() => {
                                  setEditState(editState.filter(p => p.id !== v.id))
                                }}
                                icon="remove"
                                size="tiny"
                                variant="black"
                                key={`btn-${idx}`}
                              />
                            )}
                            {!isFakeId && (
                              <FCTStatusAction
                                key={`toggle-${idx}`}
                                reasonRequired={reasonRequired}
                                identity={{
                                  tableName: TableNames.FINANCE_SERVICES_LICENSES,
                                  columnName: ColumnNames.FCT_STATUS_ID,
                                  rowId: v.id?.toString(),
                                  source: EnumCompanySource.BCG,
                                }}
                                followingProps={{
                                  reasonProps: {
                                    positions:
                                      idx + 1 < editState.length
                                        ? ['bottom', 'top']
                                        : ['top', 'bottom'],
                                  },
                                }}
                                fctStatusId={v.fctStatusId?.toString() as EnumExpandStatusId}
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
                              />
                            )}
                          </Flex>
                          {idx + 1 < editState.length ? (
                            <Box sx={{ borderTop: '1px solid black', m: '50px' }}></Box>
                          ) : undefined}
                        </React.Fragment>
                      )
                    })}
                  </Box>
                </Flex>
              </React.Fragment>
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

export default FinanceServiceLicenseGroupForm
