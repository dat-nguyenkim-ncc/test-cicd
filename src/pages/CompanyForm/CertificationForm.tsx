import React, { useEffect, useState } from 'react'
import CompanyContext from './provider/CompanyContext'
import { TechnologyProps } from './TechnologyTotalPageForm'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import {
  APPEND_TECHNOLOGY_CERTIFICATION,
  GET_COMPANY_TECHNOLOGY_CERTIFICATION,
  GET_SIGN_URL_FOR_OTHERS,
} from './graphql'
import useTechnologyCQ from '../../hooks/technology/technologyCQ'
import {
  acceptTypes,
  CertificationTypeEnum,
  CertificationTypes,
  ColumnNames,
  NotOtherCertificationValues,
  putFileToS3,
  scrollToElement,
  validateCertification,
  validateFile,
} from './helpers'
import { Box, Label } from '@theme-ui/components'
import { ETLRunTimeContext } from '../../context'
import { Modal, Updating } from '../../components'
import strings from '../../strings'
import { Heading, Paragraph } from '../../components/primitives'
import CertificationEditForm from '../../components/Certification/Certification'
import { FileState } from '../../types'
import { ENumDataType, EnumSignUrlOperation } from '../../types/enums'
import { useParams } from 'react-router'

export type Certification = {
  certification_id: number
  certification_upload_bucket_key: string
  certification: string
  fct_status_id: number
  self_declared: number
  file?: FileState
  certification_other_value: string
  company_id: number
}

export type CertificationResponse = {
  getCompanyTechnologyCertification: Certification[]
}

export type CertificationType = {
  value: string
  label: string
}

let isFirstRun = true

const CertificationForm = ({
  companyId,
  onCancel,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  info,
  setError,
  setIsLoading = (isLoading: boolean) => {},
}: TechnologyProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { handleUpdateStatus, isOverridesUser, companySource } = React.useContext(CompanyContext)

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const mapFn = (item: Certification): Certification => {
    return NotOtherCertificationValues.includes(item.certification)
      ? item
      : {
          ...item,
          certification: CertificationTypeEnum.Other,
          certification_other_value: item.certification,
        }
  }

  const {
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    showPendingChangeRequest,
    handleAppendDataCQAction,
    editState,
    setEditState,
    oldState,
    setOldState,
    PendingCRModal,
  } = useTechnologyCQ<Certification>({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
    field: ColumnNames.CERTIFICATION_ID,
    mapAfterApprove: mapFn,
  })

  const [appendingState, setAppendingState] = useState<Certification[]>([])
  const [fileState, setFileState] = useState<FileState[]>([])
  const { cr: rowId } = useParams<any>()

  const { data, loading: querying, error: queryError, networkStatus, refetch } = useQuery<
    CertificationResponse
  >(GET_COMPANY_TECHNOLOGY_CERTIFICATION, {
    variables: {
      companyId: +companyId,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setEditState((data?.getCompanyTechnologyCertification || []).map(mapFn))
      setOldState((data?.getCompanyTechnologyCertification || []).map(mapFn))
      setIsLoading(false)
    },
    onError() {
      setIsLoading(false)
      setError(queryError as Error)
    },
  })

  useEffect(() => {
    if (!rowId) isFirstRun = false
    const id = (rowId?.split('_') || [])[1]
    if (id && isFirstRun && rowId?.includes(`certification_`)) {
      const certification = oldState.find(({ certification_id }) => `${certification_id}` === id)

      if (certification) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(
            document.getElementById(`certification_${certification?.certification_id}` || '')
          )
          isFirstRun = false
        }, 10)
      }
    }
  }, [oldState, rowId, companyId])

  const [addCertifications, { loading, error }] = useMutation(APPEND_TECHNOLOGY_CERTIFICATION, {
    onCompleted: () => {
      refetch()
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
    onError() {
      setError(error as Error)
    },
  })

  const client = useApolloClient()

  const uploadFiles = async (fileState?: FileState[]) => {
    const fileStateToPut = fileState?.length
      ? fileState
      : appendingState.map(({ file }) => file).filter(item => !!item)
    const input = {
      data_type: ENumDataType.TECHNOLOGY,
      operation: EnumSignUrlOperation.PUT,
      ids: [`${companyId}`],
      content_types: fileStateToPut.map(item => item?.file?.type),
    }
    let ids = []
    if (!input.content_types.length) return []
    const res = await client.query({
      query: GET_SIGN_URL_FOR_OTHERS,
      variables: { input },
      fetchPolicy: 'network-only',
    })

    for (const [idx, url] of res.data.getOthersSignUrl.entries()) {
      await putFileToS3(url.signedUrl, fileStateToPut[idx] as FileState)
      ids.push(url.fileId)
    }
    return ids
  }

  const handleAddCertification = async (appendingState: Certification[]) => {
    if (!checkTimeETL()) return
    try {
      const ids = (await uploadFiles()) || []
      const input = {
        company_id: +companyId,
        certifications: appendingState.map(
          ({ certification, certification_other_value, file }) => ({
            certification:
              certification === CertificationTypeEnum.Other
                ? certification_other_value
                : certification,
            certification_upload_bucket_key: file ? ids.shift() : '',
          })
        ),
      }

      await addCertifications({ variables: { input } })

      setAppendingState([])
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <>
      {querying || networkStatus === 4 ? (
        <Updating loading sx={{ p: 5 }} />
      ) : (
        <Box>
          {
            <>
              <CertificationEditForm
                acceptTypes={acceptTypes}
                overviewPendingRequest={overviewPendingRequest}
                refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                handleClickShowPendingCR={handleClickShowPendingCR}
                showPendingChangeRequest={showPendingChangeRequest}
                handleAppendDataCQAction={handleAppendDataCQAction}
                isOverridesUser={isOverridesUser}
                handleUpdateStatus={handleUpdateStatus}
                validate={validateCertification}
                onChange={() => {}}
                onChangeEdit={(partial: Certification[]) => {
                  setEditState([...partial])
                }}
                oldState={oldState}
                editState={editState}
                isEdit={true}
                companyId={companyId}
                showViewHistory={showViewHistory}
                refetchViewHistoryCols={refetchViewHistoryCols}
                buttonLabel={`Add Certification+`}
                onAddField={() => {
                  if (!checkTimeETL()) return
                  setAppendingState([
                    { certification: '', certification_upload_bucket_key: '' } as Certification,
                  ])
                }}
                setOldState={(partial: Certification[]) => {
                  setOldState([...partial])
                }}
                fileState={fileState}
                setFileState={setFileState}
                certificationTypes={CertificationTypes}
                uploadFiles={uploadFiles}
                setError={setError}
              />
            </>
          }
        </Box>
      )}
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
              disabled: loading,
            },
            {
              label: copy.buttons.save,
              type: 'primary',
              action: async () => {
                await handleAddCertification(appendingState)
              },
              disabled:
                loading ||
                !appendingState.length ||
                appendingState.some(v => validateCertification(v) === 'error'),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add New Certification`}
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
            <Label
              sx={{
                flex: 1,
              }}
            >
              New Certification {appendingState.length && `(${appendingState.length})`}
            </Label>
            <CertificationEditForm
              isEdit={false}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              buttonLabel={`Add Certification +`}
              state={appendingState}
              onAddField={() => {
                const cloneState = [...appendingState]
                cloneState.push({
                  certification: '',
                  certification_upload_bucket_key: '',
                } as Certification)
                setAppendingState(cloneState)
              }}
              onChange={setAppendingState}
              fileState={fileState}
              setFileState={setFileState}
              acceptTypes={acceptTypes}
              certificationTypes={CertificationTypes}
              setError={setError}
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

export default CertificationForm
