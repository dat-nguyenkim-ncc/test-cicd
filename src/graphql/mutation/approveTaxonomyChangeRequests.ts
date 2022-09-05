import { gql } from '@apollo/client'

export const APPROVE_TAXONOMY_CHANGE_REQUESTS = gql`
  mutation ApproveTaxonomyChangeRequests($dataOverrideIds: [Int!]!, $reason: String!) {
    approveTaxonomyChangeRequests(dataOverrideIds: $dataOverrideIds, reason: $reason)
  }
`

export type MutationApproveTaxonomyChangeRequestsArgs = {
  dataOverrideIds: number[]
  reason: string
}
