import React, { useState } from 'react'
import { Box, Label } from '@theme-ui/components'
import { CurrentClientForm, Modal, Updating } from '../../../components'
import strings from '../../../strings'
import { Heading, Paragraph } from '../../../components/primitives'
import { ViewHistoryProps } from '../CompanyForm'
import {
  CurrentClient,
  CurrentClientResult,
} from '../../../components/CurrentClientForm/CurrentClientForm'
import { FileState, GetCompanyOverrideInput } from '../../../types'
import CompanyContext from '../provider/CompanyContext'
import { ETLRunTimeContext } from '../../../context'
import {
  ColumnNames,
  MBSize,
  OverridesCompanyDataInput,
  putFileToS3,
  scrollToElement,
  validateFile,
} from '../helpers'
import { useApolloClient, useMutation } from '@apollo/client'
import { GET_SIGN_URL_FOR_OTHERS, APPEND_CURRENT_CLIENT } from '../graphql'
import { acceptedFormats, isURL } from '../../../utils'
import {
  ENumDataType,
  EnumExpandStatusId,
  EnumFileSize,
  EnumSignUrlOperation,
} from '../../../types/enums'
import { useParams } from 'react-router'
import { compareString } from '../../../utils/helper'
import useChangeRequest, { HandleAfterApproveData } from '../../../hooks/useChangeRequest'

type CurrentClientProps = {
  data: CurrentClientResult[]
  loading?: boolean
  info?: React.ReactElement
  isEdit?: boolean
  setError(err: Error): void
  refetch(): void
} & ViewHistoryProps

let isFirstRun = true
const CurrentClientComponent = ({
  data,
  loading,
  refetch,
  setError,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
}: CurrentClientProps) => {
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
  const [appendingState, setAppendingState] = useState<CurrentClient[]>([])
  const [editState, setEditState] = useState<CurrentClientResult[]>([])
  const [oldState, setOldState] = useState<CurrentClientResult[]>([])

  // Graphql
  const client = useApolloClient()

  const [appendClient, { loading: appending }] = useMutation(APPEND_CURRENT_CLIENT, {
    onCompleted: () => {
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
      refetch()
    },
  })

  // Function
  const handleAfterReject = (data: GetCompanyOverrideInput, isAppendData: boolean) => {
    if (isAppendData) {
      setEditState(editState.filter(item => `${item.company_client_id}` !== data.rowId))
      setOldState(oldState.filter(item => `${item.company_client_id}` !== data.rowId))
    }
  }

  const updateStatus = (id: string | number, newStatus: EnumExpandStatusId) => {
    const mapFn = (item: CurrentClientResult) => {
      return `${item.company_client_id}` === id ? { ...item, fct_status_id: +newStatus } : item
    }

    setEditState((editState || []).map(mapFn))
    setOldState(oldState.map(mapFn))
  }

  const handleApproveUpdateNewData = (data: HandleAfterApproveData) => {
    if (data.columnName === ColumnNames.FCT_STATUS_ID) {
      updateStatus(data.rowId, data.newValue as EnumExpandStatusId)
    } else {
      const mapFn = (item: CurrentClientResult) =>
        `${item.client_id}` === data.rowId ? { ...item, [data.columnName]: data.newValue } : item

      setEditState((editState || []).map(mapFn))
      setOldState(oldState.map(mapFn))
    }
  }

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

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    showPendingChangeRequest,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleApproveUpdateNewData,
    handleAfterReject,
    defaultSource: companySource,
    companyId: +companyId,
  })

  const uploadFiles = async (files: FileState[]) => {
    const input = {
      data_type: ENumDataType.USE_CASE,
      operation: EnumSignUrlOperation.PUT,
      ids: [`${companyId}`],
      content_types: files.map(({ file }) => file.type),
    }
    let ids = []
    const res = await client.query({
      query: GET_SIGN_URL_FOR_OTHERS,
      variables: { input },
      fetchPolicy: 'network-only',
    })

    for (const [idx, url] of res.data.getOthersSignUrl.entries()) {
      await putFileToS3(url.signedUrl, files[idx])
      ids.push(url.fileId)
    }
    return ids
  }

  const handleAddClient = async (appendingState: CurrentClient[]) => {
    if (!checkTimeETL()) return
    try {
      let currentClients = []
      for (const client of appendingState) {
        if (!!client.file) {
          const ids = (await uploadFiles([client.file])) || []
          currentClients.push({ ...client, logo_bucket_url: ids[0] })
        } else currentClients.push(client)
      }

      const input = {
        companyId: +companyId,
        currentClients: currentClients.map(({ client_id, name, logo_bucket_url, url }) => ({
          client_id,
          name,
          logo_bucket_url,
          url,
        })),
      }
      if (input.currentClients.some(({ name }) => name.length > 0)) {
        await appendClient({ variables: input })
      }
      setAppendingState([])
    } catch (err) {
      setError(err)
    }
  }

  React.useEffect(() => {
    setEditState(data)
    setOldState(data)
  }, [setEditState, setOldState, data])

  React.useEffect(() => {
    if (!rowId || !rowId.includes('client')) isFirstRun = false
    if (rowId && isFirstRun) {
      const id = (rowId?.split('_') || [])[1]

      const client = data.find(
        ({ client_id, company_client_id }) => `${client_id}` === id || company_client_id === id
      )

      if (client) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          const el =
            document.getElementById(`client-${client?.company_client_id}` || '') ||
            document.getElementById(`client-${client?.client_id}` || '')

          scrollToElement(el)
          isFirstRun = false
        }, 10)
      }
    }
  }, [data, rowId, companyId])

  const checkDuplicate = React.useCallback(
    client => {
      return (
        [...editState, ...appendingState].filter(
          ({ name, url }) => compareString(name, client.name) && compareString(url, client.url)
        ).length > 1
      )
    },
    [editState, appendingState]
  )

  return (
    <>
      <Box>
        {
          <>
            <Heading as="h3" sx={{ mb: 20 }}>
              {copy.titles.currentClients}
            </Heading>
            {loading ? (
              <Updating loading sx={{ p: 5 }} />
            ) : (
              <CurrentClientForm
                acceptTypes={acceptTypes}
                overviewPendingRequest={overviewPendingRequest}
                refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                handleClickShowPendingCR={handleClickShowPendingCR}
                showPendingChangeRequest={showPendingChangeRequest}
                handleAppendDataCQAction={handleAppendDataCQAction}
                isOverridesUser={isOverridesUser}
                handleUpdateStatus={handleUpdateStatus}
                onChange={() => {}}
                onChangeEdit={(partial: CurrentClientResult[]) => {
                  setEditState([...partial])
                }}
                oldState={oldState}
                editState={editState}
                isEdit={true}
                companyId={companyId}
                showViewHistory={showViewHistory}
                refetchViewHistoryCols={refetchViewHistoryCols}
                buttonLabel={`Add Current Clients +`}
                onAddField={() => {
                  if (!checkTimeETL()) return
                  setAppendingState([{ name: '' } as CurrentClient])
                }}
                setOldState={(partial: CurrentClientResult[]) => {
                  setOldState([...partial])
                }}
                uploadFiles={uploadFiles}
                setError={setError}
              />
            )}
          </>
        }
      </Box>
      {!!appendingState.length && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.buttons.cancel,
              type: 'secondary',
              action: () => {
                setAppendingState([])
              },
              disabled: loading || appending,
            },
            {
              label: copy.buttons.save,
              type: 'primary',
              action: async () => {
                await handleAddClient(appendingState)
              },
              disabled:
                loading ||
                !appendingState.length ||
                appending ||
                appendingState.some(v => validate(v) === 'error') ||
                appendingState.some(v => checkDuplicate(v)),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add New Current Client`}
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
            <Label
              sx={{
                flex: 1,
              }}
            >
              New Current Clients {appendingState.length && `(${appendingState.length})`}
            </Label>
            <CurrentClientForm
              isEdit={false}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              buttonLabel={`Add Client +`}
              state={appendingState}
              onAddField={() => {
                const cloneState = [...appendingState]
                cloneState.push({
                  name: '',
                } as CurrentClientResult)
                setAppendingState(cloneState)
              }}
              onChange={setAppendingState}
              acceptTypes={acceptTypes}
              setError={setError}
              checkDuplicate={checkDuplicate}
            />
          </Box>
          {appendingState.some(
            item => item.file && !validateFile(acceptTypes.format, item.file)
          ) && (
            <Paragraph sx={{ flex: 1, mt: 4, color: 'red' }}>{acceptTypes.invalidText}</Paragraph>
          )}
        </Modal>
      )}
      <PendingCRModal />
    </>
  )
}

export default CurrentClientComponent

const acceptTypes = {
  format: [...acceptedFormats.jpg, ...acceptedFormats.png],
  invalidText: `${strings.common.invalidFile
    .replace('$type', '.JPG, .PNG')
    .replace('$size', `${EnumFileSize.IMG / MBSize}MB`)}`,
}
const validate = (c: CurrentClient) => {
  if (!c.name?.trim() || !c.url?.trim()) return 'error'
  if ((c.file && !validateFile(acceptTypes.format, c.file)) || (c.url && !isURL(c.url)))
    return 'error'
  return 'default'
}
