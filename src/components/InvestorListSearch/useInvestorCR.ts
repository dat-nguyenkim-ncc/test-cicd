import { ColumnNames } from './../../pages/CompanyForm/helpers'
import { useApolloClient } from '@apollo/client'
import React from 'react'
import { IPengdingCQData } from '../PendingChangeRequest/PendingChangeRequest'
import {
  APPROVE_PENDING_REQUEST,
  DeclineChangeRequestInput,
  DECLINE_PENDING_REQUEST,
} from '../../pages/CompanyForm/graphql/pendingChangeRequests'
import { GetCompanyOverrideInput } from '../../types'

export type OpenConfirmMetadata = {
  isAppendData?: boolean
  isApprove: boolean
}

export type IShowPendingChangeRequest = (
  tableName: string,
  name: string,
  rowId: string,
  source?: string
) => boolean

export type IHandleActionPendingCRFn = (
  requestInfo: GetCompanyOverrideInput,
  changeRequests: IPengdingCQData[],
  rejectReason: string,
  isAprrove: boolean
) => Promise<void>

export type HandleAfterApproveData = {
  tableName: string
  columnName: string
  rowId: string
  newValue: string
  comment?: string
}

type Props = {
  refetch?(): void
}

export default function useInvestorCR({ refetch }: Props) {
  const client = useApolloClient()

  const [dataCR, setDataCR] = React.useState<IPengdingCQData[] | undefined>()
  const [approvedCR, setApprovedCR] = React.useState<IPengdingCQData | undefined>()
  const [rejectCR, setRejectCR] = React.useState<IPengdingCQData[] | undefined>()
  const [CRloading, setLoading] = React.useState<boolean>(false)

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

  const handleActionPendingCR = React.useCallback(
    async (
      requestInfo: GetCompanyOverrideInput,
      changeRequests: IPengdingCQData[] = [],
      rejectReason: string,
      isAprrove: boolean = false
    ) => {
      try {
        setLoading(true)
        if (isAprrove) {
          const changeRequest = changeRequests[0]
          if (changeRequest) {
            await approvePendingRequest({
              item: {
                tableName: changeRequest.tableName,
                columnName: changeRequest.columnName,
                reason: changeRequest.comment,
                oldValue: changeRequest.oldValue,
                newValue: changeRequest.newValue,
                companyId: -1,
                id: requestInfo.rowId,
                source: changeRequest.source,
                dataOverrideId: changeRequests[0].dataOverrideId,
              },
              reason: rejectReason,
            })
          }
          refetch && refetch()
        } else {
          await declinePendingCR(
            changeRequests.map(i => i.dataOverrideId),
            rejectReason
          )
          if (changeRequests.some(item => item.columnName === ColumnNames.FCT_STATUS_ID)) {
            refetch && refetch()
          }
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    [approvePendingRequest, declinePendingCR, refetch]
  )

  return {
    dataCR,
    setDataCR,
    CRloading,
    setLoading,
    approvedCR,
    setApprovedCR,
    rejectCR,
    setRejectCR,
    handleActionPendingCR,
  }
}
