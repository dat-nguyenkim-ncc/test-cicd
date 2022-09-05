import { useMutation, useApolloClient, useQuery } from '@apollo/client'

import { Box, Divider, Flex, Label, Text } from '@theme-ui/components'
import React from 'react'
import { Button, Dropdown, Icon, Modal, Pagination } from '../../components'
import { PageTemplate } from '../../components/PageTemplate'
import { ReportList } from '../../components/ReportList'
import strings from '../../strings'
import {
  CompanyMention,
  FileState,
  FormOption,
  IPagination,
  IReport,
  IReportWithCompanies,
  ISortBy,
  ResearchReportFile,
  SignUrl,
} from '../../types'
import { EnumExpandStatusId, EnumS3Operation, SortDirection } from '../../types/enums'
import {
  EditResearchReportInput,
  EDIT_REPORT,
  GET_ALL_REPORTS,
  GET_COMPANIES_BY_ISSUE_NUMBER,
  GET_SIGN_URLS,
  UploadResearchReportInput,
  UPLOAD_REPORT,
} from './graphql'
import UploadReport, { UploadReportForm } from './UploadReport'
import { ErrorModal } from '../../components/ErrorModal'
import { onError } from '../../sentry'
import { Heading } from '../../components/primitives'
import { ReportManagementContext } from './context'
import { ETLRunTimeContext } from '../../context'
import { transformPostDate } from '../CompanyForm/helpers'

enum Modals {
  upload = 'upload',
  confirm = 'confirm',
}

enum ESortFields {
  ISSUE_NUMBER = 'issue_number',
  NAME = 'name',
  PUBLISHED_DATE = 'published_date',
  UPLOADED_DATE = 'uploaded_date',
}

type SortBy = ISortBy<ESortFields>

const sortByOptions: FormOption[] = [
  { label: 'Issue number', value: ESortFields.ISSUE_NUMBER },
  { label: 'Name', value: ESortFields.NAME },
  { label: 'Published date', value: ESortFields.PUBLISHED_DATE },
  { label: 'Uploaded date', value: ESortFields.UPLOADED_DATE },
]

export type Props = any

const ReportManagement = (props: Props) => {
  const { reportManagement: copy } = strings

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [modal, setModal] = React.useState<Modals>()
  const [error, setError] = React.useState<string>('')
  const [editItem, setEditItem] = React.useState<IReport>()

  const [sortBy, setSortBy] = React.useState<SortBy>({
    field: ESortFields.UPLOADED_DATE,
    direction: SortDirection.DESC,
  })

  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })

  const [pendingUploadState, setPendingUploadState] = React.useState<{
    form: UploadReportForm
    existingReports: IReportWithCompanies[]
  }>()

  const { form, existingReports, oldCompaniesMention, enabledReport } = React.useMemo(() => {
    const { form, existingReports } = pendingUploadState || {
      existingReports: [] as IReportWithCompanies[],
    }

    const enabledReport = !existingReports.length
      ? undefined
      : existingReports.find(item => item.expandStatus === +EnumExpandStatusId.FOLLOWING)

    const oldCompaniesMention = existingReports.reduce((acc, curr) => {
      return [...acc, ...(curr.companies || [])]
    }, [] as CompanyMention[])

    return { form, existingReports, oldCompaniesMention, enabledReport }
  }, [pendingUploadState])

  // GraphQL

  const [upload] = useMutation<boolean, { input: UploadResearchReportInput }>(UPLOAD_REPORT)
  const [editReport, { loading: editing }] = useMutation<
    boolean,
    { input: EditResearchReportInput }
  >(EDIT_REPORT)

  const { data, networkStatus, loading: fetching, refetch } = useQuery<
    {
      getAllReports: { total: number; items: IReport[] }
    },
    { input: { sortBy: SortBy } & IPagination }
  >(GET_ALL_REPORTS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        sortBy: {
          field: ESortFields.UPLOADED_DATE,
          direction: SortDirection.DESC,
        },
        page: 1,
        pageSize: 10,
      },
    },
  })

  const { items: reports, total } = data?.getAllReports || {}
  const loading = networkStatus === 4 || fetching // loading or refetching
  const client = useApolloClient()

  const gotoPage = (pagination: IPagination, sortBy: SortBy) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    setSortBy(sortBy)
    refetch({ input: { sortBy, ...newPagination } })
  }

  const getSignUrls = async (
    fileState: FileState[],
    issueNumber: string,
    operation: EnumS3Operation = EnumS3Operation.PUT
  ): Promise<SignUrl[]> => {
    if (!fileState?.length) return Promise.resolve([])

    const fileDetails: ResearchReportFile[] = fileState.reduce(
      (res: ResearchReportFile[], { fileId, magicBytes, file, thumbnail }) => {
        if (thumbnail) {
          res.push({
            name: thumbnail.name,
            fileId: `${fileId}_thumbnail`,
            magicBytes,
            contentType: thumbnail.type,
            issueNumber,
          })
        }
        return [
          ...res,
          {
            name: file.name,
            fileId,
            magicBytes,
            contentType: file.type,
            issueNumber,
          },
        ]
      },
      []
    )

    const res = await client.query<{ researchReportGetSignUrl: SignUrl[] }>({
      query: GET_SIGN_URLS,
      variables: {
        input: {
          fileDetails,
          operation,
        },
      },
    })

    return res.data?.researchReportGetSignUrl || []
  }

  const putFileToS3 = async (signUrls: SignUrl[], fileState: FileState[]): Promise<any> => {
    if (!signUrls.length) return
    await Promise.all(
      (fileState || []).map(async file => {
        const matchingFile = signUrls.find((e: SignUrl) => e.fileId === file.fileId)
        const thumbnailFile = signUrls.find((e: SignUrl) => e.fileId === `${file.fileId}_thumbnail`)

        const requests = []
        if (matchingFile?.signedUrl) {
          requests.push(
            fetch(matchingFile.signedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.file.type,
              },
              body: file.file,
            })
          )
        }
        if (thumbnailFile?.signedUrl && file.thumbnail) {
          requests.push(
            fetch(thumbnailFile.signedUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.thumbnail.type,
              },
              body: file.thumbnail,
            })
          )
        }
        await Promise.all(requests)
      })
    )
  }

  const uploadFiles = async (fileState: FileState[], issueNumber: string) => {
    const signUrls = await getSignUrls(fileState, issueNumber, EnumS3Operation.PUT)
    await putFileToS3(signUrls, fileState)
  }

  const getUploadInput = ({
    formValue,
    fileState,
    companyIds,
  }: UploadReportForm): UploadResearchReportInput => {
    return {
      report: {
        issueNumber: formValue.issueNumber as string,
        description: formValue.description as string,
        name: formValue.name as string,
        publishedDate: transformPostDate(formValue.publishDate),
        version: (formValue.version || undefined) as string,
      },
      companyIds: companyIds || [],
      reportFiles: fileState.map(({ fileId, magicBytes, file }) => ({
        issueNumber: formValue.issueNumber as string,
        name: file.name,
        fileId,
        magicBytes,
        contentType: file.type,
      })),
    }
  }

  const getCompaniesByIssueNumber = async (
    issueNumber: string
  ): Promise<IReportWithCompanies[]> => {
    return await client
      .query<{ getCompaniesByIssueNumber: IReportWithCompanies[] }>({
        query: GET_COMPANIES_BY_ISSUE_NUMBER,
        fetchPolicy: 'no-cache',
        variables: {
          issueNumber,
        },
      })
      .then(({ data }) => data?.getCompaniesByIssueNumber || [])
  }

  const handleError = (error: Error) => {
    onError(error)
    setError(error.message)
  }

  const closeModal = () => {
    setModal(undefined)
    setEditItem(undefined)
  }

  const doUpload = async (form: UploadReportForm, extraCompaniesMention: CompanyMention[] = []) => {
    if (!checkTimeETL()) return
    try {
      const input = getUploadInput(form)
      await upload({
        variables: {
          input: {
            ...input,
            companyIds: [
              ...input.companyIds,
              ...extraCompaniesMention
                .filter(
                  i =>
                    i.version === enabledReport?.version &&
                    !input.companyIds.some(c => c.id === i.companyId)
                )
                .map(i => ({ id: i.companyId, directMention: i.directMention })),
            ],
          },
        },
      })
      await uploadFiles(form.fileState, form.formValue.issueNumber as string)

      refetch()
    } catch (error) {
      handleError(error)
    } finally {
      setPendingUploadState(undefined)
      closeModal()
    }
  }

  const handleUpload = async (form: UploadReportForm, isEdit: boolean = false) => {
    if (!checkTimeETL()) return
    try {
      if (isEdit) {
        const { formValue, companyIds } = form
        await editReport({
          variables: {
            input: {
              report: {
                issueNumber: formValue.issueNumber as string,
                description: formValue.description as string,
                name: formValue.name as string,
                publishedDate: transformPostDate(formValue.publishDate),
                version: (formValue.version as string) || undefined,
                expandStatus: editItem?.expandStatus,
              },
              companyIds,
            },
          },
        })
        closeModal()
        refetch()
      } else {
        if (form.companyIds?.length) {
          await doUpload(form)
        } else {
          const existingReports = await getCompaniesByIssueNumber(`${form.formValue.issueNumber}`)
          setPendingUploadState({ form, existingReports })
          setModal(Modals.confirm)
        }
      }
    } catch (error) {
      handleError(error)
    }
  }

  const onDownload = async (item: IReport) => {
    try {
      const signUrls = await getSignUrls(
        [
          {
            fileId: item.urlAttachment,
            description: '',
            file: {} as File,
            magicBytes: '',
            name: '',
            type: '',
          },
        ],
        item.issueNumber,
        EnumS3Operation.GET
      )
      if (!signUrls.length) return
      const signUrl = signUrls[0]
      window.open(signUrl.signedUrl, '_blank')
    } catch (error) {
      handleError(error)
    }
  }

  const onEdit = (item: IReport) => {
    if (!checkTimeETL()) return
    setEditItem(item)
  }

  return (
    <ReportManagementContext.Provider
      value={{
        editReport: async report => {
          if (!checkTimeETL()) return
          try {
            await editReport({ variables: { input: { report, companyIds: null } } })
            refetch()
          } catch (error) {
            handleError(error)
          }
        },
      }}
    >
      <PageTemplate title={copy.title} footerButtons={[]}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h4" sx={{ fontWeight: 'bold' }}>
            {total ? total : ''} Reports
          </Heading>
          <Button
            icon="uploadAlt"
            label="Upload Report(s)"
            iconLeft={true}
            sx={{ fontWeight: 'bold' }}
            onPress={() => {
              if (!checkTimeETL()) return
              setModal(Modals.upload)
            }}
          />
        </Flex>
        <Divider opacity={0.3} my={5} />
        <Flex sx={{ alignItems: 'center', mb: 6 }}>
          <Icon icon="sort" color="text" sx={{ mr: 2 }} />
          <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Sort by</Label>
          <Dropdown
            sx={{ minWidth: 300, mr: 3 }}
            name="sortBy"
            value={sortBy.field}
            options={sortByOptions}
            onChange={e => {
              const newSortBy = { ...sortBy, field: e.currentTarget.value }
              gotoPage(pagination, newSortBy)
            }}
          />
          <Dropdown
            name="sortBy"
            options={[
              { label: 'DESC', value: SortDirection.DESC },
              { label: 'ASC', value: SortDirection.ASC },
            ]}
            value={sortBy.direction}
            onChange={e => {
              const newSortBy = { ...sortBy, direction: e.currentTarget.value }
              gotoPage(pagination, newSortBy)
            }}
          />
        </Flex>
        <>
          <ReportList
            loading={loading || editing}
            reports={reports || []}
            onDownload={async item => {
              await onDownload(item)
            }}
            onEdit={item => onEdit(item)}
          />
          {!!total && (
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={pagination.page}
              totalPages={Math.ceil(total / pagination.pageSize)}
              changePage={page => {
                gotoPage({ ...pagination, page }, sortBy)
              }}
            />
          )}
        </>
      </PageTemplate>
      {editItem && (
        <Modal sx={{ p: 5, pr: 15, minWidth: 500 }}>
          <Box sx={{ width: '100%', position: 'relative' }}>
            <Button
              sx={{ position: 'absolute', top: -8, right: '6px' }}
              icon="remove"
              size="tiny"
              variant="black"
              onPress={() => {
                setEditItem(undefined)
              }}
            />
            <UploadReport
              onUpload={async input => {
                await handleUpload(input, !!editItem)
              }}
              onDelete={async input => {
                setModal(Modals.confirm)
              }}
              setError={setError}
              editItem={editItem}
            />
          </Box>
        </Modal>
      )}

      {modal === Modals.confirm && (
        <Modal sx={{ p: 6, minWidth: 500 }}>
          <Flex
            sx={{
              width: '100%',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {existingReports && form && (
              <>
                <Flex sx={{ alignItems: 'center' }}>
                  {oldCompaniesMention.length ? (
                    <>
                      <Icon icon="alert" size="small" background="green" color="white" />
                      <Heading center as="h4" sx={{ ml: 2 }}>
                        Info
                      </Heading>
                    </>
                  ) : (
                    <>
                      <Icon icon="alert" size="small" background="red" color="white" />
                      <Heading center as="h4" sx={{ ml: 2 }}>
                        Warning
                      </Heading>
                    </>
                  )}
                </Flex>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
                    {oldCompaniesMention?.length ? (
                      <>
                        {`Issue `}
                        <Text as="span" sx={{ fontWeight: 'bold' }}>
                          {form.formValue.issueNumber}
                        </Text>
                        {` version ${
                          enabledReport?.version || 'NA'
                        } has uploaded company ids, do you want to link these IDs to this upload?`}
                      </>
                    ) : (
                      <>
                        {`You have uploaded this report without any linked company IDs`}
                        <br />
                        {`Are you sure you want to continue?`}
                      </>
                    )}
                  </Text>
                  <Flex sx={{ mt: 5, width: '100%', justifyContent: 'center', gap: 3 }}>
                    <Button
                      label="No"
                      variant="outline"
                      onPress={async () => {
                        if (!oldCompaniesMention?.length) {
                          setPendingUploadState(undefined)
                          closeModal()
                        } else {
                          await doUpload(form)
                        }
                      }}
                    />
                    <Button
                      label={'Yes'}
                      onPress={async () => {
                        await doUpload(form, oldCompaniesMention || [])
                      }}
                    />
                  </Flex>
                </Box>
              </>
            )}
          </Flex>
        </Modal>
      )}

      {modal && [Modals.upload].includes(modal) && (
        <Modal sx={{ p: 5, pr: 15, minWidth: 500 }}>
          <Box sx={{ width: '100%', position: 'relative' }}>
            <Button
              sx={{ position: 'absolute', top: -8, right: '6px' }}
              icon="remove"
              size="tiny"
              variant="black"
              onPress={() => {
                setModal(undefined)
                setEditItem(undefined)
              }}
            />

            {modal === Modals.upload && (
              <UploadReport
                onUpload={async input => {
                  await handleUpload(input, !!editItem)
                }}
                onDelete={async () => {}}
                setError={setError}
              />
            )}
          </Box>
        </Modal>
      )}

      {error && <ErrorModal message={error} onOK={() => setError('')} />}
    </ReportManagementContext.Provider>
  )
}

export default ReportManagement
