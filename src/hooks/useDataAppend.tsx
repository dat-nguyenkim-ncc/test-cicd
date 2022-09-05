import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'

export type ApproveDataAppendInput = {
  id: number
}

export type RejectDataAppendInput = {
  ids: number[]
  reason: string
}

export const APPROVE_DATA_APPEND = gql`
  mutation ApproveDataAppend($input: ApproveDataAppendInput!) {
    approveDataAppend(input: $input)
  }
`

export const REJECT_DATA_APPEND = gql`
  mutation RejectDataAppend($input: RejectDataAppendInput!) {
    rejectDataAppend(input: $input)
  }
`

export default function useDataAppend() {
  const [approveDataAppend, { loading: approveLoading }] = useMutation<
    number[],
    { input: ApproveDataAppendInput }
  >(APPROVE_DATA_APPEND)

  const [rejectDataAppend, { loading: rejectLoading }] = useMutation<
    number[],
    { input: RejectDataAppendInput }
  >(REJECT_DATA_APPEND)

  return {
    approveDataAppend: async (input: ApproveDataAppendInput) => {
      await approveDataAppend({ variables: { input } })
    },
    rejectDataAppend: async (input: RejectDataAppendInput) => {
      await rejectDataAppend({ variables: { input } })
    },
    loading: approveLoading || rejectLoading,
  }
}
