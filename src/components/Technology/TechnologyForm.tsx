import { useLazyQuery, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, Dropdown, TextField } from '..'
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
  TECHNOLOGY_TYPE_ID,
} from '../../pages/CompanyForm/helpers'
import { HasPendingCQField, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import { FieldTypes } from '../TextField'
import { Palette } from '../../theme'
import { popoverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import {
  IHandleAppendDataCQAction,
  IHandleClickShowPendingCR,
  IHandleUpdateStatus,
} from '../../pages/CompanyForm/provider/CompanyContext'
import { IShowPendingChangeRequest } from '../../hooks/useChangeRequest'
import { ETLRunTimeContext, UserContext } from '../../context'
import { Technology } from '../../pages/CompanyForm/TechnologyForm'
import { CertificationType } from '../../pages/CompanyForm/CertificationForm'

type ProfileFormProps = {
  getUser?(): string
  isEdit?: boolean
  state?: string[]
  editState?: Technology[]
  companyId: number
  type: FieldTypes
  buttonLabel: string
  placeholder?: string
  onChange?(arr: string[]): void
  onChangeEdit?(arr: Technology[]): void
  onAddField?(): void
  oldState?: Technology[]
  setOldState?(v: Technology[]): void
  validate(v: string | number, dataType: TECHNOLOGY_TYPE_ID, maxlength?: number): keyof FieldStates
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
  dataType: TECHNOLOGY_TYPE_ID
  options?: CertificationType[]
} & ViewHistoryProps

const TechnologyForm = ({
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
  dataType,
  options,
}: ProfileFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const [onEditTechnology, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [comment, setComment] = useState('')
  const [historyModal, setHistoryModal] = useState(false)

  const onChangeField = (value: string, index: number) => {
    const cloneState = [...state]
    cloneState[index] = value
    onChange && onChange(cloneState)
  }

  const onChangeEditField = (value: string, id: number) => {
    onChangeEdit &&
      onChangeEdit(
        editState.map(item => {
          return item.technology_id === id ? { ...item, technology_value: value } : item
        })
      )
  }

  const onUpdateTechnology = async (item: Technology) => {
    if (!checkTimeETL()) return
    const isAppendData = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST
    const input = [
      {
        companyId: +companyId,
        reason: comment,
        id: item.technology_id.toString(),
        oldValue: oldState.find((e: Technology) => e.technology_id === item.technology_id)
          ?.technology_value,
        newValue: item.technology_value,
        tableName: TableNames.TECHNOLOGY,
        columnName: ColumnNames.TECHNOLOGY_VALUE,
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditTechnology({
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

  return (
    <Box sx={{ mt: 4 }}>
      {isEdit &&
        editState?.map((item, index: number) => {
          const isFollowing = item.fct_status_id === +EnumExpandStatusId.FOLLOWING
          const isAppendCQ = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST

          const users =
            findCQ(
              overviewPendingRequest,
              {
                tableName: TableNames.TECHNOLOGY,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: item.technology_id?.toString(),
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.PROFILE)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          const isShowViewHistory = showViewHistory(
            TableNames?.TECHNOLOGY,
            ColumnNames.TECHNOLOGY_VALUE,
            item.technology_id?.toString(),
            EnumCompanySource.BCG
          )
          const oldValue = oldState[index]?.technology_value
          const fieldState = validate(item.technology_value, dataType)
          const cannotUpdate =
            fieldState === 'error' ||
            invalidUpdateData(
              oldValue,
              item.technology_value,
              comment,
              isOverridesUser,
              false,
              isAppendCQ
            ) ||
            !item.technology_value

          const { total: numPending } = findCQ(
            overviewPendingRequest,
            {
              tableName: TableNames.TECHNOLOGY,
              columnName: ColumnNames.TECHNOLOGY_VALUE,
              rowId: item.technology_id?.toString(),
              source: EnumCompanySource.BCG,
            },
            SourceIndependentTables.includes(TableNames.TECHNOLOGY)
          ) || {
            total: 0,
          }

          const isShowPendingCQ = numPending > 0

          return (
            <Flex
              key={item.technology_id}
              id={`technology_${item.technology_id}`}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
            >
              <ReasonPopover
                sx={{ flex: 1 }}
                key={`technology-${item.technology_id}`}
                reasonRequired={reasonRequired}
                zIndex={popoverZIndex}
                disabled={!isEdit || fieldDisabled}
                positions={['top', 'bottom']}
                buttons={[
                  {
                    label: isEdit ? 'Submit' : 'Update',
                    action: () => onUpdateTechnology(item),
                    type: 'primary',
                    isCancel: true,
                    disabled: loading || cannotUpdate,
                  },
                ]}
                oldValue={oldValue}
                newValue={item.technology_value}
                reason={comment}
                setReason={setComment}
                label={isShowViewHistory || isShowPendingCQ ? ' ' : ''}
                // Note RevertChange After Submit
                callCancelCBAfterAction={callCancelCBAfterAction}
                onCancelCallBack={() => onChangeEditField(oldValue, item.technology_id)}
                onClickOutSide={() => onChangeEditField(oldValue, item.technology_id)}
                viewHistory={
                  !isShowViewHistory
                    ? undefined
                    : () => {
                        setHistoryModal(true)
                        getHistory({
                          variables: {
                            input: {
                              tableName: TableNames?.TECHNOLOGY,
                              columnName: ColumnNames.TECHNOLOGY_VALUE,
                              companyId: companyId ? +companyId : 0,
                              rowId: item.technology_id.toString(),
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
                          tableName: TableNames?.TECHNOLOGY,
                          columnName: ColumnNames.TECHNOLOGY_VALUE,
                          companyId: companyId ? +companyId : 0,
                          rowId: item.technology_id.toString(),
                          source: EnumCompanySource.BCG,
                        })
                      }
                }
                totalItemPendingCR={numPending}
              >
                {dataType === TECHNOLOGY_TYPE_ID?.ENGINEERING ? (
                  <TextField
                    name={`edit-${item.technology_id}`}
                    key={`edit-${item.technology_id}`}
                    disabled={fieldDisabled}
                    fieldState={fieldState}
                    value={item.technology_value}
                    onChange={(event: ChangeFieldEvent) =>
                      onChangeEditField(event.target.value, item.technology_id)
                    }
                    placeholder={placeholder}
                    onBlur={() => {}}
                    type={type}
                  />
                ) : (
                  <Dropdown
                    placeholder={placeholder || ''}
                    name={`edit${index}`}
                    onChange={(event: ChangeFieldEvent) =>
                      onChangeEditField(event.target.value, item.technology_id)
                    }
                    value={item.technology_value}
                    key={`edit-${item.technology_id}`}
                    sx={{ width: '100%' }}
                    disabled={fieldDisabled}
                    fieldState={fieldState}
                    options={options || []}
                  />
                )}
              </ReasonPopover>
              {item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST && (
                <FCTStatusAction
                  disabled={disabled}
                  reasonRequired={reasonRequired}
                  identity={{
                    tableName: TableNames.TECHNOLOGY,
                    columnName: ColumnNames.FCT_STATUS_ID,
                    rowId: item.technology_id.toString(),
                    source: EnumCompanySource.BCG,
                  }}
                  fctStatusId={item.fct_status_id.toString() as EnumExpandStatusId}
                  selfDeclared={!!item.self_declared}
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
                    const newValue = isFollowing
                      ? EnumExpandStatusId.UNFOLLOWED
                      : EnumExpandStatusId.FOLLOWING
                    const input = {
                      id: identity.rowId,
                      tableName: identity.tableName,
                      columnName: identity.columnName,
                      source: identity.source as string,
                      companyId: +companyId,
                      reason: reason,
                      newValue,
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
          )
        })}

      {!isEdit &&
        state.map((e: string, index: number) => {
          return (
            <Flex key={index} sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
              {dataType === TECHNOLOGY_TYPE_ID?.ENGINEERING ? (
                <TextField
                  name={`edit${index}`}
                  key={`add-${index}`}
                  fieldState={validate(e, dataType)}
                  value={e}
                  onChange={(event: ChangeFieldEvent) => onChangeField(event.target.value, index)}
                  placeholder={placeholder}
                  onBlur={() => {}}
                  type={type}
                />
              ) : (
                <Dropdown
                  placeholder={placeholder || ''}
                  sx={{ width: '100%' }}
                  name={`edit${index}`}
                  onChange={(event: ChangeFieldEvent) => onChangeField(event.target.value, index)}
                  value={e}
                  key={`add-${index}`}
                  fieldState={validate(e, dataType)}
                  options={options || []}
                />
              )}

              {state.length > 1 && (
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

      {!state.length && !editState.length && (
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
    </Box>
  )
}

export default TechnologyForm
