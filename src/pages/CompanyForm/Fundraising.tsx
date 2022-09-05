import React, { useContext } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Box } from 'theme-ui'
import {
  ChangeFieldEvent,
  FieldStates,
  FileState,
  Variants,
  OverrideMultipleFieldState,
} from '../../types'
import { TextField, Dropdown, FooterCTAs, Button, Updating } from '../../components'
import { Section } from '../../components/primitives'
import { FieldTypes } from '../../components/TextField'
import strings from '../../strings'
import {
  TableNames,
  Fields as FormFields,
  trimTheString,
  invalidUpdateData,
  validateEmail,
  putFileToS3,
  OverridesCompanyDataInput,
  ColumnNames,
  getNumPending,
  INVALID_EMAIL,
  validateFile,
} from './helpers'
import {
  EnumCompanySource,
  ENumDataType,
  EnumExpandStatusId,
  EnumSignUrlOperation,
  Routes,
} from '../../types/enums'
import { checkLength } from '../../utils'
import ReasonPopover from '../../components/ReasonPopover'
import { ViewHistoryProps } from './CompanyForm'
import { popoverZIndex } from '../../utils/consts'
import CompanyContext from './provider/CompanyContext'
import { ETLRunTimeContext } from '../../context'
import { TwoWayMap } from '../../utils/TwoWayMap'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { GET_SIGN_URL_FOR_OTHERS, OVERRIDE_COMPANY_DATA } from './graphql'
import {
  AppendFundraisingInput,
  APPEND_COMPANY_FUNDRAISING,
  CompanyFundraisingData,
  GetCompanyFundraisingResult,
  GetCompanyFundraisingVariables,
  GetFundraisingByIdResult,
  GET_COMPANY_FUNDRAISING,
  GET_FUNDRAISING_BY_ID,
  useCRUDCompanyFundraising,
} from './graphql/companyFundraising'
import { acceptedFormats } from '../../utils'
import FileModal from '../../components/FileModal/FileModal'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import useChangeRequest from '../../hooks/useChangeRequest'

const {
  pages: { fundraising: copy },
} = strings

export type FundraisingDTOResult = {
  fundraising_id: number
  pitch_deck_bucket_key: string
  proceeds_utilization: string
  fundraising: number
  investor_relations_contact: string
}

export type FundraisingDTOKeys =
  | 'fundraising_id'
  | 'pitch_deck_bucket_key'
  | 'fundraising'
  | 'proceeds_utilization'
  | 'investor_relations_contact'
  | 'fct_status_id'
  | 'self_declared'
  | 'READ_ONLY'

export type PendingUpdateFundraisingState = OverrideMultipleFieldState<FundraisingDTOKeys>

export type OldData = Pick<CompanyFundraisingData, FundraisingFieldNames>

export type FundraisingFieldNames = keyof Omit<CompanyFundraisingData, 'selfDeclared'>

export type FormFieldsState = Record<FundraisingDTOKeys, string | number>

export const FundraisingColumn = new TwoWayMap<FundraisingFieldNames, FundraisingDTOKeys>({
  id: 'fundraising_id',
  pitchDeckBucketKey: 'pitch_deck_bucket_key',
  isFundraising: 'fundraising',
  proceedsUtilization: 'proceeds_utilization',
  investorRelationsContact: 'investor_relations_contact',
  fctStatusId: 'fct_status_id',
  source: 'READ_ONLY',
})
const acceptTypes = acceptedFormats.pdf
type FieldNameKeys = keyof typeof copy.fields
export type Fields = {
  // name: FundraisingDTOKeys // must match database record
  // table: TableNamesValues
  label: string
  key: FieldNameKeys
  type: FieldTypes
  placeholder?: string
} & FormFields

type GetFieldState = {
  key: FieldNameKeys
  format?: string
  formatError?: string | undefined
  maxlength?: number
  maxWord?: number
}

export const fields: Fields[] = [
  {
    type: 'dropdown',
    key: 'isFundraising',
    label: copy.fields.isFundraising,
    placeholder: '',
    option: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
  },
  {
    type: 'input',
    key: 'proceedsUtilization',
    label: copy.fields.proceedsUtilization,
    placeholder: 'Enter value',
    // validators: [VALIDATION_REQUIRED()],
  },
  {
    type: 'input',
    key: 'investorRelationsContact',
    label: copy.fields.investorRelationsContact,
    placeholder: 'Enter value',
    // validators: [VALIDATON_PATTERN(EMAIL_REGEX)],

    format: validateEmail,
    formatError: INVALID_EMAIL,
  },
  {
    type: 'file',
    key: 'pitchDeckBucketKey',
    label: copy.fields.pitchDeckBucketKey,
    placeholder: 'Enter file',
    disabled: false,
  },
]

type FormProps = {
  companyId: string
  setError?(error: Error): void
  reason: string
  setReason(r: string): void
} & ViewHistoryProps

const Fundraising = ({
  setError = () => {},
  refetchViewHistoryCols = async () => {},
  reason,
  setReason,
  companyId,
}: FormProps) => {
  const {
    // handleUpdateStatus,
    viewHistory,
    isOverridesUser,
    hasHistoryField,
    companySource,
    handleUpdateField,
  } = useContext(CompanyContext)
  // GRAPHQL
  const client = useApolloClient()
  const [overrideData] = useMutation(OVERRIDE_COMPANY_DATA)
  const [appendFundraising] = useMutation(APPEND_COMPANY_FUNDRAISING)

  const { update } = useCRUDCompanyFundraising()

  const {
    data,
    loading: querying,
    // error,
    networkStatus,
    refetch: _refetch,
  } = useQuery<GetCompanyFundraisingResult, GetCompanyFundraisingVariables>(
    GET_COMPANY_FUNDRAISING,
    {
      variables: {
        companyId: +companyId,
        size: 10,
        page: 1,
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: data => {
        setEditingItem((data?.getCompanyFundraising?.result || [])[0] || {})
        setPendingUpdateData({} as PendingUpdateFundraisingState)
        setReason('')
      },
    }
  )

  const fundraising: CompanyFundraisingData = React.useMemo(
    () => (data?.getCompanyFundraising?.result || [])[0] || {},
    [data]
  )

  const refetch = () => {
    setPendingUpdateData({} as PendingUpdateFundraisingState)
    setEditingItem(fundraising)
    _refetch()
  }

  const {
    PendingCRModal,
    // handleAppendDataCQAction,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleAfterReject: async (data, isAppendData) => {
      if (isAppendData) {
        refetch()
      }
    },
    handleApproveUpdateNewData: async (data, isAppendData) => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        // updateStatus(data.rowId, data.newValue as EnumExpandStatusId)
      } else {
        const updatedData = await refetchItem(data.rowId)
        if (updatedData) {
          // Rerender modal
          // onResetModal()
          setEditingItem(updatedData)
        }
      }
    },
    defaultSource: companySource,
    companyId: +companyId,
  })

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const history = useHistory()
  /* STATE */
  const [errorFields, setErrorFieldsState] = React.useState<FieldNameKeys[]>([])
  const [fileState, setFileState] = React.useState<FileState[]>([])
  const [editingItem, setEditingItem] = React.useState<CompanyFundraisingData>(
    {} as CompanyFundraisingData
  )
  const [pendingUpdateData, setPendingUpdateData] = React.useState<PendingUpdateFundraisingState>(
    {} as PendingUpdateFundraisingState
  )

  const isAddPage = useRouteMatch(Routes.ADD_COMPANY_OVERVIEW)?.isExact

  const loading = networkStatus === 4 || querying // loading or refetching
  const refetchItem = async (id: string) => {
    const updatedData = (await getFundraisingById(id)) || ({} as CompanyFundraisingData)
    updatedData ? update(id, updatedData) : refetch()
    return updatedData
  }

  const uploadFiles = async (): Promise<string[]> => {
    try {
      if (!fileState?.length) return ['']
      const input = {
        data_type: ENumDataType.FUNDRAISING,
        operation: EnumSignUrlOperation.PUT,
        ids: [`${companyId}`],
        content_types: fileState.map(({ file }) => file.type),
      }
      let ids: string[] = []

      const res = await client.query({
        query: GET_SIGN_URL_FOR_OTHERS,
        variables: { input },
        fetchPolicy: 'network-only',
      })

      for (const [idx, url] of res?.data.getOthersSignUrl.entries()) {
        await putFileToS3(url.signedUrl, fileState[idx])
        ids.push(url.fileId)
      }
      return ids
    } catch (error) {
      return ['']
    }
  }

  const handleUpdateItem = async (data?: PendingUpdateFundraisingState) => {
    try {
      const records: OverridesCompanyDataInput[] = [
        ...Object.values(data || pendingUpdateData),
      ].filter(
        (item: OverridesCompanyDataInput) =>
          trimTheString(item.newValue) !== trimTheString(item.oldValue)
      )
      if (records?.length) {
        const isAppendData = editingItem?.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST
        await makeOverrideApiCall(records, isAppendData)
        if (isOverridesUser || isAppendData) {
          await refetchItem(editingItem?.id)
        }
      }
    } catch (err) {
      setError(err)
    } finally {
      // onResetModal()
      // setIsUpdating(false)
    }
  }

  const handleSubmit = async (disabled?: boolean) => {
    try {
      if (disabled) return
      if (fundraising.id) {
        await handleUpdateItem()
      } else {
        const ids = await uploadFiles()
        const record = {
          pitch_deck_bucket_key: ids?.[0] || '',
          is_fundraising: !!editingItem.isFundraising,
          proceeds_utilization: `${editingItem.proceedsUtilization || ''}`,
          investor_relations_contact: `${editingItem.investorRelationsContact || ''}`,
        }
        await makeAppendApiCall({
          company_id: +companyId,
          fundraisings: [record],
        })
        refetchViewPendingChangeRequestCols()
      }
      setPendingUpdateData({} as PendingUpdateFundraisingState)
      await refetch()
      if (isOverridesUser) refetchViewHistoryCols()
    } catch (err) {
      setError(err)
    }
  }

  const makeAppendApiCall = async (input: AppendFundraisingInput) => {
    if (!checkTimeETL()) return
    return await appendFundraising({
      variables: {
        input,
      },
    })
  }

  const makeOverrideApiCall = async (
    records: OverridesCompanyDataInput[],
    isAppendData = false
  ) => {
    if (!checkTimeETL()) return
    if (!records?.length) return
    const input = records.map(record => {
      return { ...record, companyId: +companyId }
    })

    await overrideData({ variables: { input, isAppendData } })

    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
  }

  const getFundraisingById = async (id: string): Promise<CompanyFundraisingData | undefined> => {
    const result = await client.query<GetFundraisingByIdResult, { id: string }>({
      query: GET_FUNDRAISING_BY_ID,
      variables: { id: id },
      fetchPolicy: 'network-only',
    })

    return result?.data?.getFundraisingById
  }

  // HELPERS
  const getValue = (name: FieldNameKeys) => {
    return String(editingItem?.[name] || '')
  }

  const getFieldState = ({
    key,
    format,
    formatError,
    maxlength,
    maxWord,
  }: GetFieldState): keyof FieldStates => {
    if (!getValue(key)) return 'default'
    if (!format || !formatError)
      return !checkLength(getValue(key), maxlength, maxWord) ? 'validated' : 'error'
    if (format === '') return 'default'

    const fieldState =
      format === formatError || checkLength(getValue(key), maxlength, maxWord)
        ? 'error'
        : 'validated'
    return fieldState
  }

  const onChangeField = (event: ChangeFieldEvent) => {
    const { value } = event.target
    const name = event.target.name as FieldNameKeys
    setEditingItem({
      ...editingItem,
      [name]: value,
    })
    if (fundraising.id) {
      const key = FundraisingColumn.get(name)
      setPendingUpdateData({
        [key]: {
          id: fundraising.id,
          tableName: TableNames.FUNDRAISING,
          columnName: key,
          oldValue: String(fundraising[name] || ''),
          newValue: value,
          source: EnumCompanySource.BCG,
          companyId: +companyId,
          reason,
        },
      } as PendingUpdateFundraisingState)
    }

    if (errorFields.includes(name as FieldNameKeys)) {
      const newErrorFields = errorFields.filter(f => f !== name)
      setErrorFieldsState(newErrorFields)
    }
  }

  const onBlurField = (key: FieldNameKeys) => {
    const field = fields.find(f => f.key === key)
    if (!field) return
    const { format, formatError, maxlength } = field
    const fieldState = getFieldState({
      key,
      format: format ? format(getValue(key)) : undefined,
      formatError,
      maxlength,
    })
    if (fieldState === 'error') {
      setErrorFieldsState([...errorFields, key])
    }
  }

  const handleChangeFile = async (files: FileState[], forceUpdate?: boolean) => {
    setFileState(files)

    if (forceUpdate) {
      if (!fundraising?.id) {
        isOverridesUser &&
          setEditingItem({
            ...(editingItem || {}),
            pitchDeckBucketKey: files?.[0]?.name || '',
          })
      } else {
        const ids = await uploadFiles()
        if (!ids?.[0] && !fundraising.pitchDeckBucketKey) {
          return
        }
        isOverridesUser &&
          setEditingItem({
            ...(editingItem || {}),
            pitchDeckBucketKey: ids?.[0] || '',
          })
        const data = {
          pitch_deck_bucket_key: {
            id: editingItem.id,
            tableName: TableNames.FUNDRAISING,
            columnName: ColumnNames.PITCH_DECK_BUCKET_KEY,
            oldValue: editingItem.pitchDeckBucketKey,
            newValue: ids?.[0] || '',
            source: EnumCompanySource.BCG,
            companyId: +companyId,
            reason,
          },
        } as PendingUpdateFundraisingState
        setPendingUpdateData(data)
        await handleUpdateItem(data)
        setFileState([])
      }
    }
  }

  const invalidFn = (f: FileState) => {
    return !validateFile(acceptTypes, f)
  }

  if (loading) {
    return <Updating loading sx={{ p: 5 }} />
  }

  return (
    <>
      <Section sx={{ mt: 5, maxWidth: 'none' }}>
        {/* {!isAddPage && companyId && (
          <TextField
            sx={{ mb: 4 }}
            type="input"
            value={companyId}
            name="companyId"
            label={copy.fields.companyId}
            onChange={() => {}}
            disabled
          />
        )} */}
        {fields.map(
          ({
            format,
            formatError,
            required,
            placeholder,
            key,
            type,
            disabled: fieldDisabled,
            option,
            maxlength,
            maxWord,
            label,
          }) => {
            const name = FundraisingColumn.get(key)
            const formattedValue = format ? format(getValue(key)) : undefined
            const fieldState = getFieldState({
              key,
              format: formattedValue,
              formatError,
              maxlength,
              maxWord,
            })
            const hasError = errorFields.indexOf(key) > -1 || fieldState === 'error'
            const tableName = TableNames.FUNDRAISING

            const oldValue = String(fundraising[key] || '')
            const newValue = getValue(key)
            const disablePopover = !fundraising.id

            const iden = {
              columnName: name,
              tableName: TableNames.FUNDRAISING,
              rowId: fundraising.id || '',
              source: EnumCompanySource.BCG,
              companyId: +companyId,
            }

            if (type === 'file') {
              return (
                <Box key={name}>
                  <ReasonPopover
                    reasonRequired={false}
                    disabled={false}
                    hasReason={false}
                    disablePopover={true}
                    zIndex={popoverZIndex}
                    labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
                    positions={['top']}
                    buttons={[
                      {
                        label: !isAddPage ? 'Submit' : 'Update',
                        action: async () => {
                          await handleUpdateField({
                            tableName,
                            columnName: name as string,
                            oldValue,
                            newValue,
                            id: companyId,
                            source: EnumCompanySource.BCG,
                          })
                          refetch()
                        },
                        type: 'primary',
                        isCancel: true,
                        disabled:
                          invalidUpdateData(
                            oldValue,
                            newValue,
                            reason,
                            isOverridesUser,
                            required
                          ) ||
                          errorFields.indexOf(key) > -1 ||
                          fieldState === 'error' ||
                          trimTheString(newValue) === trimTheString(oldValue),
                      },
                    ]}
                    oldValue={oldValue}
                    newValue={newValue}
                    reason={reason}
                    setReason={setReason}
                    viewHistory={viewHistoryFn(iden)}
                    viewPendingChangeRequest={viewPendingCQFn(iden)}
                    totalItemPendingCR={getNumPending(overviewPendingRequest, iden)}
                    callCancelCBAfterAction={!isOverridesUser}
                    onClickOutSide={() =>
                      onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                    }
                    onCancelCallBack={() => {
                      onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                    }}
                    label={label}
                    // {...props}
                  >
                    <FileModal
                      handleChangeFile={handleChangeFile}
                      fileState={fileState || ([] as FileState[])}
                      label={label}
                      acceptTypes={acceptTypes || []}
                      disabled={false}
                      file={{
                        id: editingItem?.pitchDeckBucketKey || null,
                        // extension: '.pdf',
                      }}
                      reason={reason}
                      setReason={setReason}
                      reasonRequired={!!fundraising.id}
                      invalidFn={invalidFn}
                      multiple={false}
                      invalidMessage={'Pitch Deck file must be a valid pdf file (Max 10 MB)'}
                      data_type={ENumDataType.FUNDRAISING}
                    />
                  </ReasonPopover>
                </Box>
              )
            }
            if (type === 'dropdown') {
              return (
                <ReasonPopover
                  reasonRequired={true}
                  disabled={disablePopover}
                  hasReason={true}
                  key={name}
                  labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
                  zIndex={popoverZIndex}
                  positions={['top', 'bottom']}
                  buttons={[
                    {
                      label: !isAddPage ? 'Submit' : 'Update',
                      action: async () => {
                        await handleUpdateField({
                          tableName,
                          columnName: name as string,
                          oldValue,
                          newValue,
                          id: companyId,
                          source: EnumCompanySource.BCG,
                        })
                        refetch()
                      },
                      type: 'primary',
                      disabled:
                        trimTheString(newValue) === trimTheString(fundraising[key]) ||
                        (!isOverridesUser && !reason),
                      isCancel: true,
                    },
                  ]}
                  oldValue={option?.find(x => Number(x.value) === fundraising[key])?.label || ''}
                  newValue={option?.find(x => String(x.value) === newValue)?.label || ''}
                  reason={reason}
                  setReason={setReason}
                  label={copy.fields[key]}
                  name={key}
                  viewHistory={viewHistoryFn(iden)}
                  viewPendingChangeRequest={viewPendingCQFn(iden)}
                  totalItemPendingCR={getNumPending(overviewPendingRequest, iden)}
                  // Note: onCancelCb after update
                  callCancelCBAfterAction={!isOverridesUser}
                  onClickOutSide={() =>
                    onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                  }
                  onCancelCallBack={() => {
                    onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                  }}
                >
                  <Dropdown
                    key={name}
                    sx={{ mb: 4 }}
                    name={key}
                    options={option || []}
                    value={+getValue(key)}
                    onChange={onChangeField}
                  />
                </ReasonPopover>
              )
            }

            const props = {
              sx: { mb: 4 },
              type: type,
              name: key,
              id: name,
              value: getValue(key),
              formattedValue: formattedValue,
              fieldState: errorFields.indexOf(key) > -1 ? 'error' : fieldState,
              required: required,
              placeholder: placeholder,
              onChange: onChangeField,
              onBlur: onBlurField,
              variant: (hasError
                ? 'error'
                : fieldState === 'validated'
                ? 'primary'
                : 'black') as Variants,
            }

            return (
              <Box key={name}>
                <ReasonPopover
                  reasonRequired={true}
                  disabled={disablePopover}
                  hasReason={true}
                  zIndex={popoverZIndex}
                  labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
                  positions={['top']}
                  buttons={[
                    {
                      label: !isAddPage ? 'Submit' : 'Update',
                      action: async () => {
                        await handleUpdateField({
                          tableName,
                          columnName: name as string,
                          oldValue,
                          newValue,
                          id: companyId,
                          source: EnumCompanySource.BCG,
                        })
                        refetch()
                      },
                      type: 'primary',
                      isCancel: true,
                      disabled:
                        invalidUpdateData(oldValue, newValue, reason, isOverridesUser, required) ||
                        errorFields.indexOf(key) > -1 ||
                        fieldState === 'error' ||
                        trimTheString(newValue) === trimTheString(oldValue),
                    },
                  ]}
                  oldValue={oldValue}
                  newValue={newValue}
                  reason={reason}
                  setReason={setReason}
                  viewHistory={viewHistoryFn(iden)}
                  viewPendingChangeRequest={viewPendingCQFn(iden)}
                  totalItemPendingCR={getNumPending(overviewPendingRequest, iden)}
                  callCancelCBAfterAction={!isOverridesUser}
                  onClickOutSide={() =>
                    onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                  }
                  onCancelCallBack={() => {
                    onChangeField({ target: { name: key, value: oldValue } } as ChangeFieldEvent)
                  }}
                  label={copy.fields[key]}
                  {...props}
                >
                  {<TextField {...props} disabled={fieldDisabled} />}
                </ReasonPopover>
              </Box>
            )
          }
        )}
        {!fundraising.id && (
          <Button
            disabled={!!errorFields?.length}
            onPress={() => handleSubmit(!!errorFields?.length)}
            sx={{ mr: 2, mt: 4 }}
            variant="primary"
            label={'Save'}
          />
        )}
      </Section>

      {!isAddPage && (
        <FooterCTAs
          buttons={[
            {
              label: strings.common.backToCompanyRecord,
              variant: 'outlineWhite',
              onClick: () => history.push(Routes.COMPANY.replace(':id', companyId)),
              disabled: loading,
            },
          ]}
        />
      )}
      <PendingCRModal />
    </>
  )
}

export default Fundraising
