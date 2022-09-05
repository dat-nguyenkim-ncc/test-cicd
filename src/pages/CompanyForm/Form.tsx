import React, { useContext, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Box } from 'theme-ui'
import { Alias, Attachment, ChangeFieldEvent, FieldStates, FileState, Variants } from '../../types'
import {
  TextField,
  Dropdown,
  FooterCTAs,
  UploadDocumentation,
  Modal,
  AliasForm,
  Button,
  Updating,
} from '../../components'
import { Paragraph, Section, Heading } from '../../components/primitives'
import { FieldTypes } from '../../components/TextField'
import strings from '../../strings'
import { Palette } from '../../theme'
import {
  ColumnNames,
  defaultLocations,
  FieldNameKeys,
  FormFieldsState,
  LocationFields,
  TableNames,
  Fields as FormFields,
  validateDate,
  validateFTEs,
  validateURL,
  validateYear,
  invalidAttachments,
  FieldNames,
  TableNamesValues,
  trimTheString,
  invalidUpdateData,
} from './helpers'
import { EStatusValue, ftesRange, status } from './mock'
import { EnumExpandStatus, EnumExpandStatusId, Routes } from '../../types/enums'
import { checkLength } from '../../utils'
import LocationForm from '../../components/LocationForm'
import ReasonPopover from '../../components/ReasonPopover'
import { useMutation } from '@apollo/client'
import { APPEND_COMPANY_LOCATIONS } from './graphql'
import {
  HasPendingCQField,
  OldData,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from './CompanyForm'
import { popoverZIndex } from '../../utils/consts'
import CompanyContext from './provider/CompanyContext'
import EditDocumentation from '../../components/EditDocumentation.tsx'
import { ETLRunTimeContext } from '../../context'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export type Fields = {
  name: FieldNameKeys // must match database record
  key: keyof typeof strings.pages.addCompanyForm.fields
  type: FieldTypes
  placeholder?: string
  maxWord?: number
  table: TableNamesValues
} & FormFields

type GetFieldState = {
  name: FieldNameKeys
  format?: string
  formatError?: string | undefined
  maxlength?: number
  maxWord?: number
}

export const formFields: Fields[] = [
  {
    name: FieldNames?.name,
    key: 'companyName',
    type: 'input',
    required: true,
    maxlength: 256,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.website_url,
    key: 'companyWebsite',
    type: 'input',
    format: validateURL,
    formatError: 'invalid',
    required: true,
    maxlength: 2083,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.founded_year,
    key: 'foundedYear',
    type: 'input',
    format: validateYear,
    formatError: 'Invalid year',
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.status,
    key: 'companyStatus',
    type: 'dropdown',
    option: status,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.company_alias,
    key: 'companyOtherNames',
    type: 'input',
    maxlength: 256,
    table: TableNames?.ALIAS,
  },
  {
    name: FieldNames?.closed_date,
    key: 'companyClosedDate',
    type: 'input',
    placeholder: DEFAULT_VIEW_DATE_FORMAT,
    format: validateDate,
    formatError: 'Invalid date',
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.description,
    key: 'companyDescription',
    type: 'textarea',
    maxlength: 4000,
    maxWord: 150,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.ftes_exact,
    key: 'ftesExact',
    type: 'input',
    format: validateFTEs,
    formatError: 'Invalid FTEs',
    maxlength: 2083,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.ftes_range,
    key: 'ftesRange',
    type: 'dropdown',
    option: ftesRange,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.twitter_url,
    key: 'companyTwitterUrl',
    type: 'input',
    format: validateURL,
    formatError: 'invalid',
    maxlength: 2083,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.facebook_url,
    key: 'companyFacebookUrl',
    type: 'input',
    format: validateURL,
    formatError: 'invalid',
    maxlength: 2083,
    table: TableNames?.COMPANIES,
  },
  {
    name: FieldNames?.linkedin_url,
    key: 'companyLinkedInUrl',
    type: 'input',
    format: validateURL,
    formatError: 'invalid',
    maxlength: 2083,
    table: TableNames?.COMPANIES,
  },
]

type FormProps = {
  onCancel(): void
  formState?: FormFieldsState
  aliasState: string[]
  aliasEditState: Alias[]
  onChangeAlias(state: string[]): void
  onChangeAliasEdit(state: Alias[]): void
  onChangeForm(event: FormFieldsState): void
  onChangeFile(event: FileState[]): void
  loading?: boolean
  oldData: OldData
  setOldData(v: OldData): void
  info?: React.ReactElement
  fileState: FileState[]
  updateCompanyNameCache?(v: string | number): void
  refetchLocations?(): Promise<void>
  refetchAliases?(): Promise<void>
  refetchAttachments?(): Promise<void>
  fetchingAliases?: boolean
  fetchingAttachments?: boolean
  saveFile?(): Promise<void>
  setErrorFieldsState(state: FieldNameKeys[]): void
  errorFields: FieldNameKeys[]
  reason: string
  setReason(r: string): void
  locationComponent: React.ReactElement
  setError(err: Error): void
  getHistory: any
  setHistoryModal(v: boolean): void
  openPendingCRModel(): void
  getPendingCR: any
  overviewPendingRequest: Array<HasPendingCQField>
  editFileState: Attachment[]
  setEditFileState(s: Attachment[]): void
} & ViewHistoryProps &
  ViewPendingChangeRequest

const Form = ({
  onCancel,
  formState,
  aliasState,
  aliasEditState,
  onChangeAlias,
  onChangeAliasEdit,
  onChangeForm,
  onChangeFile,
  loading,
  oldData,
  setOldData,
  showViewHistory,
  showPendingChangeRequest,
  refetchViewHistoryCols,
  refetchViewPendingChangeRequestCols,
  info,
  fileState,
  saveFile,
  updateCompanyNameCache,
  refetchLocations,
  refetchAliases,
  refetchAttachments,
  fetchingAliases,
  fetchingAttachments,
  setErrorFieldsState,
  errorFields,
  reason,
  setReason,
  setError,
  getHistory,
  setHistoryModal,
  openPendingCRModel,
  getPendingCR,
  overviewPendingRequest,
  editFileState,
  setEditFileState,
  ...props
}: FormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const {
    handleClickShowPendingCR,
    isOverridesUser,
    handleUpdateStatus,
    handleAppendDataCQAction,
    viewHistory,
    handleUpdateField,
  } = useContext(CompanyContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const { id: companyId } = useParams<{ id: string }>()
  const history = useHistory()
  const { overview: oldOverview, aliases: oldAliases } = oldData

  const [errorAttachment, setErrorAttachment] = useState<FieldNameKeys[]>([])
  const [appendLocation, setAppendLocation] = useState<LocationFields>(defaultLocations)
  const [isAppending, setIsAppending] = useState(false)

  // Message modal
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [documentModalVisible, setDocumentModalVisible] = useState(false)

  const isAddPage = useRouteMatch(Routes.ADD_COMPANY_OVERVIEW)?.isExact
  const locationRef = useRef<any>()

  const fields: Fields[] = isAddPage
    ? formFields
    : [
        {
          name: FieldNames?.fct_status_id,
          key: 'expandStatus',
          type: 'dropdown',
          option: [
            { value: EnumExpandStatusId.FOLLOWING, label: EnumExpandStatus.FOLLOWING },
            { value: EnumExpandStatusId.DUPLICATED, label: EnumExpandStatus.DUPLICATED },
          ],
          table: TableNames?.COMPANIES,
        },
        ...formFields,
      ]

  // HELPERS
  const getValue = (name: FieldNameKeys) => {
    return formState ? formState[name] || '' : ''
  }

  const getFieldState = ({
    name,
    format,
    formatError,
    maxlength,
    maxWord,
  }: GetFieldState): keyof FieldStates => {
    if (!getValue(name)) return 'default'
    if (!format || !formatError)
      return !checkLength(getValue(name), maxlength, maxWord) ? 'validated' : 'error'
    if (format === '') return 'default'

    const fieldState =
      format === formatError || checkLength(getValue(name), maxlength, maxWord)
        ? 'error'
        : 'validated'
    return fieldState
  }

  const onChangeField = (event: ChangeFieldEvent) => {
    const { name, value } = event.target
    const lastStateFields = formState ? formState : ({} as FormFieldsState)
    if (name === FieldNames.status) {
      const cloneError = [...errorFields]
      cloneError.splice(cloneError.indexOf(FieldNames.closed_date), 1)
      setErrorFieldsState(cloneError)
      if (value !== EStatusValue.CLOSED) {
        lastStateFields.closed_date = ''
      } else {
        lastStateFields.closed_date = oldData?.overview[FieldNames.closed_date] || ''
      }
    }
    if (errorFields.includes(name as FieldNameKeys)) {
      const newErrorFields = errorFields.filter(f => f !== name)
      setErrorFieldsState(newErrorFields)
    }
    onChangeForm({ ...lastStateFields, [name]: value })
  }

  const onBlurField = (name: FieldNameKeys) => {
    const field = fields.find(f => f.name === name)
    if (!field) return
    const { format, formatError, maxlength } = field
    const fieldState = getFieldState({
      name,
      format: format ? format(getValue(name)) : undefined,
      formatError,
      maxlength,
    })
    if (fieldState === 'error') {
      setErrorFieldsState([...errorFields, name])
    }
  }

  // GRAPHQL
  const [doAppendLocations] = useMutation(APPEND_COMPANY_LOCATIONS)

  const isHideField = (name: FieldNameKeys) => {
    if (name === 'closed_date' && (getValue('status') !== 'Closed' || !getValue('status')))
      return true
  }

  const isFollowing = isAddPage || oldData.overview.fct_status_id === EnumExpandStatusId.FOLLOWING

  return (
    <>
      {isAddPage && (
        <Paragraph sx={{ mt: 5 }} bold>
          {copy.fieldTitles.newEntry}
        </Paragraph>
      )}
      <Section sx={{ mt: 5, maxWidth: 'none' }}>
        {!isAddPage && companyId && (
          <TextField
            sx={{ mb: 4 }}
            type="input"
            value={companyId}
            name="companyId"
            label={copy.fields.companyId}
            onChange={() => {}}
            disabled
          />
        )}
        {fields.map(
          ({
            format,
            formatError,
            required,
            placeholder,
            key,
            type,
            name,
            option,
            maxlength,
            maxWord,
          }) => {
            const formattedValue = format ? format(getValue(name)) : undefined
            const fieldState = getFieldState({
              name,
              format: formattedValue,
              formatError,
              maxlength,
              maxWord,
            })
            const variant: Variants =
              errorFields.indexOf(name) > -1 || fieldState === 'error'
                ? 'error'
                : fieldState === 'validated'
                ? 'primary'
                : 'black'

            const fieldDisabled = !isFollowing && name !== ColumnNames.FCT_STATUS_ID
            const field = fields.find(f => f.name === name)
            const tableName = field?.table || ''

            const rowId = companyId

            const numPending =
              overviewPendingRequest?.filter(
                i => i.tableName === tableName && i.columnName === name && rowId === i.rowId
              )[0]?.total || 0

            if (type === 'dropdown') {
              const oldValue = oldOverview[name],
                newValue = getValue(name)

              return (
                <ReasonPopover
                  reasonRequired={!isOverridesUser}
                  disabled={isAddPage || fieldDisabled}
                  key={name}
                  zIndex={popoverZIndex}
                  positions={['top', 'bottom']}
                  buttons={[
                    {
                      label: !isAddPage ? 'Submit' : 'Update',
                      action: async () => {
                        try {
                          await handleUpdateField({
                            tableName,
                            columnName: name as string,
                            oldValue,
                            newValue,
                            id: companyId,
                          })
                        } catch (e) {
                          onChangeField({ target: { name, value: oldValue } } as ChangeFieldEvent)
                        }
                      },
                      type: 'primary',
                      disabled:
                        trimTheString(newValue) === trimTheString(oldValue) ||
                        (!isOverridesUser && !reason),
                      isCancel: true,
                    },
                  ]}
                  oldValue={option?.find(x => x.value === oldValue)?.label || ''}
                  newValue={option?.find(x => x.value === newValue)?.label || ''}
                  reason={reason}
                  setReason={setReason}
                  label={copy.fields[key]}
                  labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
                  name={name}
                  viewHistory={
                    !showViewHistory(tableName, name, rowId)
                      ? undefined
                      : () => {
                          viewHistory({
                            tableName,
                            columnName: name,
                            companyId: +companyId,
                            rowId,
                          })
                        }
                  }
                  viewPendingChangeRequest={
                    !showPendingChangeRequest(tableName, name, rowId)
                      ? undefined
                      : () => {
                          handleClickShowPendingCR({
                            tableName,
                            columnName: name,
                            companyId: +companyId,
                            rowId,
                          })
                        }
                  }
                  totalItemPendingCR={numPending}
                  // Note: onCancelCb after update
                  callCancelCBAfterAction={!isOverridesUser}
                  onCancelCallBack={() => {
                    onChangeField({ target: { name, value: oldValue } } as ChangeFieldEvent)
                  }}
                  variant={variant}
                >
                  <Dropdown
                    key={name}
                    sx={{ mb: 4 }}
                    name={name}
                    placeholder={placeholder}
                    options={option || []}
                    value={getValue(name)}
                    onChange={onChangeField}
                    disabled={fieldDisabled}
                  />
                </ReasonPopover>
              )
            }

            const props = {
              sx: { mb: 4 },
              type: type,
              name: name,
              id: name,
              value: getValue(name),
              formattedValue: formattedValue,
              fieldState: errorFields.indexOf(name) > -1 ? 'error' : fieldState,
              required: required,
              placeholder: placeholder,
              onChange: onChangeField,
              onBlur: onBlurField,
              variant: variant,
            }
            const oldValue = oldOverview[name],
              newValue = getValue(name)

            if (name === FieldNames?.company_alias) {
              return fetchingAliases ? (
                <Updating
                  key={key}
                  loading
                  noPadding
                  sx={{ p: 6, bg: Palette.mint, borderRadius: 12, my: 4 }}
                />
              ) : (
                <AliasForm
                  key={key}
                  overviewPendingRequest={overviewPendingRequest}
                  companyId={companyId}
                  fieldKey={key}
                  name={name}
                  oldAliases={oldAliases}
                  editAliasState={aliasEditState}
                  aliasState={aliasState}
                  maxlength={maxlength}
                  onChangeAlias={onChangeAlias}
                  onChangeAliasEdit={onChangeAliasEdit}
                  setOldData={newAliases => setOldData({ ...oldData, aliases: newAliases })}
                  showViewHistory={showViewHistory}
                  showPendingChangeRequest={showPendingChangeRequest}
                  refetchViewHistoryCols={refetchViewHistoryCols}
                  disabled={fieldDisabled}
                  setError={setError}
                  isEdit={!isAddPage}
                  refetchAliases={refetchAliases}
                  viewHistory={(alias: Alias, columnName: string = ColumnNames.ALIAS) => {
                    setHistoryModal(true)
                    getHistory({
                      variables: {
                        input: {
                          tableName: TableNames?.ALIAS,
                          columnName: columnName,
                          companyId: +companyId,
                          rowId: alias.alias_id,
                          source: alias.source,
                        },
                      },
                    })
                  }}
                  viewPendingChangeRequest={(
                    alias: Alias,
                    columnName: string = ColumnNames.ALIAS
                  ) => {
                    handleClickShowPendingCR({
                      tableName: TableNames?.ALIAS,
                      columnName: columnName,
                      companyId: +companyId,
                      rowId: alias.alias_id,
                      source: alias.source as string,
                    })
                  }}
                />
              )
            }

            return (
              <Box key={name} sx={isHideField(name) ? { display: 'none' } : {}}>
                <ReasonPopover
                  reasonRequired={!isOverridesUser}
                  zIndex={popoverZIndex}
                  disabled={isAddPage || fieldDisabled}
                  labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
                  positions={['top']}
                  buttons={[
                    {
                      label: !isAddPage ? 'Submit' : 'Update',
                      action: async () => {
                        try {
                          await handleUpdateField({
                            tableName,
                            columnName: name as string,
                            oldValue,
                            newValue,
                            id: companyId,
                          })
                        } catch (e) {
                          onChangeField({ target: { name, value: oldValue } } as ChangeFieldEvent)
                        }
                      },
                      type: 'primary',
                      isCancel: true,
                      disabled:
                        invalidUpdateData(oldValue, newValue, reason, isOverridesUser, required) ||
                        errorFields.indexOf(name) > -1 ||
                        fieldState === 'error' ||
                        trimTheString(newValue) === trimTheString(oldValue),
                    },
                  ]}
                  oldValue={oldValue}
                  newValue={newValue}
                  reason={reason}
                  setReason={setReason}
                  viewHistory={
                    !showViewHistory(tableName, name, rowId)
                      ? undefined
                      : () => {
                          setHistoryModal(true)
                          getHistory({
                            variables: {
                              input: { tableName, columnName: name, companyId: +companyId, rowId },
                            },
                          })
                        }
                  }
                  viewPendingChangeRequest={
                    !showPendingChangeRequest(tableName, name, rowId)
                      ? undefined
                      : () => {
                          handleClickShowPendingCR({
                            tableName,
                            columnName: name,
                            companyId: +companyId,
                            rowId,
                          })
                        }
                  }
                  totalItemPendingCR={numPending}
                  callCancelCBAfterAction={!isOverridesUser}
                  onCancelCallBack={() => {
                    onChangeField({ target: { name, value: oldValue } } as ChangeFieldEvent)
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

        {props.locationComponent}

        {fetchingAttachments ? (
          <Updating loading noPadding sx={{ p: 6, bg: Palette.mint, borderRadius: 12, my: 4 }} />
        ) : isAddPage ? null : (
          <Box sx={{ mt: 4 }}>
            <Paragraph sx={{ mb: 4 }} bold>
              {copy.fieldTitles.attachments}
            </Paragraph>

            {editFileState.map((item, index) => {
              const getName = (i: Attachment) => {
                const name =
                  (i.name || '').lastIndexOf('.') > -1
                    ? (i.name || '').slice(0, i.name?.lastIndexOf('.'))
                    : i.name
                return name
              }
              const oldAttachment = oldData?.attachments?.find(
                i => item.url_attachment === i.url_attachment
              )
              const extension =
                (oldAttachment?.name || '').slice((oldAttachment?.name || '').lastIndexOf('.')) ||
                ''
              const followingAttachment = item.expandStatus === EnumExpandStatus.FOLLOWING
              const appendCqAttachment = item.expandStatus === EnumExpandStatus.CHANGE_REQUEST

              return !item || !oldAttachment ? null : (
                <EditDocumentation
                  isOverride={isOverridesUser}
                  /* Note: Company is Unfollowed */
                  disabled={!isFollowing}
                  companyId={companyId}
                  allAttachment={oldData.attachments}
                  key={item.url_attachment}
                  attachment={{ ...oldAttachment, name: getName(oldAttachment), extension }}
                  state={{ ...item, name: getName(item) }}
                  setState={state => {
                    setEditFileState(
                      editFileState.map(i =>
                        i.url_attachment === state.url_attachment ? state : i
                      )
                    )
                  }}
                  reason={reason}
                  setReason={setReason}
                  handleAppendDataCQAction={handleAppendDataCQAction}
                  handleUpdateStatus={async reason => {
                    try {
                      if (!item.url_attachment) return
                      const input = {
                        id: item.url_attachment as string,
                        companyId: +companyId,
                        reason: reason,
                        tableName: TableNames.COMPANIES_ATTACHMENTS,
                        columnName: ColumnNames.FCT_STATUS_ID,
                        source: undefined,
                        newValue: followingAttachment
                          ? EnumExpandStatusId.UNFOLLOWED
                          : EnumExpandStatusId.FOLLOWING,
                        oldValue: followingAttachment
                          ? EnumExpandStatusId.FOLLOWING
                          : EnumExpandStatusId.UNFOLLOWED,
                      }

                      await handleUpdateStatus(input)
                    } catch (err) {
                      setError(err)
                    }
                  }}
                  handleUpdateField={async (tableName, columnName, oldValue, newValue, id) => {
                    try {
                      const oldValueParam = columnName === 'name' ? oldValue + extension : oldValue
                      const newValueParam = columnName === 'name' ? newValue + extension : newValue

                      await handleUpdateField(
                        {
                          tableName,
                          columnName,
                          oldValue: oldValueParam,
                          newValue: newValueParam,
                          id: `${id}`,
                        },
                        appendCqAttachment
                      )
                    } catch (e) {
                      setError(e)
                    }
                  }}
                  showViewHistory={showViewHistory}
                  getHistory={({
                    tableName,
                    columnName,
                  }: {
                    tableName: string
                    columnName: string
                  }) => {
                    setHistoryModal(true)
                    getHistory({
                      variables: {
                        input: {
                          tableName,
                          columnName,
                          companyId: +companyId,
                          rowId: item.url_attachment,
                        },
                      },
                    })
                  }}
                  showPendingChangeRequest={showPendingChangeRequest}
                  getPendingCR={({
                    tableName,
                    columnName,
                  }: {
                    tableName: string
                    columnName: string
                  }) => {
                    openPendingCRModel()
                    getPendingCR({
                      variables: {
                        input: {
                          tableName,
                          columnName,
                          companyId: +companyId,
                          rowId: item.url_attachment,
                        },
                      },
                    })
                  }}
                  overviewPendingRequest={overviewPendingRequest}
                />
              )
            })}
          </Box>
        )}

        {isAddPage ? (
          <Box id="attachment">
            <UploadDocumentation
              sx={{ mt: 4 }}
              onChangeFile={onChangeFile}
              files={fileState}
              setErrorAttachment={setErrorAttachment}
              disabled={!isFollowing}
            />
          </Box>
        ) : (
          <Button
            label={copy.buttons.upload}
            variant="primary"
            onPress={() => {
              if (!checkTimeETL()) return
              setDocumentModalVisible(true)
            }}
            disabled={!isFollowing}
          />
        )}
      </Section>

      {!isAddPage && (
        <FooterCTAs
          buttons={[
            {
              label: copy.buttons.backToCompanyRecord,
              variant: 'outlineWhite',
              onClick: () => history.push(Routes.COMPANY.replace(':id', companyId)),
              disabled: loading,
            },
          ]}
        />
      )}

      {locationModalVisible && (
        <Modal
          sx={{ maxHeight: '90vh', width: '50vw', maxWidth: '50vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4, m: 0 }}
          buttons={[
            {
              label: 'Cancel',
              disabled: isAppending,
              type: 'secondary',
              action: () => setLocationModalVisible(false),
            },
            {
              label: 'Add new location',
              disabled: isAppending,
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setIsAppending(true)
                  if (!appendLocation.city && !appendLocation.country) {
                    locationRef.current.onSubmit()
                    return
                  }
                  await doAppendLocations({
                    variables: {
                      input: {
                        companyId: +companyId,
                        locations: [appendLocation],
                      },
                    },
                  })
                  refetchLocations && (await refetchLocations())
                  setLocationModalVisible(false)
                } catch (err) {
                  setError(err)
                  setLocationModalVisible(false)
                } finally {
                  setIsAppending(false)
                }
              },
            },
          ]}
        >
          <Heading sx={{ fontWeight: 600, mt: 4 }} as={'h4'}>
            {copy.modals.location.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <LocationForm
              ref={locationRef}
              sx={{
                border: 0,
                p: 0,
                m: 5,
                mb: 0,
              }}
              isAddPage={!!isAddPage}
              location={appendLocation as LocationFields}
              onChangeLocation={data => setAppendLocation(data)}
              reason={reason}
              setReason={setReason}
              setHistoryModal={() => {}}
              getHistory={() => {}}
              showViewHistory={() => false}
              showPendingChangeRequest={() => false}
              handleUpdateField={async () => {}}
              oldData={{} as LocationFields}
              newData={{} as LocationFields}
              setOldData={() => {}}
            />
          </Box>
        </Modal>
      )}

      {documentModalVisible && (
        <Modal
          sx={{ maxHeight: '90vh', width: '50vw', maxWidth: '50vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4, m: 0 }}
          buttons={[
            {
              label: 'Cancel',
              disabled: isAppending,
              type: 'secondary',
              action: () => setDocumentModalVisible(false),
            },
            {
              label: 'Add new attachments',
              disabled:
                isAppending ||
                !fileState?.length ||
                !!errorAttachment.length ||
                invalidAttachments(fileState),
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setIsAppending(true)
                  saveFile && (await saveFile())
                  refetchAttachments && (await refetchAttachments())
                } catch (err) {
                  setError(err)
                } finally {
                  onChangeFile([])
                  setIsAppending(false)
                  setDocumentModalVisible(false)
                }
              },
            },
          ]}
        >
          <Heading sx={{ fontWeight: 600, mt: 4 }} as={'h4'}>
            {copy.modals.documentations.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <UploadDocumentation
              sx={{ mt: 4, mx: 4 }}
              onChangeFile={onChangeFile}
              setErrorAttachment={setErrorAttachment}
              disabled={!isFollowing}
              files={fileState}
            />
          </Box>
        </Modal>
      )}
    </>
  )
}

export default Form
