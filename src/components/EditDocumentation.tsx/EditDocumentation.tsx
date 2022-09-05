import React, { useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { useLazyQuery } from '@apollo/client'
import { Dropdown, TextField } from '..'
import { UserContext } from '../../context'
import { getSignUrl } from '../../pages/CompanyForm/graphql'
import {
  HasPendingCQField,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from '../../pages/CompanyForm/CompanyForm'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  TableNames,
  TableNamesValues,
  trimTheString,
} from '../../pages/CompanyForm/helpers'
import { IHandleAppendDataCQAction } from '../../pages/CompanyForm/provider/CompanyContext'
import {
  acceptAttachmentType,
  attachmentTypeOptions,
  EnumFileType,
} from '../../pages/CompanyManagement/CompanyFilter/helpers'
import strings from '../../strings'
import { Attachment, ChangeFieldEvent, FormOption, ViewInterface } from '../../types'
import { EnumAttachmentType, EnumCompanySource, EnumExpandStatus } from '../../types/enums'
import { checkLength } from '../../utils'
import { DEFAULT_VIEW_DATE_FORMAT, popoverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import Modal from '../Modal'
import { Heading, Paragraph } from '../primitives'
import ReasonPopover from '../ReasonPopover'
import { FieldTypes } from '../TextField'
import { getAttachmentType } from '../UploadDocumentation/UploadDocumentation'
import moment from 'moment'

type OverridesProps = {
  handleUpdateField: (
    tableName: string,
    columnName: string,
    oldValue: string | number,
    newValue: string | number,
    id: string | number
  ) => Promise<void>
  isOverride: boolean
}

type T = Attachment & Record<'extension', string>

type Props = ViewInterface<{
  attachment: T
  companyId: string
  maxLength?: Record<'name' | 'description' | 'type', number>
  reason: string
  setReason(v: any): void
  getHistory(input: { tableName: string; columnName: string }): void
  getPendingCR?(input: { tableName: string; columnName: string }): void
  overviewPendingRequest?: HasPendingCQField[]
  disabled?: boolean
  allAttachment: Attachment[]
  state: Attachment
  setState(s: Attachment): void
  handleUpdateStatus(reason: string): Promise<void>
  handleAppendDataCQAction: IHandleAppendDataCQAction
}> &
  OverridesProps &
  ViewHistoryProps &
  ViewPendingChangeRequest

type Fields = {
  name: 'name' | 'description' | 'type' // must match database record
  key: keyof typeof strings.pages.addCompanyForm.attachments.fields
  type: FieldTypes
  placeholder?: string
  required?: boolean
  format?(value: string | number): string
  formatError?: string
  maxlength?: number
  maxWord?: number
  option?: FormOption[]
  table: TableNamesValues
}

const fields: Fields[] = [
  {
    name: 'name',
    key: 'name',
    type: 'input',
    placeholder: 'File name',
    table: TableNames?.COMPANIES_ATTACHMENTS,
  },
  {
    name: 'type',
    key: 'type',
    type: 'dropdown',
    placeholder: 'Select',
    table: TableNames?.COMPANIES_ATTACHMENTS,
  },
]

const description: Fields = {
  name: 'description',
  key: 'description',
  type: 'textarea',
  placeholder: 'Description',
  table: TableNames?.COMPANIES_ATTACHMENTS,
}

const EditDocumentation = ({
  companyId,
  attachment,
  maxLength = {
    name: 256,
    description: 4000,
    type: 50,
  },
  handleUpdateField,
  showViewHistory,
  reason,
  setReason,
  getHistory,
  disabled,
  allAttachment,
  showPendingChangeRequest,
  getPendingCR,
  overviewPendingRequest,
  isOverride,
  state,
  setState,
  handleUpdateStatus,
  handleAppendDataCQAction,
}: Props) => {
  const {
    pages: {
      addCompanyForm: { attachments: copy },
    },
  } = strings

  const { user } = React.useContext(UserContext)

  const isFollowing = state.expandStatus === EnumExpandStatus.FOLLOWING
  const isAppendCQ = state.expandStatus === EnumExpandStatus.CHANGE_REQUEST

  const { users } = findCQ(
    overviewPendingRequest,
    {
      tableName: TableNames.COMPANIES_ATTACHMENTS,
      columnName: ColumnNames.FCT_STATUS_ID,
      rowId: attachment.url_attachment || '',
    },
    true
  ) || {
    users: [],
  }

  const [isLoading, setIsLoading] = useState(false)
  const [confirmChangeAttachmentType, setConfirmChangeAttachmentType] = useState(false)
  const [field, setField] = useState<Fields>({} as Fields)

  const onFieldChange = (event: ChangeFieldEvent) => {
    const { name, value } = event.target
    setState({ ...state, [name]: value })
  }

  const validate = (value: string, maxlength: number): any => {
    if (!value.length) return 'default'
    if (checkLength(value, maxlength)) return 'error'
    return 'default'
  }

  const oldValue = (field: 'name' | 'description' | 'type') =>
    attachment[field as keyof Omit<Attachment, 'selfDeclared'>] || ''
  const newValue = (field: 'name' | 'description' | 'type') =>
    state[field as keyof Omit<Attachment, 'selfDeclared'>] || ''
  const fieldState = (field: 'name' | 'description' | 'type') =>
    validate(state[field] || '', maxLength[field])

  const fieldDisabled = (type: FieldTypes) =>
    disabled || (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)

  const validateType = () => {
    if (
      (acceptAttachmentType[EnumFileType.PPT].includes(newValue('type') as EnumAttachmentType) &&
        !copy.acceptTypes.ppt.includes(attachment.extension)) ||
      (acceptAttachmentType[EnumFileType.PDF].includes(newValue('type') as EnumAttachmentType) &&
        !copy.acceptTypes.pdf.includes(attachment.extension))
    )
      return false
    return true
  }

  const ok2Update = (field: Fields): boolean => {
    if (reasonRequired && !reason) return false
    if (
      !isAppendCQ &&
      field.name === 'type' &&
      newValue(field.name) !== EnumAttachmentType.OTHER &&
      (allAttachment || []).some(
        item =>
          item.type === newValue(field.name) && item.expandStatus === EnumExpandStatus.FOLLOWING
      )
    ) {
      setConfirmChangeAttachmentType(true)
      setField(field)
      return false
    }
    return true
  }

  const handleOverride = async (field: Fields) => {
    setIsLoading(true)
    await handleUpdateField(
      field.table,
      field.name,
      oldValue(field.name),
      newValue(field.name),
      attachment?.url_attachment || ''
    )
    // If Change Request => revertChange
    if (!isOverride && !isAppendCQ) {
      onCancelClick(field)
    }
    setIsLoading(false)
    setConfirmChangeAttachmentType(false)
  }

  const onCancelClick = (field: Fields) => {
    onFieldChange({
      target: { name: field.name, value: attachment[field.name] },
    } as ChangeFieldEvent)
  }

  const numPendingDesc =
    overviewPendingRequest?.filter(
      (i: { tableName: string; columnName: string; rowId: string; source: string }) =>
        i.tableName === TableNames?.COMPANIES_ATTACHMENTS &&
        i.columnName === description.name &&
        i.rowId === (attachment.url_attachment || '')
    )[0]?.total || 0

  const reasonRequired = !isOverride && !isAppendCQ

  const viewHistoryFn = (tableName: string, columnName: string, id: string) => {
    return !showViewHistory(tableName, columnName, id)
      ? undefined
      : () => {
          getHistory && getHistory({ tableName: tableName, columnName })
        }
  }

  const viewPendingCQFn = (tableName: string, columnName: string, id: string) => {
    return !showPendingChangeRequest(tableName, columnName, id)
      ? undefined
      : () => {
          getPendingCR &&
            getPendingCR({
              tableName: tableName,
              columnName: columnName,
            })
        }
  }

  // const callCancelCBAfterAction = !isOverride && !isAppendCQ
  const [getFileUrl, { loading: downloadLoading, data: fileData }] = useLazyQuery(getSignUrl, {
    fetchPolicy: 'network-only',
    onCompleted() {
      const url = fileData?.getSignUrl[0]?.signedUrl
      if (url) {
        window.open(url)
      }
    },
  })

  const onDownloadFile = (id: string | null) => {
    if (!downloadLoading) {
      getFileUrl({
        variables: {
          input: {
            companyIds: [+companyId],
            fileDetails: [{ fileId: id }],
            operation: 'getObject',
          },
        },
      })
    }
  }

  return (
    <Box
      sx={{
        bg: 'gray03',
        my: 3,
        borderRadius: 10,
        p: 4,
        border: validateType() ? null : '1px solid red',
      }}
    >
      <Flex sx={{ alignItems: 'center', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Paragraph
              onClick={() => {
                onDownloadFile(attachment.url_attachment)
              }}
              sx={{ color: 'primary', mt: 1, cursor: downloadLoading ? 'wait' : 'pointer' }}
              bold
            >
              {attachment.name || ''}
            </Paragraph>
            <Paragraph>{`Uploaded Date: ${moment(attachment.date_created).format(DEFAULT_VIEW_DATE_FORMAT)}`}</Paragraph>
          </Flex>
          {!validateType() && (
            <Paragraph sx={{ mt: 1, flex: 1, color: 'red' }}>{`${newValue(
              'type'
            )} must be ${getAttachmentType(
              newValue('type') as EnumAttachmentType
            )} file`}</Paragraph>
          )}
          <Grid sx={{ flex: 1 }} columns={'1fr 1fr'} gap={2}>
            {fields.map((field: Fields) => {
              const { total: numPending } = findCQ(
                overviewPendingRequest,
                {
                  tableName: field.table,
                  columnName: field.name,
                  rowId: attachment.url_attachment || '',
                  source: EnumCompanySource.BCG,
                },
                true
              ) || {
                total: 0,
              }

              return (
                <Box key={field.key}>
                  <ReasonPopover
                    reasonRequired={reasonRequired}
                    zIndex={popoverZIndex}
                    disabled={fieldDisabled(field.type)}
                    labelSx={{ opacity: fieldDisabled(field.type) ? 0.5 : 1 }}
                    positions={['top']}
                    buttons={[
                      {
                        label: 'Submit',
                        isCancel: true,
                        action: async () => {
                          if (!ok2Update(field)) return false
                          await handleOverride(field)
                        },
                        type: 'primary',
                        disabled:
                          isLoading ||
                          fieldState(field.name) === 'error' ||
                          trimTheString(oldValue(field.name)) ===
                            trimTheString(newValue(field.name)) ||
                          disabled ||
                          (!validateType() && field.name === 'type') ||
                          (reasonRequired && !reason),
                      },
                    ]}
                    oldValue={oldValue(field.name)}
                    newValue={newValue(field.name)}
                    reason={reason}
                    setReason={setReason}
                    viewHistory={
                      !showViewHistory(field.table, field.name, attachment.url_attachment || '')
                        ? undefined
                        : () => {
                            getHistory &&
                              getHistory({ tableName: field.table, columnName: field.name })
                          }
                    }
                    viewPendingChangeRequest={
                      !showPendingChangeRequest(
                        field.table,
                        field.name,
                        attachment.url_attachment || ''
                      )
                        ? undefined
                        : () => {
                            getPendingCR &&
                              getPendingCR({ tableName: field.table, columnName: field.name })
                          }
                    }
                    totalItemPendingCR={numPending}
                    // Note RevertChange After Submit
                    // callCancelCBAfterAction={callCancelCBAfterAction}
                    onCancelCallBack={() => {
                      onCancelClick(field)
                    }}
                    label={' '}
                  >
                    {field.type === 'dropdown' ? (
                      <Dropdown
                        placeholder={field.placeholder || ''}
                        name={field.name}
                        colorInput="gray01"
                        onChange={e => onFieldChange(e)}
                        value={state[field.name] || ''}
                        disabled={fieldDisabled(field.type)}
                        options={attachmentTypeOptions}
                      />
                    ) : (
                      <TextField
                        placeholder={field.placeholder || ''}
                        name={field.name}
                        colorInput="gray01"
                        onChange={e => onFieldChange(e)}
                        value={state[field.name] || ''}
                        fieldState={fieldState(field.name)}
                        disabled={fieldDisabled(field.type)}
                      />
                    )}
                  </ReasonPopover>
                </Box>
              )
            })}
          </Grid>
          <ReasonPopover
            reasonRequired={reasonRequired}
            zIndex={popoverZIndex}
            disabled={fieldDisabled('input')}
            labelSx={{ opacity: fieldDisabled('input') ? 0.5 : 1 }}
            positions={['top']}
            buttons={[
              {
                label: 'Submit',
                isCancel: true,
                action: async () => {
                  if (!ok2Update(field)) return
                  await handleOverride(description)
                },
                type: 'primary',
                disabled:
                  isLoading ||
                  fieldState(description.name) === 'error' ||
                  oldValue(description.name) === newValue(description.name) ||
                  disabled ||
                  (reasonRequired && !reason),
              },
            ]}
            oldValue={oldValue(description.name)}
            newValue={newValue(description.name)}
            reason={reason}
            setReason={setReason}
            viewHistory={viewHistoryFn(
              TableNames?.COMPANIES_ATTACHMENTS,
              description.name,
              attachment.url_attachment || ''
            )}
            viewPendingChangeRequest={viewPendingCQFn(
              TableNames?.COMPANIES_ATTACHMENTS,
              description.name,
              attachment.url_attachment || ''
            )}
            totalItemPendingCR={numPendingDesc}
            // Note RevertChange After Submit
            // callCancelCBAfterAction={callCancelCBAfterAction}
            onCancelCallBack={() => {
              onCancelClick(description)
            }}
            label={' '}
          >
            <TextField
              type={description.type}
              placeholder={'Description'}
              name={description.name}
              colorInput="gray01"
              onChange={e => onFieldChange(e)}
              value={state[description.name] || ''}
              fieldState={fieldState(description.name)}
              disabled={fieldDisabled(description.type)}
            />
          </ReasonPopover>
        </Box>
        <FCTStatusAction
          disabled={disabled}
          reasonRequired={reasonRequired}
          identity={{
            tableName: TableNames.COMPANIES_ATTACHMENTS,
            columnName: ColumnNames.FCT_STATUS_ID,
            rowId: attachment.url_attachment || '',
            source: '',
          }}
          fctStatusId={attachment.expandStatus as EnumExpandStatus}
          selfDeclared={!!attachment.selfDeclared}
          viewHistoryFn={({ tableName, columnName, rowId }) => {
            return viewHistoryFn(tableName, columnName, rowId)
          }}
          viewPendingCQFn={({ tableName, columnName, rowId }) => {
            return viewPendingCQFn(tableName, columnName, rowId)
          }}
          handleUpdateStatus={async (reason, identity) => {
            await handleUpdateStatus(reason)
          }}
          handleAppendDataCQAction={handleAppendDataCQAction}
          getNumPending={identity => {
            return getNumPending(overviewPendingRequest, identity, true)
          }}
          users={users}
        />
      </Flex>

      {confirmChangeAttachmentType && (
        <Modal
          buttons={[
            {
              disabled: isLoading,
              label: copy.modals.buttons.no,
              type: 'outline',
              action: () => {
                setConfirmChangeAttachmentType(false)
                onCancelClick(field)
              },
            },
            {
              disabled: isLoading,
              label: copy.modals.buttons.yes,
              type: 'primary',
              action: () => {
                handleOverride(field)
              },
            },
          ]}
        >
          <Heading center as="h4" sx={{ mb: 2 }}>
            {copy.modals.confirm.changeAttachmentType}
          </Heading>
        </Modal>
      )}
    </Box>
  )
}

export default EditDocumentation
