import { useApolloClient, useMutation } from '@apollo/client'
import { Box, Label } from '@theme-ui/components'
import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Modal, UseCaseForm, Updating } from '../../../components'
import { Heading } from '../../../components/primitives'
import { ETLRunTimeContext } from '../../../context'
import strings from '../../../strings'
import { FieldStates, FileState, GetCompanyOverrideInput } from '../../../types'
import { ENumDataType, EnumFileSize, EnumSignUrlOperation } from '../../../types/enums'
import { ViewHistoryProps } from '../CompanyForm'
import { APPEND_USE_CASE, GET_SIGN_URL_FOR_OTHERS } from '../graphql'
import useUseCaseCQ from '../../../hooks/useCase/useUseCaseCQ'
import CompanyContext from '../provider/CompanyContext'
import {
  AcceptedType,
  MBSize,
  OverridesCompanyDataInput,
  putFileToS3,
  scrollToElement,
  validateFile,
} from '../helpers'
import { UseCaseResult } from '../../../components/UseCaseForm/UseCaseForm'
import { acceptedFormats, checkLength, isEmail } from '../../../utils'

export type UseCaseTypeResult = {
  useCaseTypeId: number
  useCaseTypeName: string
  isMultiple: boolean
  isFile: boolean
}

export type UseCaseFormProps = {
  types: UseCaseTypeResult[]
  data: UseCaseResult[]
  loading: boolean
  info?: React.ReactElement
  setError(err: Error): void
  refetch(): void
} & ViewHistoryProps

const acceptTypes: { [x: number]: AcceptedType } = {
  2: {
    format: [...acceptedFormats.jpg, ...acceptedFormats.png],
    invalidText: `${strings.common.invalidFile
      .replace('$type', '.JPG, .PNG')
      .replace('$size', `${EnumFileSize.IMG / MBSize}MB`)}`,
  },
  4: {
    format: acceptedFormats.video,
    invalidText: `${strings.common.invalidFile
      .replace('$type', '.MP4, .MOV')
      .replace('$size', `${EnumFileSize.VIDEO / MBSize}MB`)}`,
  },
  5: {
    format: acceptedFormats.pdf,
    invalidText: `${strings.common.invalidFile
      .replace('$type', '.PDF')
      .replace('$size', `${EnumFileSize.PDF / MBSize}MB`)}`,
  },
  7: {
    format: [...acceptedFormats.jpg, ...acceptedFormats.png],
    invalidText: `${strings.common.invalidFile
      .replace('$type', '.JPG, .PNG')
      .replace('$size', `${EnumFileSize.IMG / MBSize}MB`)}`,
  },
}

const emailType = [6]

let isFirstRun = true

const UseCase = ({
  types,
  data,
  loading,
  refetch,
  setError,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
}: UseCaseFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings
  const { cr: rowId } = useParams<any>()

  // Context
  const {
    companyId,
    companySource,
    isOverridesUser,
    handleUpdateStatus: _handleUpdateStatus,
  } = React.useContext(CompanyContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // State
  const [fileState, setFileState] = useState<FileState[]>([])
  const [appendingState, setAppendingState] = useState<string[]>([])
  const [appendingItem, setAppendingItem] = useState<UseCaseTypeResult>()

  // Graphql
  const client = useApolloClient()

  const [appendUseCase, { loading: appending }] = useMutation(APPEND_USE_CASE, {
    onCompleted() {
      refetch()
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
  })

  const handleUpdateStatus = async (input: OverridesCompanyDataInput) => {
    const { tableName, columnName, id, reason } = input
    await _handleUpdateStatus(input)
    isOverridesUser &&
      handleApproveUpdateNewData({
        tableName,
        columnName,
        rowId: id,
        newValue: input.newValue as string,
        comment: reason,
      })
  }

  const handleAfterReject = (data: GetCompanyOverrideInput, isAppendData: boolean) => {
    if (isAppendData) {
      setEditState(editState.filter(item => `${item.use_case_id}` !== data.rowId))
      setOldState(oldState.filter(item => `${item.use_case_id}` !== data.rowId))
    }
  }
  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    showPendingChangeRequest,
    handleAppendDataCQAction,
    editState,
    setEditState,
    oldState,
    setOldState,
    handleApproveUpdateNewData,
  } = useUseCaseCQ({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
    handleAfterReject,
  })

  const uploadFiles = async () => {
    const input = {
      data_type: ENumDataType.USE_CASE,
      operation: EnumSignUrlOperation.PUT,
      ids: [`${companyId}`],
      content_types: fileState.map(({ file }) => file.type),
    }
    let ids = []
    const res = await client.query({
      query: GET_SIGN_URL_FOR_OTHERS,
      variables: { input },
      fetchPolicy: 'network-only',
    })

    for (const [idx, url] of res.data.getOthersSignUrl.entries()) {
      await putFileToS3(url.signedUrl, fileState[idx])
      ids.push(url.fileId)
    }
    return ids
  }

  const handleAddUseCase = async (appendingState: string[], appendingItem: UseCaseTypeResult) => {
    if (!checkTimeETL()) return
    try {
      let value = appendingState.filter(e => e.length > 0).map(v => v.trim())
      if (appendingItem.isFile) {
        value = (await uploadFiles()) || []
      }

      const input = {
        companyId: +companyId,
        useCases: [
          {
            use_case_type_id: appendingItem.useCaseTypeId,
            use_case_value: value,
          },
        ],
      }
      if (input.useCases.some(({ use_case_value }) => use_case_value.length > 0)) {
        await appendUseCase({ variables: input })
      }
      setAppendingState([])
      setFileState([])
      setAppendingItem(undefined)
    } catch (err) {
      setError(err)
    }
  }

  React.useEffect(() => {
    setEditState(data)
    setOldState(data)
  }, [setEditState, setOldState, data])

  React.useEffect(() => {
    if (!rowId) isFirstRun = false
    if (rowId && isFirstRun) {
      const useCase = oldState.find(({ use_case_id }) => `${use_case_id}` === rowId)

      if (useCase) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(`${useCase?.use_case_id}` || ''))
          isFirstRun = false
        }, 10)
      }
    }
  }, [oldState, rowId, companyId])

  return (
    <>
      <Box sx={{ mt: 60 }}>
        <Heading as="h3" sx={{ mb: 20 }}>
          {copy.titles.useCase}
        </Heading>

        {loading ? (
          <Updating loading sx={{ p: 5 }} />
        ) : (
          types?.map((uc: UseCaseTypeResult, index: number) => {
            const oldData = oldState.filter(item => item.use_case_type_id === uc.useCaseTypeId)
            const editingData = editState.filter(
              ({ use_case_type_id }) => use_case_type_id === uc.useCaseTypeId
            )
            return (
              <Box key={index}>
                <Label id={uc.useCaseTypeName} sx={{ flex: 1 }}>
                  {uc.useCaseTypeName}
                </Label>

                <UseCaseForm
                  {...uc}
                  canBeAdd={uc.isMultiple || !oldData?.length}
                  overviewPendingRequest={overviewPendingRequest}
                  refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                  handleClickShowPendingCR={handleClickShowPendingCR}
                  showPendingChangeRequest={showPendingChangeRequest}
                  handleAppendDataCQAction={handleAppendDataCQAction}
                  isOverridesUser={isOverridesUser}
                  handleUpdateStatus={handleUpdateStatus}
                  validate={validate([], oldData || [], uc.useCaseTypeId)}
                  onChange={() => {}}
                  onChangeEdit={(partial: UseCaseResult[]) => {
                    setEditState([
                      ...editState.filter(i => i.use_case_type_id !== uc.useCaseTypeId),
                      ...partial,
                    ])
                  }}
                  oldState={oldData}
                  editState={editingData}
                  isEdit={true}
                  companyId={companyId}
                  showViewHistory={showViewHistory}
                  refetchViewHistoryCols={refetchViewHistoryCols}
                  buttonLabel={`Add ${uc.useCaseTypeName} +`}
                  onAddField={() => {
                    if (!checkTimeETL()) return
                    setAppendingState([''])
                    setAppendingItem(uc)
                  }}
                  setOldState={(v: UseCaseResult[]) => {
                    setOldState([
                      ...oldState.filter(
                        ({ use_case_type_id }) => use_case_type_id !== uc.useCaseTypeId
                      ),
                      ...(v || []),
                    ])
                  }}
                  setFileState={setFileState}
                  fileState={fileState}
                  acceptTypes={acceptTypes[uc.useCaseTypeId]}
                  uploadFiles={uploadFiles}
                  placeholder={
                    emailType.includes(uc.useCaseTypeId) ? 'Enter email address' : undefined
                  }
                  setError={setError}
                />
              </Box>
            )
          })
        )}

        {!!appendingState.length && appendingItem && (
          <Modal
            sx={{
              maxHeight: '90vh',
              width: appendingItem.isFile ? '40vw' : '60vw',
              maxWidth: '60vw',
              padding: 0,
            }}
            buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
            buttons={[
              {
                label: copy.buttons.cancel,
                type: 'secondary',
                action: () => {
                  setAppendingState([])
                  setAppendingItem(undefined)
                  setFileState([])
                },
                disabled: appending,
              },
              {
                label: copy.buttons.save,
                type: 'primary',
                action: async () => {
                  await handleAddUseCase(appendingState, appendingItem)
                },
                disabled:
                  appending ||
                  (appendingItem.isFile &&
                    fileState.some(
                      v => !validateFile(acceptTypes[appendingItem.useCaseTypeId].format, v)
                    )) ||
                  appendingState.some(
                    v =>
                      validate(
                        appendingState,
                        editState.filter(
                          ({ use_case_type_id }) => use_case_type_id === appendingItem.useCaseTypeId
                        ) || [],
                        appendingItem.useCaseTypeId
                      )(v) === 'error'
                  ),
              },
            ]}
          >
            <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
              {`Add New ${appendingItem.useCaseTypeName}`}
            </Heading>
            <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
              {!appendingItem.isFile && (
                <Label
                  id={`${appendingItem.useCaseTypeName}`}
                  sx={{
                    flex: 1,
                  }}
                >
                  New {appendingItem.useCaseTypeName}{' '}
                  {appendingState.length && `(${appendingState.length})`}
                </Label>
              )}
              <UseCaseForm
                {...appendingItem}
                canBeAdd={
                  !appendingItem.isFile && (appendingItem.isMultiple || !appendingState.length)
                }
                isEdit={false}
                companyId={companyId}
                showViewHistory={showViewHistory}
                refetchViewHistoryCols={refetchViewHistoryCols}
                buttonLabel={`Add ${appendingItem.useCaseTypeName} +`}
                state={appendingState}
                editState={
                  editState.filter(
                    ({ use_case_type_id }) => use_case_type_id === appendingItem.useCaseTypeId
                  ) || []
                }
                onAddField={() => {
                  const cloneState = [...appendingState]
                  cloneState.push('')
                  setAppendingState(cloneState)
                }}
                onChange={setAppendingState}
                validate={validate(
                  appendingState,
                  editState.filter(
                    ({ use_case_type_id }) => use_case_type_id === appendingItem.useCaseTypeId
                  ) || [],
                  appendingItem.useCaseTypeId
                )}
                setFileState={setFileState}
                fileState={fileState}
                acceptTypes={acceptTypes[appendingItem.useCaseTypeId]}
                placeholder={
                  emailType.includes(appendingItem.useCaseTypeId)
                    ? 'Enter email address'
                    : undefined
                }
                setError={setError}
              />
            </Box>
          </Modal>
        )}

        <PendingCRModal />
      </Box>
    </>
  )
}

export default UseCase

const maxProfileLength = 4000
const validate = (state: string[], editState: UseCaseResult[], id: number) => (
  value: string,
  maxlength: number = maxProfileLength
): keyof FieldStates => {
  const mergeState = [...state, ...(editState || []).map(({ use_case_value }) => use_case_value)]
  const isDuplicated = mergeState.filter(v => value === v)?.length > 1

  const invalidEmail = emailType.includes(id) && !isEmail(value)

  if (!value?.length) return 'default'
  if (checkLength(value, maxlength) || isDuplicated || invalidEmail) return 'error'
  return 'default'
}
