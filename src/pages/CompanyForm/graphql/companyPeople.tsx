import React from 'react'
import { useApolloClient } from '@apollo/client'
import gql from 'graphql-tag'
import { Fragments } from '.'
import { PaginationResult } from '../../../types'

export const GET_COMPANY_PEOPLE = gql`
  query GET_COMPANY_PEOPLE(
    $companyId: Int!
    $take: Int
    $skip: Int
    $activeOnly: Boolean
    $rowId: String
  ) {
    getCompanyPeople(
      companyId: $companyId
      take: $take
      skip: $skip
      activeOnly: $activeOnly
      rowId: $rowId
    ) {
      total
      skip
      take
      result {
        ...CompanyPeople
      }
    }
  }
  ${Fragments.companyPeople}
`

export const APPEND_COMPANY_PEOPLE = gql`
  mutation APPEND_COMPANY_PEOPLE($input: AppendPeopleInput!) {
    appendNewPeople(input: $input) {
      data
    }
  }
`

export const GET_PEOPLE_BY_ID = gql`
  query GET_PEOPLE_BY_ID($id: String!) {
    getPeopleById(id: $id) {
      ...CompanyPeople
    }
  }
  ${Fragments.companyPeople}
`

export type GetPeopleByIdResult = {
  getPeopleById: CompanyPeopleData
}

export type AppendCompanyPeopleVars = {
  input: AppendPeopleInput
}

export type DataStringResult = {
  data: String
}

export type AppendPeopleInput = {
  companyId: number
  records: Array<{
    name: string
    gender: string
    imageUrl: string
    facebook: string
    linkedin: string
    twitter: string
    jobTitle: string
    description: string
    numExits: string
    numFoundedOrganizations: string
  }>
}

type ReadonlyFields = Readonly<{
  id: string
  jobTitleId: string
  uuid: string
  companyPeopleId: string
  apiAppend: string
  titleNames: string[]
  titleTypeNames: string[]
}>

export type CompanyPeopleData = {
  source: string
  uuid: string
  name: string
  gender: string
  imageUrl: string
  hashedImage: string
  facebook: string
  linkedin: string
  twitter: string
  jobTitle: string
  numExits: string
  description: string
  numFoundedOrganizations: string
  sourceUpdated: string
  fctStatusId: number
  selfDeclared: boolean
  emailAddress: string
} & ReadonlyFields

export type GetCompanyPeopleResult = {
  getCompanyPeople: PaginationResult<CompanyPeopleData> | null | undefined
}

export type GetCompanyPeopleVariables = {
  companyId: number
  take: number
  skip: number
  activeOnly?: boolean
  rowId?: string
}

export const useCRUDCompanyPeople = () => {
  const client = useApolloClient()
  const update = React.useCallback(
    (id: string, data: Partial<Omit<CompanyPeopleData, keyof ReadonlyFields>>) => {
      client.writeFragment({
        id: `CompanyPeopleData:${id}`,
        fragment: gql`
          fragment People on CompanyPeopleData {
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
