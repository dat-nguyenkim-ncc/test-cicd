import { gql } from '@apollo/client'

export default gql`
  query getPendingCR($input: GetCompanyOverrideInput!) {
    getCompanyPendingChangeRequest(input: $input) {
      tableName
      columnName
      oldValue
      newValue
      date
      user
      source
      comment
      changeRequest
      selfDeclared
      inputSource
      dataOverrideId
      rowId
      companyId
      isFile
    }
  }
`

export const GET_PENDING_CR_BY_ID = gql`
  query getPendingCRByCompanyId($companyId: Int!) {
    getPendingCRByCompanyId(companyId: $companyId) {
      tableName
      columnName
      rowId
      source
      dataOverrideId
      selfDeclared
      inputSource
      total
      users
      companyId
    }
  }
`

export type DeclineChangeRequestInput = {
  dataOverrideIds: number[]
  reason: string
}

export const DECLINE_PENDING_REQUEST = gql`
  mutation declineChangeRequest($input: DeclineChangeRequestInput!) {
    declineChangeRequest(input: $input)
  }
`

export const APPROVE_PENDING_REQUEST = gql`
  mutation approvePendingChangeRequest($input: ApprovePendingChangeRequestInput!) {
    approvePendingChangeRequest(input: $input)
  }
`
