import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, TextField, UpdateFileForm } from '..'
import {
  GET_COMPANY_OVERRIDES_HISTORY,
  GET_SIGN_URL_FOR_OTHERS,
  OVERRIDE_COMPANY_DATA,
} from '../../pages/CompanyForm/graphql'
import { ChangeFieldEvent, FieldStates, FileState } from '../../types'
import ReasonPopover from '../ReasonPopover'
import {
  EnumCompanySource,
  ENumDataType,
  EnumExpandStatusId,
  EnumSignUrlOperation,
} from '../../types/enums'
import Modal from '../Modal'
import { Heading, Paragraph } from '../primitives'
import strings from '../../strings'
import { OverridesHistory } from '../OverridesHistory'
import {
  AcceptedType,
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  SourceIndependentTables,
  TableNames,
  validateFile,
} from '../../pages/CompanyForm/helpers'
import { HasPendingCQField, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
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
import { UploadFile } from '../UploadFile'

type UseCaseFormProps = {
  canBeAdd: boolean
  isFile: boolean
  isMultiple: boolean
  acceptTypes: AcceptedType
  isEdit?: boolean
  state?: string[]
  editState?: UseCaseResult[]
  companyId: number
  buttonLabel: string
  placeholder?: string
  onChange?(arr: string[]): void
  onChangeEdit?(arr: UseCaseResult[]): void
  onAddField?(): void
  oldState?: UseCaseResult[]
  setOldState?(v: UseCaseResult[]): void
  validate(v: string, maxlength?: number): keyof FieldStates
  disabled?: boolean
  fileState: FileState[]
  setFileState?(v: FileState[]): void
  uploadFiles?: () => Promise<string[]>
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

export type UseCaseResult = {
  company_id: number
  use_case_id: number
  use_case_type_id: number
  use_case_value: string
  fct_status_id: number
}

const UseCaseForm = ({
  canBeAdd,
  isFile,
  isMultiple,
  acceptTypes,
  isEdit,
  state = [],
  editState = [],
  companyId,
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
  fileState,
  setFileState = () => {},
  uploadFiles,
  setError,

  overviewPendingRequest = [],
  refetchViewPendingChangeRequestCols = async () => {},
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
}: UseCaseFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const client = useApolloClient()

  // GRAPHQL
  const [onEditUseCase, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [comment, setComment] = useState('')
  const [historyModal, setHistoryModal] = useState(false)
  const [fileModal, setFileModal] = useState(false)
  const [editItem, setEditItem] = useState<UseCaseResult | undefined>()
  const [updating, setUpdating] = useState<boolean>(false)

  const onChangeField = (value: string, index: number) => {
    const cloneState = [...state]
    cloneState[index] = value
    onChange && onChange(cloneState)
  }

  const onChangeEditField = (value: string, id: number) => {
    onChangeEdit &&
      onChangeEdit(
        editState.map(item => {
          return item.use_case_id === id ? { ...item, use_case_value: value } : item
        })
      )
  }

  const onBlurField = () => {}

  const onUpdateUseCase = async (item: UseCaseResult) => {
    if (!checkTimeETL()) return
    const isAppendData = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST
    const input = [
      {
        companyId: +item.company_id,
        reason: comment,
        id: `${item.use_case_id}`,
        oldValue: oldState.find((e: UseCaseResult) => e.use_case_id === item.use_case_id)
          ?.use_case_value,
        newValue: item.use_case_value,
        tableName: TableNames.USE_CASE,
        columnName: ColumnNames.USE_CASE_VALUE,
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditUseCase({
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
      onChangeEdit(oldState)
      setError(error)
    }
  }

  const onRemove = (index: number) => {
    const cloneState = [...state]
    cloneState.splice(index, 1)
    onChange && onChange(cloneState)
  }

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: ENumDataType.USE_CASE,
        operation: EnumSignUrlOperation.GET,
        ids: [value],
        content_types: [],
      }
      const res = await client.query({
        query: GET_SIGN_URL_FOR_OTHERS,
        variables: { input },
        fetchPolicy: 'network-only',
      })
      if (res.data.getOthersSignUrl) {
        window.open(res.data.getOthersSignUrl[0].signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      setError(error)
    } finally {
      setUpdating(false)
    }
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
                tableName: TableNames.USE_CASE,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: `${item.use_case_id}`,
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.USE_CASE)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          const isShowViewHistory = showViewHistory(
            TableNames.USE_CASE,
            ColumnNames.USE_CASE_VALUE,
            `${item.use_case_id}`,
            EnumCompanySource.BCG
          )

          const oldValue = oldState[index]?.use_case_value
          const fieldState = validate(item.use_case_value)
          const cannotUpdate =
            fieldState === 'error' ||
            invalidUpdateData(
              oldValue,
              item.use_case_value,
              comment,
              isOverridesUser,
              false,
              isAppendCQ
            ) ||
            !item.use_case_value

          const { total: numPending } = findCQ(overviewPendingRequest, {
            tableName: TableNames.USE_CASE,
            columnName: ColumnNames.USE_CASE_VALUE,
            rowId: `${item.use_case_id}`,
            source: EnumCompanySource.BCG,
          }) || {
            total: 0,
          }

          const isShowPendingCQ = numPending > 0

          return (
            <Flex
              id={`${item.use_case_id}`}
              key={item.use_case_id}
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
                    action: () => onUpdateUseCase(item),
                    type: 'primary',
                    isCancel: true,
                    disabled: loading || cannotUpdate,
                  },
                ]}
                oldValue={oldValue}
                newValue={item.use_case_value}
                reason={comment}
                setReason={setComment}
                label={isShowViewHistory || isShowPendingCQ ? ' ' : ''}
                // Note RevertChange After Submit
                callCancelCBAfterAction={callCancelCBAfterAction}
                onCancelCallBack={() => onChangeEditField(oldValue, item.use_case_id)}
                onClickOutSide={() => onChangeEditField(oldValue, item.use_case_id)}
                viewHistory={
                  !isShowViewHistory
                    ? undefined
                    : () => {
                        setHistoryModal(true)
                        getHistory({
                          variables: {
                            input: {
                              tableName: TableNames?.USE_CASE,
                              columnName: ColumnNames.USE_CASE_VALUE,
                              companyId: companyId ? +companyId : 0,
                              rowId: `${item.use_case_id}`,
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
                          tableName: TableNames?.USE_CASE,
                          columnName: ColumnNames.USE_CASE_VALUE,
                          companyId: companyId ? +companyId : 0,
                          rowId: `${item.use_case_id}`,
                          source: EnumCompanySource.BCG,
                        })
                      }
                }
                totalItemPendingCR={numPending}
                disablePopover={isFile}
              >
                {isFile ? (
                  <Flex
                    sx={{
                      alignItems: 'center',
                      width: '100%',
                      bg: 'gray03',
                      py: 3,
                      px: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Paragraph
                      onClick={() => {
                        !updating && onDownloadFile(item.use_case_value)
                      }}
                      sx={{ color: 'primary', cursor: updating ? 'wait' : 'pointer' }}
                      bold
                    >
                      {item.use_case_value}
                    </Paragraph>
                    {!fieldDisabled && (
                      <Button
                        sx={{ height: 'auto' }}
                        key={index}
                        color="primary"
                        variant="invert"
                        icon="pencil"
                        onPress={async () => {
                          setEditItem(item)
                          setFileModal(true)
                        }}
                      />
                    )}
                  </Flex>
                ) : (
                  <TextField
                    name={`edit${index}`}
                    key={index}
                    disabled={fieldDisabled}
                    fieldState={fieldState}
                    value={item.use_case_value}
                    onChange={(event: ChangeFieldEvent) =>
                      onChangeEditField(event.target.value, item.use_case_id)
                    }
                    placeholder={placeholder}
                    onBlur={() => {}}
                  />
                )}
              </ReasonPopover>

              {(isMultiple || item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST) && (
                <FCTStatusAction
                  disabled={disabled}
                  reasonRequired={reasonRequired}
                  identity={{
                    tableName: TableNames.USE_CASE,
                    columnName: ColumnNames.FCT_STATUS_ID,
                    rowId: `${item.use_case_id}`,
                    source: EnumCompanySource.BCG,
                  }}
                  fctStatusId={`${item.fct_status_id}` as EnumExpandStatusId}
                  // selfDeclared={!!item.selfDeclared}
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
              )}
            </Flex>
          )
        })}

      {!isEdit && (
        <>
          {state.map((e: string, index: number) => {
            return (
              <Flex
                key={index}
                sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}
              >
                {isFile ? (
                  <UploadFile
                    sx={{ mb: 4, width: '100%' }}
                    setFileState={setFileState}
                    fileState={fileState || []}
                    label="File Name*"
                    accept={acceptTypes.format || []}
                    invalidFn={f => !validateFile(acceptTypes.format, f)}
                    multiple={isMultiple}
                  />
                ) : (
                  <>
                    <TextField
                      name={`use-case-${index}`}
                      fieldState={validate(e)}
                      value={e}
                      onChange={(event: ChangeFieldEvent) =>
                        onChangeField(event.target.value, index)
                      }
                      placeholder={placeholder}
                      onBlur={onBlurField}
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
                  </>
                )}
              </Flex>
            )
          })}
          {isFile && fileState.some(v => !validateFile(acceptTypes.format, v)) && (
            <Paragraph sx={{ mt: -4, color: 'red' }}>{acceptTypes.invalidText}</Paragraph>
          )}
        </>
      )}

      {canBeAdd && (
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

      {fileModal && (
        <Modal
          sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '300px' }}
          buttonsStyle={{
            justifyContent: 'flex-end',
            width: '100%',
          }}
          buttons={[
            {
              label: strings.common.cancel,
              type: 'secondary',
              sx: { p: '10px 60px' },
              action: () => {
                setFileState([])
                setFileModal(false)
                setComment('')
              },
            },
            {
              label: strings.common.submit,
              type: 'primary',
              sx: { p: '10px 60px' },
              disabled:
                !validateFile(acceptTypes.format, (fileState || [])[0]) ||
                (!isOverridesUser &&
                  editItem?.fct_status_id === +EnumExpandStatusId.FOLLOWING &&
                  !comment),
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setUpdating(true)
                  if (editItem && companyId && uploadFiles) {
                    const ids = await uploadFiles()
                    onChangeEditField(ids[0], editItem.use_case_id)
                    await onUpdateUseCase({ ...editItem, use_case_value: ids[0] })
                  }
                } catch (error) {
                  setError(error)
                } finally {
                  setUpdating(false)
                  setFileModal(false)
                }
              },
            },
          ]}
          updating={updating}
        >
          <Heading sx={{ fontWeight: 300, mb: 4 }} as={'h4'}>
            {copy.buttons.upload}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', width: '100%', pr: 12 }}>
            <UpdateFileForm
              state={(fileState || [])[0]}
              onChangeFile={setFileState}
              reason={comment}
              setReason={setComment}
              reasonRequired={
                !isOverridesUser && editItem?.fct_status_id === +EnumExpandStatusId.FOLLOWING
              }
              hideReason={!isEdit}
              invalid={!!fileState[0] && !validateFile(acceptTypes.format, (fileState || [])[0])}
              acceptTypes={acceptTypes}
            />
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default UseCaseForm
