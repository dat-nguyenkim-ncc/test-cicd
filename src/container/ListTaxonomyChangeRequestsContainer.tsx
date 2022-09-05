import { useMutation, useQuery } from '@apollo/client'
import { Box, Divider, Flex, Heading as TUHeading } from '@theme-ui/components'
import { uniq } from 'lodash'
import React from 'react'
import { Button, Message, Modal, ReasonTextField, Updating } from '../components'
import { Heading } from '../components/primitives'
import ListTaxonomyChangeRequests, {
  TaxonomyChangeRequestTable,
} from '../components/TaxonomyChangeRequests/ListTaxonomyChangeRequests'
import { UserContext } from '../context'
import {
  APPROVE_TAXONOMY_CHANGE_REQUESTS,
  MutationApproveTaxonomyChangeRequestsArgs,
} from '../graphql/mutation/approveTaxonomyChangeRequests'
import {
  MutationRejectTaxonomyChangeRequestsArgs,
  REJECT_TAXONOMY_CHANGE_REQUESTS,
} from '../graphql/mutation/rejectTaxonomyChangeRequests'
import {
  GetAllTaxonomyChangeRequestsResult,
  GET_ALL_TAXONOMY_CHANGE_REQUESTS,
  QueryGetAllTaxonomyChangeRequestsArgs,
  TaxonomyChangeRequest,
} from '../graphql/query/getAllTaxonomyChangeRequets'
import strings from '../strings'
import { ViewInterface } from '../types'

type ModalData = TaxonomyChangeRequest & { isApprove?: boolean }

type Props = ViewInterface<QueryGetAllTaxonomyChangeRequestsArgs> & {
  afterMutationCb?(isApprove?: boolean): void | Promise<void>
  showTotal?: boolean
  FilterComponent?: React.ReactElement
  alwayShowBtns?: boolean
  disableRedirect?: boolean
}

const ListTaxonomyChangeRequestsContainer = ({
  companyIds = [],
  sx,
  sortBy,
  filterBy,
  keyword,
  users = [],
  afterMutationCb = () => {},
  showTotal = false,
  FilterComponent,
  alwayShowBtns = false,
  disableRedirect,
}: Props) => {
  const { user } = React.useContext(UserContext)

  const { data: queryRes, loading, error, refetch } = useQuery<
    GetAllTaxonomyChangeRequestsResult,
    QueryGetAllTaxonomyChangeRequestsArgs
  >(GET_ALL_TAXONOMY_CHANGE_REQUESTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      companyIds,
      sortBy,
      keyword: keyword?.trim(),
      filterBy,
      users,
    },
  })
  const data = queryRes?.getAllTaxonomyChangeRequests || []

  const [approve, { loading: approveLoading }] = useMutation<
    boolean,
    MutationApproveTaxonomyChangeRequestsArgs
  >(APPROVE_TAXONOMY_CHANGE_REQUESTS)

  const [reject, { loading: rejectLoading }] = useMutation<
    boolean,
    MutationRejectTaxonomyChangeRequestsArgs
  >(REJECT_TAXONOMY_CHANGE_REQUESTS)

  const [rejectReason, setRejectReason] = React.useState('')
  const [confirmModal, setConfirmModal] = React.useState<{
    open: boolean
    data: ModalData[]
  }>({
    open: false,
    data: [],
  })

  const handleApprove = (rows: TaxonomyChangeRequest[]) => {
    const rejects: ModalData[] = data
      .filter(
        i =>
          rows.some(i1 => i1.companyId === i.companyId) &&
          !rows.some(i1 => i1.dataOverrideId === i.dataOverrideId)
      )
      .map(i => ({ ...i, isApprove: false }))

    setConfirmModal({
      open: true,
      data: [...rejects, ...rows.map(i => ({ ...i, isApprove: true }))],
    })
  }

  const handleReject = (rows: TaxonomyChangeRequest[]) => {
    setConfirmModal({ open: true, data: rows.map(i => ({ ...i, isApprove: false })) })
  }

  const handleMutation = async (rows: ModalData[], reason: string) => {
    const approveIds = rows.filter(r => !!r.isApprove).map(r => r.dataOverrideId)
    const rejectIds = rows.filter(r => !r.isApprove).map(r => r.dataOverrideId)
    try {
      if (approveIds.length) {
        await approve({ variables: { dataOverrideIds: approveIds, reason } })
        afterMutationCb(true)
      } else if (rejectIds.length) {
        await reject({ variables: { dataOverrideIds: rejectIds, reason } })
        afterMutationCb(false)
      }

      setConfirmModal({ open: false, data: [] })
      setRejectReason('')
      refetch()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {showTotal && (
        <>
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading as="h4" sx={{ fontWeight: 'bold' }}>
              {`${uniq((data || []).map(d => d.linkId)).length || 0} Pending Requests`}
            </Heading>
          </Flex>
          <Divider opacity={0.3} my={5} />
        </>
      )}
      {FilterComponent && FilterComponent}
      {error ? (
        <Message
          variant="alert"
          body="Failed to fetch"
          sx={{ width: '100%', justifyContent: 'center' }}
        />
      ) : (
        <ListTaxonomyChangeRequests
          data={data}
          loading={loading}
          handleApprove={handleApprove}
          handleReject={handleReject}
          sx={sx}
          user={user}
          alwayShowBtns={alwayShowBtns}
          disableRedirect={disableRedirect}
        />
      )}

      {confirmModal.open && (
        <Modal
          sx={{
            p: 5,
            pr: 12,
            maxWidth: '70vw',
            alignItems: 'flex-start',
            minWidth: '900px',
            position: 'relative',
          }}
        >
          <TUHeading sx={{ fontWeight: 600, mb: 4, flex: 11 }} as={'h2'}>
            Confirmation
          </TUHeading>

          <Box sx={{ maxHeight: '60vh', overflow: 'auto', width: '100%', pr: 12 }}>
            <RequestList
              title={strings.approvedRequests}
              data={confirmModal.data.filter(i => i.isApprove)}
              disableRedirect={disableRedirect}
            />
            <RequestList
              title={strings.rejectedRequests}
              data={confirmModal.data.filter(i => !i.isApprove)}
              disableRedirect={disableRedirect}
            />
            {!!confirmModal.data.filter(i => !i.isApprove).length && (
              <ReasonTextField
                sx={{ mt: 12 }}
                reason={rejectReason}
                setReason={setRejectReason}
                label="Enter the reason to reject"
                required
              />
            )}
          </Box>
          <Flex sx={{ justifyContent: 'flex-end', flex: 1, width: '100%', mt: 24 }}>
            <Button
              onPress={() => {
                setConfirmModal({ open: false, data: [] })
                setRejectReason('')
              }}
              variant="secondary"
              label="Cancel"
              sx={{ p: '10px 60px' }}
            />
            <Button
              onPress={() => handleMutation(confirmModal.data, rejectReason)}
              label="Confirm"
              sx={{ p: '10px 60px' }}
              disabled={!!confirmModal.data.filter(i => !i.isApprove).length && !rejectReason}
            />
          </Flex>
        </Modal>
      )}

      {(approveLoading || rejectLoading) && (
        <Modal sx={{ minWidth: 500 }}>
          <Updating loading sx={{ p: 0, borderRadius: '10px' }} />
        </Modal>
      )}
    </>
  )
}

export default ListTaxonomyChangeRequestsContainer

const RequestList = ({
  title,
  data,
  disableRedirect,
}: {
  title: string
  data: ModalData[]
  disableRedirect?: boolean
}) => {
  if (!data.length) return null
  return (
    <>
      <TUHeading sx={{ fontWeight: 600, mb: 2, mt: 2, flex: 11 }} as={'h4'}>
        {title}
      </TUHeading>
      <TaxonomyChangeRequestTable data={data} gap={0} disableRedirect={disableRedirect} />
    </>
  )
}
