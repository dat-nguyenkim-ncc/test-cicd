import { gql } from '@apollo/client'

export const REJECT_TAXONOMY_CHANGE_REQUESTS = gql`
  mutation RejectTaxonomyChangeRequests($dataOverrideIds: [Int!]!, $reason: String!) {
    rejectTaxonomyChangeRequests(dataOverrideIds: $dataOverrideIds, reason: $reason)
  }
`

export type MutationRejectTaxonomyChangeRequestsArgs = {
  dataOverrideIds: number[]
  reason: string
}
