import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex, Grid, Label } from 'theme-ui'
import { Button, Pill, TextField, UpdateFileForm } from '..'
import {
  GET_COMPANY_OVERRIDES_HISTORY,
  GET_SIGN_URL_FOR_OTHERS,
  OVERRIDE_COMPANY_DATA,
} from '../../pages/CompanyForm/graphql'
import { ChangeFieldEvent, FileState } from '../../types'
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
import { isURL } from '../../utils'
import AutoCompleteField from './AutoCompleteField'

type CurrentClientFormProps = {
  acceptTypes: AcceptedType
  isEdit?: boolean
  state?: CurrentClient[]
  editState?: CurrentClientResult[]
  companyId: number
  buttonLabel: string
  placeholder?: string
  onChange?(arr: CurrentClient[]): void
  onChangeEdit?(arr: CurrentClientResult[]): void
  onAddField?(): void
  oldState?: CurrentClientResult[]
  setOldState?(v: CurrentClientResult[]): void
  disabled?: boolean
  uploadFiles?: (files: FileState[]) => Promise<string[]>
  setError(err: Error): void
  checkDuplicate?(err: CurrentClient): boolean

  // Change request
  overviewPendingRequest?: HasPendingCQField[]
  refetchViewPendingChangeRequestCols?: () => Promise<any>
  handleClickShowPendingCR?: IHandleClickShowPendingCR
  showPendingChangeRequest?: IShowPendingChangeRequest
  handleAppendDataCQAction?: IHandleAppendDataCQAction
  isOverridesUser?: boolean
  handleUpdateStatus?: IHandleUpdateStatus
} & ViewHistoryProps

export type CurrentClientResult = {
  company_id: number
  company_client_id: string
  client_id: number
  name: string
  logo_bucket_url: string
  url: string
  fct_status_id: number
  self_declared: number
}

export type CurrentClient = {
  client_id?: number
  name: string
  file?: FileState
  logo_bucket_url?: string
  url?: string
}

const columns = {
  NAME: 'name',
  LOGO_BUCKET_URL: 'logo_bucket_url',
  URL: 'url',
}

const fields: {
  field: keyof CurrentClientResult
  isFile: boolean
  label: string
  placeholder?: string
}[] = [
  {
    field: columns.NAME as keyof CurrentClientResult,
    label: 'Name*',
    isFile: false,
    placeholder: 'Client name',
  },
  {
    field: columns.LOGO_BUCKET_URL as keyof CurrentClientResult,
    label: 'Logo',
    isFile: true,
  },
  {
    field: columns.URL as keyof CurrentClientResult,
    label: 'Url',
    isFile: false,
  },
]

const CurrentClientForm = ({
  acceptTypes,
  isEdit,
  state = [],
  editState = [],
  companyId,
  buttonLabel,
  onChange,
  onChangeEdit = e => {},
  showViewHistory,
  refetchViewHistoryCols,
  onAddField,
  oldState = [],
  setOldState = () => {},
  disabled,
  uploadFiles,
  setError,
  checkDuplicate,

  overviewPendingRequest = [],
  refetchViewPendingChangeRequestCols = async () => {},
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
}: CurrentClientFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const client = useApolloClient()

  // GRAPHQL
  const [onEditClient, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [comment, setComment] = useState('')
  const [historyModal, setHistoryModal] = useState(false)
  const [fileModal, setFileModal] = useState(false)
  const [editItem, setEditItem] = useState<CurrentClientResult | undefined>()
  const [updating, setUpdating] = useState<boolean>(false)
  const [fileState, setFileState] = useState<FileState[]>([])

  const onChangeField = (
    value: any,
    client: CurrentClient,
    index: number,
    field: keyof CurrentClient
  ) => {
    const cloneState = [...state]
    cloneState[index] = {
      ...client,
      [field]: value,
      client_id: undefined,
      logo_bucket_url: field === 'file' ? undefined : client.logo_bucket_url,
    }
    onChange && onChange(cloneState)
  }

  const onChangeEditField = (value: string, id: number, field: string) => {
    onChangeEdit &&
      onChangeEdit(
        editState.map(item => {
          return item.client_id === id ? { ...item, [field]: value } : item
        })
      )
  }

  const onUpdateClient = async (item: CurrentClientResult, field: keyof CurrentClientResult) => {
    if (!checkTimeETL()) return
    const isAppendData = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST
    const input = [
      {
        companyId: +item.company_id,
        reason: comment,
        id: `${item.client_id}`,
        oldValue: getValue(
          field,
          oldState.find(
            (e: CurrentClientResult) => e.client_id === item.client_id
          ) as CurrentClientResult
        ),
        newValue: getValue(field, item),
        tableName: TableNames.CURRENT_CLIENTS,
        columnName: field,
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditClient({
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

  const getValue = React.useCallback(
    (fieldName: keyof CurrentClientResult, item: CurrentClientResult) => {
      return item?.[fieldName]
    },
    []
  )

  const invalidName = (e: CurrentClient) => {
    return e.name?.trim() === '' || (!!checkDuplicate && checkDuplicate(e))
  }

  const fieldState = React.useCallback((field: keyof CurrentClientResult, value?: string) => {
    if (!value || !value.trim().length) return 'default'
    if (field === columns.URL && !isURL(value)) return 'error'
    return 'default'
  }, [])

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
                tableName: TableNames.COMPANIES_CURRENT_CLIENTS,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: item.company_client_id?.toString(),
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.COMPANIES_CURRENT_CLIENTS)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          return (
            <Flex
              id={`client-${item.company_client_id}`}
              key={index}
              sx={{
                mb: 4,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                padding: `30px 24px`,
                borderRadius: 10,
                border: `1px solid`,
                borderColor: `gray02`,
              }}
            >
              <Box id={`client-${item.client_id}`} sx={{ width: '85%' }}>
                <Grid gap={5} columns={[2, null, 2]}>
                  {fields.map(({ field: fieldName, isFile, label, placeholder }) => {
                    const isShowViewHistory = showViewHistory(
                      TableNames?.CURRENT_CLIENTS,
                      fieldName,
                      item.client_id?.toString(),
                      EnumCompanySource.BCG
                    )
                    const oldValue = getValue(fieldName, oldState[index])
                    const newValue = getValue(fieldName, item)
                    const cannotUpdate =
                      invalidUpdateData(
                        oldValue as string,
                        newValue as string,
                        comment,
                        isOverridesUser,
                        false,
                        isAppendCQ
                      ) || !newValue

                    const { total: numPending } = findCQ(
                      overviewPendingRequest,
                      {
                        tableName: TableNames.CURRENT_CLIENTS,
                        columnName: fieldName,
                        rowId: item.client_id?.toString(),
                        source: EnumCompanySource.BCG,
                      },
                      SourceIndependentTables.includes(TableNames.CURRENT_CLIENTS)
                    ) || {
                      total: 0,
                    }

                    const isShowPendingCQ = numPending > 0

                    const value = item[fieldName]?.toString()?.trim()

                    return (
                      <ReasonPopover
                        key={`field-${item.client_id}-${fieldName}`}
                        sx={{
                          ...{ flex: 1 },
                          ...(fieldName === columns.URL
                            ? { gridColumnStart: 1, gridColumnEnd: 3 }
                            : {}),
                        }}
                        reasonRequired={reasonRequired}
                        zIndex={popoverZIndex}
                        disabled={!isEdit || fieldDisabled}
                        positions={['top', 'bottom']}
                        buttons={[
                          {
                            label: isEdit ? 'Submit' : 'Update',
                            action: () => onUpdateClient(item, fieldName),
                            type: 'primary',
                            isCancel: true,
                            disabled:
                              loading ||
                              cannotUpdate ||
                              fieldState(fieldName, `${item?.[fieldName] || ''}`) === 'error',
                          },
                        ]}
                        oldValue={oldValue as string}
                        newValue={newValue as string}
                        reason={comment}
                        setReason={setComment}
                        label={label}
                        labelSx={{ mb: 3 }}
                        // Note RevertChange After Submit
                        callCancelCBAfterAction={callCancelCBAfterAction}
                        onCancelCallBack={() =>
                          onChangeEditField(oldValue?.toString() || '', item.client_id, fieldName)
                        }
                        onClickOutSide={() =>
                          onChangeEditField(oldValue?.toString() || '', item.client_id, fieldName)
                        }
                        viewHistory={
                          !isShowViewHistory
                            ? undefined
                            : () => {
                                setHistoryModal(true)
                                getHistory({
                                  variables: {
                                    input: {
                                      tableName: TableNames?.CURRENT_CLIENTS,
                                      columnName: fieldName,
                                      companyId: +(companyId || 0),
                                      rowId: item.client_id.toString(),
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
                                  tableName: TableNames?.CURRENT_CLIENTS,
                                  columnName: fieldName,
                                  companyId: +(companyId || 0),
                                  rowId: item.client_id.toString(),
                                  source: EnumCompanySource.BCG,
                                })
                              }
                        }
                        totalItemPendingCR={numPending}
                        disablePopover={isFile}
                      >
                        {isFile ? (
                          <Box>
                            <Flex
                              sx={{
                                alignItems: 'center',
                                width: '100%',
                                bg: 'gray03',
                                py: value ? 3 : '7px',
                                px: 4,
                                borderRadius: 8,
                                opacity: !fieldDisabled ? 1 : 0.5,
                              }}
                            >
                              {!value ? (
                                <Pill
                                  sx={{ width: 'fit-content' }}
                                  label={`Empty`}
                                  variant="muted"
                                />
                              ) : (
                                <Paragraph
                                  onClick={() => {
                                    !updating && onDownloadFile(newValue as string)
                                  }}
                                  sx={{ color: 'primary', cursor: updating ? 'wait' : 'pointer' }}
                                  bold
                                >
                                  {value}
                                </Paragraph>
                              )}
                              {!fieldDisabled && (
                                <Button
                                  sx={{ height: 'auto' }}
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
                          </Box>
                        ) : (
                          <Box>
                            <TextField
                              name={`name-${item.client_id}`}
                              key={`name-${item.client_id}`}
                              required
                              fieldState={fieldState(fieldName, `${item?.[fieldName] || ''}`)}
                              value={item[fieldName] || ''}
                              onChange={(event: ChangeFieldEvent) =>
                                onChangeEditField(event.target.value, item.client_id, fieldName)
                              }
                              placeholder={placeholder}
                              onBlur={() => {}}
                              disabled={fieldDisabled}
                            />
                          </Box>
                        )}
                      </ReasonPopover>
                    )
                  })}
                </Grid>
              </Box>
              <Box sx={{ mb: 16 }}>
                <FCTStatusAction
                  disabled={disabled}
                  reasonRequired={reasonRequired}
                  identity={{
                    tableName: TableNames.COMPANIES_CURRENT_CLIENTS,
                    columnName: ColumnNames.FCT_STATUS_ID,
                    rowId: item.company_client_id.toString(),
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
                      id: identity.rowId?.toString(),
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
              </Box>
            </Flex>
          )
        })}
      {!isEdit &&
        state.map((e: CurrentClient, index: number) => {
          return (
            <Flex
              key={index}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}
            >
              <Box sx={{ flex: 1 }}>
                <Grid gap={5} columns={[2, null, 2]}>
                  <AutoCompleteField
                    state={e}
                    onChange={item => {
                      const cloneState = [...state]
                      cloneState[index] = item
                      onChange && onChange(cloneState)
                    }}
                    index={index}
                    invalidName={invalidName(e)}
                  />
                  {e.client_id || e.logo_bucket_url ? (
                    <Box>
                      <Label sx={{ mb: 3 }}>Logo</Label>
                      <Flex
                        sx={{
                          alignItems: 'center',
                          width: '100%',
                          bg: 'gray03',
                          py: e.logo_bucket_url ? 3 : '7px',
                          px: 4,
                          borderRadius: 8,
                        }}
                      >
                        {!e.logo_bucket_url ? (
                          <Pill sx={{ width: 'fit-content' }} label={`Empty`} variant="muted" />
                        ) : (
                          <Paragraph
                            onClick={() => {
                              !updating && onDownloadFile(e.logo_bucket_url as string)
                            }}
                            sx={{ color: 'primary', cursor: updating ? 'wait' : 'pointer' }}
                            bold
                          >
                            {e.logo_bucket_url}
                          </Paragraph>
                        )}
                        <Button
                          sx={{ height: 'auto' }}
                          color="primary"
                          variant="invert"
                          icon="pencil"
                          onPress={async () => {
                            setEditItem(e as CurrentClientResult)
                            setFileModal(true)
                          }}
                        />
                      </Flex>
                    </Box>
                  ) : (
                    <UploadFile
                      setFileState={(files: FileState[]) => {
                        onChangeField(files[0], e, index, 'file' as keyof CurrentClient)
                      }}
                      fileState={e.file ? [e.file] : []}
                      label="Logo"
                      accept={acceptTypes.format || []}
                      invalidFn={f => !validateFile(acceptTypes.format, f)}
                      multiple={false}
                    />
                  )}
                  <TextField
                    name={`add-url-${index}`}
                    sx={{ gridColumnStart: 1, gridColumnEnd: 3 }}
                    label="Url*"
                    labelSx={{ mb: 3 }}
                    fieldState={
                      fieldState(columns.URL as keyof CurrentClientResult, e.url) === 'error' ||
                      (checkDuplicate && checkDuplicate(e))
                        ? 'error'
                        : 'default'
                    }
                    value={e.url || ''}
                    onChange={(event: ChangeFieldEvent) =>
                      onChangeField(
                        event.target.value,
                        e,
                        index,
                        columns.URL as keyof CurrentClient
                      )
                    }
                    onBlur={() => {}}
                  />
                </Grid>
              </Box>
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
                  if (isEdit) {
                    if (editItem && companyId && uploadFiles && !!fileState.length) {
                      const ids = await uploadFiles(fileState)
                      isOverridesUser &&
                        onChangeEditField(ids[0], editItem.client_id, columns.LOGO_BUCKET_URL)
                      await onUpdateClient(
                        { ...editItem, [columns.LOGO_BUCKET_URL]: ids[0] },
                        columns.LOGO_BUCKET_URL as keyof CurrentClientResult
                      )
                    }
                  } else {
                    const index = state.findIndex(c => c.client_id === editItem?.client_id)
                    if (index > -1 && editItem) {
                      onChangeField(
                        fileState[0],
                        editItem as CurrentClient,
                        index,
                        'file' as keyof CurrentClient
                      )
                      setEditItem(undefined)
                    }
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

export default CurrentClientForm
