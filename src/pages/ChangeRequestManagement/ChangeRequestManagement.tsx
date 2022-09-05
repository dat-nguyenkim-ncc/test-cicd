import { useLazyQuery, useApolloClient, useMutation } from '@apollo/client'
import moment from 'moment'
import React, { FormEvent, useRef } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Divider, Flex } from 'theme-ui'
import { Modal, Pagination, Updating } from '../../components'
import ChangeRequestList from '../../components/ChangeRequestList'
import { isDateColumns } from '../../components/OverridesHistory/OverridesHistory'
import { IPengdingCQData } from '../../components/PendingChangeRequest/PendingChangeRequest'
import { Heading, Section } from '../../components/primitives'
import { FormOption, GetCompanyOverrideInput, IPagination, ISortBy } from '../../types'
import {
  APPROVE_PENDING_REQUEST,
  DeclineChangeRequestInput,
  DECLINE_PENDING_REQUEST,
} from '../CompanyForm/graphql/pendingChangeRequests'
import { PendingChangeRequestModal } from '../CompanyForm/pendingCRModal'
import { GET_ALL_CHANGE_REQUESTS } from './graphql'
import ListRequestEmpty from '../../components/ListRequetsEmpty'
import ChangeRequestFilters, { INIT_FILTER_BY } from './ChangeRequetFilters'
import { StateFilterBy } from './ChangeRequestFilter'
import { ESortFields } from './helpers'
import { useChangeRequestManagement } from './provider/ChangeRequestManagementProvider'
import { TableNames, transformPostDate } from '../CompanyForm/helpers'
import { APPROVE_REJECT_TAG_CHANGE_REQUESTS, getPendingCRgql } from '../CompanyForm/graphql'
import { ErrorModal } from '../../components/ErrorModal'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export type ChangeRequestResultType = {
  name: string
  columnName: string
  dataOverride: IPengdingCQData[]
}

export type FilterBy = {
  isSelfDeclared: string | boolean | null
}

const CompanyIdNATables = [
  TableNames.TECHNOLOGY_PROVIDER,
  TableNames.PEOPLE,
  TableNames.CURRENT_CLIENTS,
  TableNames.INVESTOR,
  TableNames.COMPANIES_PARTNERSHIPS,
]

const formatValue = (value: string, columnName: string) => {
  const date = moment(value).format(DEFAULT_VIEW_DATE_FORMAT)
  return isDateColumns(columnName) ? (date !== 'Invalid date' ? date : '') : value
}

type SortBy = ISortBy<ESortFields>

const sortByOptions: FormOption[] = [
  { label: 'Date', value: ESortFields.DATE },
  { label: 'Entity Name', value: ESortFields.COMPANY_NAME },
]

const ChangeRequestManagement = () => {
  const isFirstRun = useRef(true)
  const client = useApolloClient()

  const {
    searchText,
    setSearchText,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
  } = useChangeRequestManagement()
  const [filterVisible, setFilterVisible] = React.useState(false)
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })

  const [approvedCR, setApprovedCR] = useState<IPengdingCQData | undefined>()
  const [rejectCR, setRejectCR] = useState<IPengdingCQData[] | undefined>()
  const [modalData, setModalData] = useState<IPengdingCQData[]>([])
  const [updating, setUpdating] = useState<boolean>(false)
  const [crData, setCRData] = useState<ChangeRequestResultType[]>()
  const [getting, setGetting] = useState<boolean>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const [approveRejectTagCRs] = useMutation(APPROVE_REJECT_TAG_CHANGE_REQUESTS)

  const [getData, { data, loading }] = useLazyQuery(GET_ALL_CHANGE_REQUESTS, {
    fetchPolicy: 'network-only',
    onCompleted() {
      setCRData(
        data?.getAllChangeRequests.data?.map((cr: ChangeRequestResultType) => ({
          ...cr,
          dataOverride: cr.dataOverride.map(item => ({
            ...item,
            oldValue: formatValue(item.oldValue, cr.columnName),
            newValue: formatValue(item.newValue, cr.columnName),
          })),
        })) || []
      )
    },
  })

  const refetchAPI = (
    newSortBy: SortBy = sortBy,
    _newFilterBy: StateFilterBy = filterBy,
    newPagination: IPagination = pagination,
    keyword: string | undefined = searchText
  ) => {
    const newFilterBy = { ..._newFilterBy } as FilterBy
    if (_newFilterBy.isSelfDeclared === '') {
      newFilterBy.isSelfDeclared = null
    } else {
      newFilterBy.isSelfDeclared = JSON.parse(_newFilterBy.isSelfDeclared)
    }
    getData({
      variables: { input: { sortBy: newSortBy, filterBy: newFilterBy, ...newPagination, keyword } },
    })
  }

  const resetFilter = (): void => {
    setFilterBy(INIT_FILTER_BY)
    setFilterVisible(false)
    gotoPage({ ...pagination, page: 1 }, sortBy, INIT_FILTER_BY)
  }
  const applyFilter = (_filterBy: StateFilterBy): void => {
    setFilterVisible(false)
    gotoPage({ ...pagination, page: 1 }, sortBy, _filterBy || filterBy)
  }
  const approvePendingRequest = React.useCallback(
    async input => {
      await client.mutate({ mutation: APPROVE_PENDING_REQUEST, variables: { input } })
    },
    [client]
  )
  const declinePendingCR = React.useCallback(
    async (dataOverrideIds: number[], rejectReason: string) => {
      await client.mutate<any, { input: DeclineChangeRequestInput }>({
        mutation: DECLINE_PENDING_REQUEST,
        variables: {
          input: {
            dataOverrideIds,
            reason: rejectReason,
          },
        },
      })
    },
    [client]
  )

  useEffect(() => {
    if (isFirstRun.current) {
      refetchAPI()
      isFirstRun.current = false
    }
  })

  const gotoPage = (pagination: IPagination, sortBy: SortBy, filterBy: StateFilterBy) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    setSortBy(sortBy)
    setFilterBy(filterBy)
    refetchAPI(sortBy, filterBy, newPagination)
  }

  const onChangeSearch = (search: string) => {
    setSearchText(search)
  }

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    gotoPage({ ...pagination, page: 1 }, sortBy, filterBy)
  }

  const handleActionPendingCR = React.useCallback(
    async (
      requestInfo: GetCompanyOverrideInput,
      changeRequests: IPengdingCQData[] = [],
      rejectReason: string,
      isAprrove: boolean = false
    ) => {
      try {
        setUpdating(true)
        if (isAprrove) {
          const changeRequest = changeRequests[0]
          if (changeRequest) {
            const isDate = isDateColumns(changeRequest.columnName)
            if (changeRequest.tableName === TableNames.COMPANIES_TAGS) {
              await approveRejectTagCRs({
                variables: {
                  companyId: +changeRequest.companyId,
                  approve: [changeRequest.dataOverrideId],
                  reject: [],
                  reason: rejectReason,
                },
              })
            } else {
              await approvePendingRequest({
                item: {
                  tableName: changeRequest.tableName,
                  columnName: changeRequest.columnName,
                  reason: changeRequest.comment,
                  oldValue:
                    isDate && changeRequest.oldValue
                      ? transformPostDate(changeRequest.oldValue)
                      : changeRequest.oldValue,
                  newValue:
                    isDate && changeRequest.newValue
                      ? transformPostDate(changeRequest.newValue)
                      : changeRequest.newValue,
                  companyId:
                    changeRequest.tableName === TableNames.INVESTOR ? -1 : changeRequest.companyId,
                  id: requestInfo.rowId,
                  source: changeRequest.source,
                  dataOverrideId: changeRequests[0].dataOverrideId,
                },
                reason: rejectReason,
              })
            }
          }
        } else {
          if (changeRequests[0].tableName === TableNames.COMPANIES_TAGS) {
            await approveRejectTagCRs({
              variables: {
                companyId: +changeRequests[0].companyId,
                approve: [],
                reject: changeRequests.map(i => i.dataOverrideId),
                reason: rejectReason,
              },
            })
          } else {
            await declinePendingCR(
              changeRequests.map(i => i.dataOverrideId),
              rejectReason
            )
          }
        }
        setUpdating(false)
      } catch (error) {
        setUpdating(false)
        throw error
      }
    },
    [approvePendingRequest, declinePendingCR, approveRejectTagCRs]
  )

  const onSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const names = {
      sortByDirection: 'direction',
      sortByField: 'field',
    }
    const name = names[e.currentTarget.name as keyof typeof names]
    if (name) {
      const newSortBy = { ...sortBy, [name]: e.currentTarget.value as ESortFields }
      gotoPage({ ...pagination, page: 1 }, newSortBy, filterBy)
    }
  }

  const onHandleApprovedRejected = async (state: IPengdingCQData[], isApproved: boolean) => {
    try {
      setGetting(true)
      const itemPending = (() => {
        if (CompanyIdNATables.includes(state[0].tableName)) {
          return { ...state[0], companyId: -1 }
        }
        return state[0]
      })()
      const { data } = await client.query<{
        getCompanyPendingChangeRequest: IPengdingCQData[]
      }>({
        query: getPendingCRgql,
        variables: {
          input: {
            columnName: itemPending.columnName,
            tableName: itemPending.tableName,
            rowId: itemPending.rowId,
            source: itemPending.source,
            companyId: itemPending.companyId,
          },
        },
        fetchPolicy: 'network-only',
      })
      const pendingCRData: IPengdingCQData[] = data?.getCompanyPendingChangeRequest || []

      setModalData(pendingCRData)
      const rejectState = pendingCRData.filter(
        ({ dataOverrideId }) => dataOverrideId !== itemPending.dataOverrideId
      )
      setRejectCR(isApproved ? rejectState : state)
      setApprovedCR(isApproved ? itemPending : undefined)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setGetting(false)
    }
  }

  return (
    <>
      <Section sx={{ mt: 5, p: 5, maxWidth: '100%' }}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h4" sx={{ fontWeight: 'bold' }}>
            {`${data?.getAllChangeRequests?.totalCR || 0} Pending Requests`}
          </Heading>
        </Flex>
        <Divider opacity={0.3} my={5} />

        <ChangeRequestFilters
          searchValue={searchText || ''}
          onSearch={onSearch}
          onSearchChange={onChangeSearch}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          loading={loading}
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          resetFilter={resetFilter}
          applyFilter={applyFilter}
          sortByOptionsProps={sortByOptions}
          placeholder={'Search Entity Name'}
        />
        {loading ? (
          <Updating sx={{ py: 6 }} loading />
        ) : (
          <>
            {!crData?.length ? (
              <ListRequestEmpty />
            ) : (
              <ChangeRequestList
                data={crData || []}
                setApprovedCR={state => {
                  onHandleApprovedRejected([state], true)
                }}
                setRejectCR={state => {
                  onHandleApprovedRejected(state, false)
                }}
              />
            )}
            {data?.getAllChangeRequests.total && (
              <Pagination
                sx={{ justifyContent: 'center' }}
                currentPage={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={Math.ceil(data?.getAllChangeRequests.total / pagination.pageSize)}
                changePage={page => {
                  gotoPage({ ...pagination, page }, sortBy, filterBy)
                }}
                changePageSize={pageSize => {
                  gotoPage({ page: 1, pageSize }, sortBy, filterBy)
                }}
              />
            )}
          </>
        )}
      </Section>
      {(approvedCR || rejectCR) && (
        <PendingChangeRequestModal
          data={modalData}
          loading={loading || updating}
          setIsSaving={() => {}}
          setError={() => {}}
          isSaving={false}
          onPressOK={async (refetch: boolean) => {
            setApprovedCR(undefined)
            setRejectCR(undefined)
            if (refetch) {
              const newPagination = {
                ...pagination,
                page:
                  crData && crData.length > 1
                    ? pagination.page
                    : pagination.page - 1 > 0
                    ? pagination.page - 1
                    : 1,
              }
              gotoPage(newPagination, sortBy, filterBy)
            }
          }}
          handleApproveUpdateNewData={() => {}}
          handleActionPendingCR={handleActionPendingCR}
          approvedCR={approvedCR}
          rejectCR={rejectCR}
        />
      )}
      {getting && (
        <Modal sx={{ m: 20, minWidth: 500 }}>
          <Updating sx={{ py: 6 }} loading />
        </Modal>
      )}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onOK={() => {
            setErrorMessage(undefined)
          }}
        />
      )}
    </>
  )
}

export default ChangeRequestManagement
