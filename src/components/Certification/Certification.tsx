import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, Dropdown, Pill, TextField, UpdateFileForm } from '..'
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
  CertificationTypeEnum,
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  NotOtherCertificationValues,
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
import { Certification, CertificationType } from '../../pages/CompanyForm/CertificationForm'
import { UploadFile } from '../UploadFile'

type ProfileFormProps = {
  getUser?(): string
  isEdit?: boolean
  state?: Certification[]
  editState?: Certification[]
  companyId: number
  buttonLabel: string
  placeholder?: string
  onChange?(arr: Certification[]): void
  onChangeEdit?(arr: Certification[]): void
  onAddField?(): void
  oldState?: Certification[]
  setOldState?(v: Certification[]): void
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
  fileState: FileState[]
  setFileState(f: FileState[]): void
  acceptTypes: AcceptedType
  uploadFiles?: (files?: FileState[]) => Promise<string[]>
  certificationTypes: CertificationType[]
  validate?(e: Certification): keyof FieldStates
} & ViewHistoryProps

const fields: { field: keyof Certification; isFile: boolean }[] = [
  {
    field: ColumnNames?.CERTIFICATION as keyof Certification,
    isFile: false,
  },
  {
    field: ColumnNames?.CERTIFICATION_BUCKET_KEY as keyof Certification,
    isFile: true,
  },
]

const CertificationEditForm = ({
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
  disabled,

  overviewPendingRequest = [],
  refetchViewPendingChangeRequestCols = async () => {},
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
  fileState,
  setFileState,
  acceptTypes,
  uploadFiles,
  certificationTypes,
  validate,
  setError,
}: ProfileFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const [onEditCertification, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [comment, setComment] = useState('')
  const [historyModal, setHistoryModal] = useState(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [fileModal, setFileModal] = useState(false)
  const [editItem, setEditItem] = useState<Certification | undefined>()

  const onChangeField = (
    value: any,
    certification: Certification,
    index: number,
    field: keyof Certification
  ) => {
    const cloneState = [...state]
    const certificationOtherValue = (() => {
      switch (field) {
        case ColumnNames.CERTIFICATION_OTHER:
          return value
        case ColumnNames.CERTIFICATION:
          return ''
        default:
          return certification.certification_other_value
      }
    })()

    cloneState[index] = {
      ...certification,
      [field]: value,
      certification_other_value: certificationOtherValue,
    }
    onChange && onChange(cloneState)
  }

  const onChangeEditField = (
    value: string | number,
    id: number,
    field: string,
    isCallBack = false
  ) => {
    onChangeEdit &&
      onChangeEdit(
        editState.map(item => {
          if (isCallBack && field === ColumnNames.CERTIFICATION) {
            const oldItem = oldState.find(({ certification_id }) => certification_id === id)
            const certification = oldItem?.certification as string
            const otherValue = oldItem?.certification_other_value as string
            return item.certification_id === id
              ? {
                  ...item,
                  [field]: certification,
                  certification_other_value:
                    certification === CertificationTypeEnum.Other ? otherValue : '',
                }
              : item
          }
          return item.certification_id === id ? { ...item, [field]: value } : item
        })
      )
  }

  const onUpdateCertification = async (item: Certification, field: keyof Certification) => {
    if (!checkTimeETL()) return
    const isAppendData = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST
    const newValue = getValue(field, item)
    const input = [
      {
        companyId: +companyId,
        reason: comment,
        id: item.certification_id.toString(),
        oldValue: getValue(
          field,
          oldState.find(
            (e: Certification) => e.certification_id === item.certification_id
          ) as Certification
        ),
        newValue,
        tableName: TableNames.CERTIFICATION,
        columnName: field,
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditCertification({
        variables: {
          input,
          isAppendData,
        },
      })
      const mapFn =
        field === 'certification' &&
        NotOtherCertificationValues?.includes((newValue as string)?.trim())
          ? (c: Certification) =>
              item.certification_id === c.certification_id
                ? ({
                    ...c,
                    certification: newValue,
                    certification_other_value: '',
                  } as Certification)
                : c
          : null
      if (isOverridesUser || isAppendData) {
        const cloneState = mapFn ? (editState || []).map(mapFn) : editState
        if (mapFn) {
          onChangeEditField(newValue as string, item.certification_id, ColumnNames.CERTIFICATION)
        }
        setOldState(cloneState)
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

  const client = useApolloClient()

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: ENumDataType.TECHNOLOGY,
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

  const condition = (fieldName: keyof Certification, item: Certification) => {
    return (
      fieldName === ColumnNames.CERTIFICATION && item?.[fieldName] === CertificationTypeEnum.Other
    )
  }

  const getValue = (fieldName: keyof Certification, item: Certification) => {
    if (condition(fieldName, item)) return item?.certification_other_value
    return item?.[fieldName]
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
                tableName: TableNames.CERTIFICATION,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: item.certification_id?.toString(),
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.CERTIFICATION)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          return (
            <Flex
              id={`certification_${item.certification_id}`}
              key={`certification-` + item.certification_id}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'start', gap: 2 }}
            >
              <Box sx={{ width: '85%' }}>
                <Flex sx={{ justifyContent: 'start', gap: 3, alignItems: 'start' }}>
                  {fields.map(({ field: fieldName, isFile }) => {
                    const isShowViewHistory = showViewHistory(
                      TableNames?.CERTIFICATION,
                      fieldName,
                      item.certification_id?.toString(),
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
                        tableName: TableNames.CERTIFICATION,
                        columnName: fieldName,
                        rowId: item.certification_id?.toString(),
                        source: EnumCompanySource.BCG,
                      },
                      SourceIndependentTables.includes(TableNames.CERTIFICATION)
                    ) || {
                      total: 0,
                    }

                    const isShowPendingCQ = numPending > 0

                    const value = item[fieldName]?.toString()?.trim()

                    return (
                      <ReasonPopover
                        key={`field-${item.certification_id}-${fieldName}`}
                        sx={{ flex: 1 }}
                        reasonRequired={reasonRequired}
                        zIndex={popoverZIndex}
                        disabled={!isEdit || fieldDisabled}
                        positions={['top', 'bottom']}
                        buttons={[
                          {
                            label: isEdit ? 'Submit' : 'Update',
                            action: () => onUpdateCertification(item, fieldName),
                            type: 'primary',
                            isCancel: true,
                            disabled: loading || cannotUpdate,
                          },
                        ]}
                        oldValue={oldValue as string}
                        newValue={newValue as string}
                        reason={comment}
                        setReason={setComment}
                        label={isFile ? 'File' : 'Certification'}
                        labelSx={{ mb: 3 }}
                        // Note RevertChange After Submit
                        callCancelCBAfterAction={callCancelCBAfterAction}
                        onCancelCallBack={() =>
                          onChangeEditField(
                            oldValue?.toString() || '',
                            item.certification_id,
                            fieldName,
                            true
                          )
                        }
                        onClickOutSide={() =>
                          onChangeEditField(
                            oldValue?.toString() || '',
                            item.certification_id,
                            fieldName,
                            true
                          )
                        }
                        viewHistory={
                          !isShowViewHistory
                            ? undefined
                            : () => {
                                setHistoryModal(true)
                                getHistory({
                                  variables: {
                                    input: {
                                      tableName: TableNames?.CERTIFICATION,
                                      columnName: fieldName,
                                      companyId: companyId ? +companyId : 0,
                                      rowId: item.certification_id.toString(),
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
                                  tableName: TableNames?.CERTIFICATION,
                                  columnName: fieldName,
                                  companyId: companyId ? +companyId : 0,
                                  rowId: item.certification_id.toString(),
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
                              {item.fct_status_id === +EnumExpandStatusId.FOLLOWING && (
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
                            <Dropdown
                              placeholder={placeholder || ''}
                              name={`edit-${item.certification_id}-${fieldName}`}
                              onChange={(event: ChangeFieldEvent) =>
                                onChangeEditField(
                                  event.target.value,
                                  item.certification_id,
                                  fieldName
                                )
                              }
                              value={item.certification as string}
                              disabled={fieldDisabled}
                              options={certificationTypes}
                            />
                            {item.certification === CertificationTypeEnum.Other && (
                              <TextField
                                name={`other-${item.certification_id}`}
                                sx={{ mt: 2 }}
                                key={`other-${item.certification_id}`}
                                required
                                fieldState={
                                  item.certification_other_value?.trim() === ''
                                    ? 'error'
                                    : 'default'
                                }
                                value={item.certification_other_value}
                                onChange={(event: ChangeFieldEvent) =>
                                  onChangeEditField(
                                    event.target.value,
                                    item.certification_id,
                                    ColumnNames.CERTIFICATION_OTHER as keyof Certification
                                  )
                                }
                                placeholder={'Other certification value'}
                                onBlur={() => {}}
                              />
                            )}
                          </Box>
                        )}
                      </ReasonPopover>
                    )
                  })}
                </Flex>
              </Box>
              <FCTStatusAction
                disabled={disabled}
                reasonRequired={reasonRequired}
                identity={{
                  tableName: TableNames.CERTIFICATION,
                  columnName: ColumnNames.FCT_STATUS_ID,
                  rowId: item.certification_id.toString(),
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
                  isOverridesUser &&
                    onChangeEditField(+newValue, +identity.rowId, ColumnNames.FCT_STATUS_ID)
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
        state.map((e: Certification, index: number) => {
          return (
            <Flex
              key={index}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'start', gap: 2 }}
            >
              <Box>
                <Dropdown
                  placeholder={placeholder || ''}
                  name={`add-certification-${index}`}
                  onChange={(event: ChangeFieldEvent) => {
                    onChangeField(
                      event.target.value,
                      e,
                      index,
                      ColumnNames.CERTIFICATION as keyof Certification
                    )
                  }}
                  value={e.certification}
                  options={certificationTypes}
                  labelSx={{ mb: 3 }}
                  label="Certification"
                />
                {e.certification === CertificationTypeEnum.Other && (
                  <TextField
                    name={`add-${index}`}
                    sx={{ mt: 2 }}
                    key={index}
                    required
                    fieldState={e.certification_other_value?.trim() === '' ? 'error' : 'default'}
                    value={e.certification_other_value}
                    onChange={(event: ChangeFieldEvent) =>
                      onChangeField(
                        event.target.value,
                        e,
                        index,
                        ColumnNames.CERTIFICATION_OTHER as keyof Certification
                      )
                    }
                    placeholder={'Other certification value'}
                    onBlur={() => {}}
                  />
                )}
              </Box>

              <UploadFile
                sx={{ mb: e.file ? 0 : 50, width: '40%' }}
                setFileState={(files: FileState[]) => {
                  onChangeField(files[0], e, index, 'file' as keyof Certification)
                }}
                fileState={e.file ? [e.file] : []}
                label="File Name*"
                accept={acceptTypes.format || []}
                invalidFn={f => !validateFile(acceptTypes.format, f)}
                multiple={false}
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
              disabled: !validateFile(acceptTypes.format, (fileState || [])[0]),
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setUpdating(true)
                  if (editItem && companyId && uploadFiles) {
                    const ids = await uploadFiles(fileState)
                    isOverridesUser &&
                      onChangeEditField(
                        ids[0],
                        editItem.certification_id,
                        ColumnNames.CERTIFICATION_BUCKET_KEY
                      )
                    await onUpdateCertification(
                      { ...editItem, [ColumnNames.CERTIFICATION_BUCKET_KEY]: ids[0] },
                      ColumnNames.CERTIFICATION_BUCKET_KEY as keyof Certification
                    )
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
              reasonRequired={!isOverridesUser && isEdit}
              hideReason={!isEdit}
              invalid={!!fileState[0] && !validateFile(acceptTypes.format, fileState[0])}
              acceptTypes={acceptTypes}
            />
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default CertificationEditForm
