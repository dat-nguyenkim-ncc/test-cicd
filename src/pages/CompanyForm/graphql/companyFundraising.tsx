import React from 'react'
import { useApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import { Fragments } from '.'
import { PaginationResult2 } from '../../../types'

export const GET_COMPANY_FUNDRAISING = gql`
  query GET_COMPANY_FUNDRAISING($companyId: Int!, $size: Int, $page: Int, $activeOnly: Boolean) {
    getCompanyFundraising(
      companyId: $companyId
      size: $size
      page: $page
      activeOnly: $activeOnly
    ) {
      # total
      # page
      # size
      result {
        ...CompanyFundraising
      }
    }
  }
  ${Fragments.companyFundraising}
`

export const APPEND_COMPANY_FUNDRAISING = gql`
  mutation APPEND_COMPANY_FUNDRAISING($input: AppendFundraisingInput!) {
    appendNewFundraising(input: $input) {
      data
    }
  }
`

export const GET_FUNDRAISING_BY_ID = gql`
  query GET_FUNDRAISING_BY_ID($id: String!) {
    getFundraisingById(id: $id) {
      ...CompanyFundraising
    }
  }
  ${Fragments.companyFundraising}
`

export type GetFundraisingByIdResult = {
  getFundraisingById: CompanyFundraisingData
}

export type AppendCompanyFundraisingVars = {
  input: AppendFundraisingInput
}

export type DataStringResult = {
  data: String
}

export type AppendFundraisingInput = {
  company_id: number
  fundraisings: Array<{
    // pitchDeckBucketKey: string
    // isFundraising: string
    // proceedsUtilization: string
    // investorRelationsContact: string
    pitch_deck_bucket_key?: string
    is_fundraising?: boolean
    proceeds_utilization?: string
    investor_relations_contact?: string
  }>
}

type ReadonlyFields = Readonly<{
  id: string
  source: string
  selfDeclared: boolean
}>

export type CompanyFundraisingData = {
  pitchDeckBucketKey: string
  isFundraising: number
  proceedsUtilization: string
  investorRelationsContact: string
  fctStatusId: number
} & ReadonlyFields

export type GetCompanyFundraisingResult = {
  getCompanyFundraising: PaginationResult2<CompanyFundraisingData> | null | undefined
}

export type GetCompanyFundraisingVariables = {
  companyId: number
  page: number
  size: number
  activeOnly?: boolean
}

export const useCRUDCompanyFundraising = () => {
  const client = useApolloClient()
  const update = React.useCallback(
    (id: string, data: Partial<Omit<CompanyFundraisingData, keyof ReadonlyFields>>) => {
      client.writeFragment({
        id: `CompanyFundraisingData:${id}`,
        fragment: gql`
          fragment Fundraising on CompanyFundraisingData {
            ${Object.keys(data).join('\n')}
          }
        `,
        data: data,
      })
    },
    [client]
  )
  return { update }
}
