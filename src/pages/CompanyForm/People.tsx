import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Box, Flex, Grid, Label } from 'theme-ui'
import {
  Button,
  FooterCTAs,
  Modal,
  PeopleAvatar,
  PeopleForm,
  ViewOverrideButtons,
} from '../../components'
import FinanceItemWrapper from '../../components/FinanceItemWrapper'
import { PeopleDTOKeys, PeopleFieldNames } from '../../components/PeopleForm/PeopleForm'
import { Heading, Paragraph } from '../../components/primitives'
import { ETLRunTimeContext, UserContext } from '../../context'
import useChangeRequest from '../../hooks/useChangeRequest'
import { IUseForm } from '../../hooks/useForm/useForm'
import usePagination from '../../hooks/usePagination'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import strings from '../../strings'
import { GetCompanyOverrideInput, OverrideMultipleFieldState } from '../../types'
import { EnumExpandStatus, EnumExpandStatusId, Routes } from '../../types/enums'
import { LogoState, ViewHistoryProps } from './CompanyForm'
import {
  GET_COMPANY_PEOPLE,
  OVERRIDE_COMPANY_DATA,
  UpdateStatusInput1,
  APPEND_COMPANY_PEOPLE,
} from './graphql'
import {
  AppendPeopleInput,
  CompanyPeopleData,
  GetCompanyPeopleResult,
  GetCompanyPeopleVariables,
  GetPeopleByIdResult,
  GET_PEOPLE_BY_ID,
  useCRUDCompanyPeople,
} from './graphql/companyPeople'
import { GET_SIGN_URL_FOR_PEOPLE_IMAGE } from './graphql/getSignUrl'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  OverridesCompanyDataInput,
  putFileToS3,
  scrollToElement,
  TableNames,
  trimTheString,
} from './helpers'
import CompanyContext from './provider/CompanyContext'

const {
  pages: { peopleForm: copy },
} = strings

export type PendingUpdatePeopleState = OverrideMultipleFieldState<PeopleDTOKeys>

type Props = {
  companyId: number
  setError?(error: Error): void
} & ViewHistoryProps

let isFirstRun = true
let timeout: any

const People = ({
  companyId,
  setError = () => {},
  refetchViewHistoryCols = async () => {},
}: Props) => {
  const { cr: rowId } = useParams<any>()
  const history = useHistory()
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const client = useApolloClient()
  const [overrideData] = useMutation(OVERRIDE_COMPANY_DATA)
  const [appendPeople] = useMutation(APPEND_COMPANY_PEOPLE)

  const { data, loading: querying, error, networkStatus, refetch } = useQuery<
    GetCompanyPeopleResult,
    GetCompanyPeopleVariables
  >(GET_COMPANY_PEOPLE, {
    variables: {
      companyId: companyId,
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      rowId,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const { update } = useCRUDCompanyPeople()

  const list = React.useMemo(() => data?.getCompanyPeople?.result || [], [data])
  const loading = networkStatus === 4 || querying // loading or refetching

  const [editingItem, setEditingItem] = React.useState<CompanyPeopleData>()
  const [pendingUpdateData, setPendingUpdateData] = React.useState<PendingUpdatePeopleState>(
    {} as PendingUpdatePeopleState
  )

  React.useEffect(() => {
    if (data?.getCompanyPeople?.total !== total) setTotal(data?.getCompanyPeople?.total || 0)
  }, [data, total, setTotal])

  const {
    handleUpdateStatus,
    viewHistory,
    isOverridesUser,
    hasHistoryField,
    companySource,
  } = React.useContext(CompanyContext)

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleAfterReject: async (data, isAppendData) => {
      if (isAppendData) {
        refetch()
      }
    },
    handleApproveUpdateNewData: async (data, isAppendData) => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        const peopleRecord = list.find(item => item.companyPeopleId === data.rowId)
        updateStatus(peopleRecord?.id || '', data.newValue as EnumExpandStatusId)
      } else {
        const id = data.tableName !== TableNames.PEOPLE ? editingItem?.id || '' : data.rowId
        const updatedData = await refetchItem(id)
        if (editingItem && updatedData) {
          // Rerender modal
          setEditingItem(undefined)
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

  const refetchItem = async (id: string) => {
    const updatedData = await getPeopleById(id)
    updatedData ? update(id, updatedData) : refetch()
    return updatedData
  }

  const updateStatus = (id: string, status: EnumExpandStatusId) => {
    update(id, { fctStatusId: +status })
  }

  const handleUnfollowItem = async (reasonInput: UpdateStatusInput1, el: CompanyPeopleData) => {
    const { reason, status: newStatus } = reasonInput
    const newValue =
      newStatus === EnumExpandStatus.FOLLOWING
        ? EnumExpandStatusId.FOLLOWING
        : EnumExpandStatusId.UNFOLLOWED
    const input = {
      id: el.companyPeopleId,
      companyId: +companyId,
      reason: reason,
      tableName: TableNames.COMPANIES_PEOPLE,
      columnName: ColumnNames.FCT_STATUS_ID,
      source: el.source as string,
      newValue,
      oldValue:
        newStatus === EnumExpandStatus.FOLLOWING
          ? EnumExpandStatusId.UNFOLLOWED
          : EnumExpandStatusId.FOLLOWING,
    }
    try {
      await handleUpdateStatus(input)
      if (isOverridesUser) {
        updateStatus(el.id, newValue)
      }
    } catch (error) {
      setError(error)
    }
  }

  const [isUpdating, setIsUpdating] = React.useState(false)

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

  const getPeopleById = async (id: string): Promise<CompanyPeopleData | undefined> => {
    const result = await client.query<GetPeopleByIdResult, { id: string }>({
      query: GET_PEOPLE_BY_ID,
      variables: { id: id },
      fetchPolicy: 'network-only',
    })

    return result?.data?.getPeopleById
  }

  const handleUpdateItem = async (
    editingItem: CompanyPeopleData,
    pendingUpdateData: PendingUpdatePeopleState,
    image?: LogoState
  ) => {
    try {
      setIsUpdating(true)
      const records: OverridesCompanyDataInput[] = [...Object.values(pendingUpdateData)].filter(
        (item: OverridesCompanyDataInput) =>
          trimTheString(item.newValue) !== trimTheString(item.oldValue)
      )

      if (records?.length) {
        const isAppendData = editingItem?.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST

        if (image) await uploadImage(image, editingItem.id)
        await makeOverrideApiCall(records, isAppendData)

        if (isOverridesUser || isAppendData) {
          await refetchItem(editingItem.id)
        }
      }
    } catch (err) {
      setError(err)
    } finally {
      setEditingItem(undefined)
      setIsUpdating(false)
    }
  }

  // Effect
  React.useEffect(() => {
    if (rowId && isFirstRun) {
      const isFctStatusId = !!rowId?.includes(`status_`)
      const isJobTitle = !!rowId?.includes(`jobtitle_`)
      const requestId = isFctStatusId || isJobTitle ? (rowId?.split('_') || [])[1] : rowId
      let field = 'id' as keyof CompanyPeopleData
      field = isFctStatusId ? 'uuid' : 'id'
      field = isJobTitle ? 'jobTitleId' : 'id'
      const people = list.find(e => e[field] === requestId)
      if (!!overviewPendingRequest.length && people?.[field]) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(String(people?.[field] || '')))

          if (
            !viewPendingCQFn({
              tableName: TableNames.COMPANIES_PEOPLE,
              columnName: ColumnNames.FCT_STATUS_ID,
              rowId: people.companyPeopleId as string,
              source: people.source as string,
              companyId: +companyId,
            })
          ) {
            setEditingItem(people)
          }

          isFirstRun = false
        }, 0)
      }
    }
  }, [list, rowId, overviewPendingRequest, viewPendingCQFn, companyId])

  const uploadImage = async (file: LogoState, peopleId: string) => {
    const input = {
      peopleId,
      contentType: file.file.type,
      hashedImage: file.hash,
    }
    const res = await client.query<{ getSignedUrlForPeopleImage: string }>({
      query: GET_SIGN_URL_FOR_PEOPLE_IMAGE,
      variables: { input },
    })

    const signUrl = res.data.getSignedUrlForPeopleImage
    await putFileToS3(signUrl, file)
  }

  const handleAddPerson = async (form: IUseForm<PeopleFieldNames>, image?: LogoState) => {
    if (form.invalid()) return
    try {
      const values = form.getValue()
      const record = {
        name: `${values.name}`,
        gender: `${values.gender}`,
        imageUrl: `${values.imageUrl}`,
        hashedImage: image?.hash,
        facebook: `${values.facebook}`,
        linkedin: `${values.linkedin}`,
        twitter: `${values.twitter}`,
        jobTitle: `${values.jobTitle}`,
        description: `${values.description}`,
        numExits: `${values.numExits}`,
        numFoundedOrganizations: `${values.numFoundedOrganizations}`,
        emailAddress: values.emailAddress
      }
      const res = await makeAppendApiCall({
        companyId,
        records: [record],
      })
      if (image && res) await uploadImage(image, res.data.appendNewPeople.data)
      refetch()
      if (isOverridesUser) refetchViewHistoryCols()
      else refetchViewPendingChangeRequestCols()
      setEditingItem(undefined)
    } catch (err) {
      setError(err)
    }
  }

  const makeAppendApiCall = async (input: AppendPeopleInput) => {
    if (!checkTimeETL()) return
    return await appendPeople({
      variables: {
        input,
      },
    })
  }

  return (
    <>
      <CompanyFormsSectionLayout
        title={copy.title}
        isLoading={loading}
        error={error?.message}
        sectionSx={!loading ? { background: 'transparent', p: 0 } : {}}
      >
        <Flex sx={{ width: '100%', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            onPress={() => {
              if (!checkTimeETL()) return
              setEditingItem({} as CompanyPeopleData)
            }}
            label="+ Add Person"
          />
        </Flex>
        {list.map(item => {
          const isFollowing = +item.fctStatusId === +EnumExpandStatusId.FOLLOWING
          const isAppendCQ = +item.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST

          const overrideIdentity: GetCompanyOverrideInput = {
            tableName: TableNames.COMPANIES_PEOPLE,
            columnName: ColumnNames.FCT_STATUS_ID,
            companyId: +companyId,
            rowId: item.companyPeopleId as string,
            source: item.source as string,
          }

          const imageIden = {
            tableName: TableNames.PEOPLE,
            columnName: ColumnNames.HASHED_IMAGE,
            rowId: item.id,
            companyId,
            source: item.source,
          }
          return (
            <React.Fragment key={item.id}>
              <FinanceItemWrapper
                sx={{ mb: 5 }}
                pendingCR={overviewPendingRequest || []}
                buttons={[
                  {
                    label: 'Edit',
                    action: () => {
                      if (!checkTimeETL()) return
                      setPendingUpdateData({} as PendingUpdatePeopleState)
                      setEditingItem(item)
                    },
                    type: 'secondary',
                    isCancel: true,
                    disabled:
                      (!isFollowing && !isAppendCQ) ||
                      editCRDisabled(
                        findCQ(overviewPendingRequest, overrideIdentity)?.users || [],
                        user,
                        isAppendCQ
                      ),
                  },
                ]}
                isOverride={isOverridesUser}
                item={{
                  id: item.companyPeopleId || '',
                  tableName: TableNames.COMPANIES_PEOPLE,
                  expandStatus: `${item.fctStatusId}` as EnumExpandStatusId,
                  source: item.source,
                  selfDeclared: item.selfDeclared,
                }}
                unfollowItem={input => handleUnfollowItem(input, item)}
                label={
                  <Box>
                    <ViewOverrideButtons
                      sx={{ flexDirection: 'column', gap: 2, mb: 2 }}
                      viewHistory={viewHistoryFn(imageIden)}
                      viewPendingChangeRequest={viewPendingCQFn(imageIden)}
                      totalItemPendingCR={getNumPending(overviewPendingRequest, imageIden)}
                    />
                    <Flex sx={{ alignItems: 'center', gap: 3 }}>
                      <PeopleAvatar
                        state={[]}
                        image={item.imageUrl}
                        onChangeFile={async (image, reason) => {
                          if (!checkTimeETL()) return
                          await handleUpdateItem(
                            item,
                            {
                              ...pendingUpdateData,
                              hashed_image: {
                                id: item.id,
                                tableName: TableNames.PEOPLE,
                                columnName: ColumnNames.HASHED_IMAGE,
                                oldValue: item.hashedImage,
                                newValue: image.hash,
                                source: item.source,
                                companyId,
                                reason,
                              },
                            },
                            image
                          )
                        }}
                        isEdit={true}
                        isOverride={isOverridesUser}
                        disabled={
                          isUpdating ||
                          (!isFollowing && !isAppendCQ) ||
                          editCRDisabled(
                            findCQ(overviewPendingRequest, overrideIdentity)?.users || [],
                            user,
                            isAppendCQ
                          )
                        }
                      />
                      <Paragraph id={item.uuid} bold>
                        {item.name || ''}
                      </Paragraph>
                    </Flex>
                  </Box>
                }
                viewHistoryFn={iden => {
                  return viewHistoryFn({ ...iden, companyId: +companyId })
                }}
                viewPendingCQFn={iden => viewPendingCQFn({ ...iden, companyId: +companyId })}
                getNumPending={iden => getNumPending(overviewPendingRequest, iden)}
                handleAppendDataCQAction={handleAppendDataCQAction}
              >
                <RoundInfo info={item} />
              </FinanceItemWrapper>
            </React.Fragment>
          )
        })}
        <Pagination bg="white" />
      </CompanyFormsSectionLayout>

      <FooterCTAs
        buttons={[
          {
            label: strings.common.backToCompanyRecord,
            variant: 'outlineWhite',
            onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
          },
        ]}
      />

      {editingItem && (
        <Modal sx={{ p: 5, pr: 3, width: '60vw', maxWidth: '60vw', maxHeight: '80vh' }}>
          <Heading as="h4" center sx={{ width: '100%', mb: 4, fontWeight: 600 }}>
            {`${!!editingItem?.id ? 'Edit' : 'Add'} Information`}
          </Heading>
          <PeopleForm
            isEdit={!!editingItem?.id}
            defaultValue={editingItem}
            companyId={companyId}
            isOverride={isOverridesUser}
            pendingUpdateData={pendingUpdateData}
            setPendingUpdateData={setPendingUpdateData}
            viewHistoryFn={iden => viewHistoryFn({ ...iden, companyId: +companyId })}
            viewPendingCQFn={iden => viewPendingCQFn({ ...iden, companyId: +companyId })}
            getNumPending={iden => getNumPending(overviewPendingRequest, iden)}
            loading={isUpdating}
            buttonSx={{
              width: '100%',
              justifyContent: 'flex-end',
              mr: 3,
            }}
            buttons={[
              {
                type: 'secondary',
                label: strings.common.cancel,
                disabled: isUpdating,
                action: () => {
                  setEditingItem(undefined)
                },
              },
              {
                label: 'Save',
                type: 'primary',
                disabled: isUpdating,
                action: async (form, image) => {
                  if (editingItem.id) {
                    await handleUpdateItem(editingItem, pendingUpdateData, image)
                  } else {
                    if (!form.invalid()) await handleAddPerson(form, image)
                  }
                },
              },
            ]}
          />
        </Modal>
      )}

      <PendingCRModal />
    </>
  )
}

export default People

const ROUND_INFO_GRID = ['1fr 1fr 1fr 1fr 1fr']

const RoundInfo = ({ info }: { info: CompanyPeopleData }) => {
  return (
    <Grid
      sx={{
        bg: 'gray03',
        px: 4,
        py: 5,
        borderRadius: '10px',
        width: '100%',
        border: '1px solid',
        borderColor: 'gray01',
      }}
    >
      <Grid columns={ROUND_INFO_GRID}>
        {[
          { name: copy.fields.gender, value: info.gender },
          { name: copy.fields.jobTitle, value: info.jobTitle },
          { name: copy.fields.emailAddress, value: info.emailAddress },
          { name: copy.fields.facebook, value: info.facebook },
          { name: copy.fields.linkedin, value: info.linkedin },
          { name: copy.fields.twitter, value: info.twitter },
          { name: copy.fields.titleNames, value: info.titleNames?.join(',') },
          { name: copy.fields.titleTypeNames, value: info.titleTypeNames?.join(',') },
          { name: copy.fields.numExits, value: info.numExits },
          { name: copy.fields.numFoundedOrganizations, value: info.numFoundedOrganizations },
          { name: copy.fields.source, value: info.source },
          { name: copy.fields.description, value: info.description },
          { name: copy.fields.apiAppend, value: info.apiAppend },
        ].map((item, index) => (
          <Box
            key={index}
            mb={4}
            sx={{
              ...(item.name === copy.fields.description && !!info.description
                ? { gridColumnStart: 1, gridColumnEnd: 3 }
                : {}),
              wordBreak: 'break-word',
            }}
          >
            <Label mb={1}>{item.name}</Label>
            <Paragraph>{item.value?.toString() || ''}</Paragraph>
          </Box>
        ))}
      </Grid>
    </Grid>
  )
}
