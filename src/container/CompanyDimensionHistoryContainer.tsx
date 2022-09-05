import React from 'react'
import { useQuery } from '@apollo/client'
import {
  GetCompanyDimensionsOverridesHistoryResult,
  GET_COMPANY_DIMENSIONS_OVERRIDES_HISTORY,
  QueryGetCompanyDimensionsOverridesHistoryArgs,
} from '../graphql/query/getCompanyDimensionsOverridesHistory'
import { EnumCompanyTypeSector } from '../types/enums'
import CompanyDimensionHistory from '../components/CompanyDimensionsHistory'
import { Message } from '../components'
import {
  CompanyDimensionHistoryProps,
  EViewBy,
} from '../components/CompanyDimensionsHistory/CompanyDimensionsHistory'

type Props = {
  companyId: number
  category?: EnumCompanyTypeSector
  isPrimary?: boolean
  dimension?: number
  ids?: number[]
} & Partial<Pick<CompanyDimensionHistoryProps, 'viewBy'>>

const CompanyDimensionHistoryContainer = ({
  companyId,
  category,
  isPrimary,
  ids,
  dimension,
  viewBy,
}: Props) => {
  const { data: queryRes, loading, error } = useQuery<
    GetCompanyDimensionsOverridesHistoryResult,
    QueryGetCompanyDimensionsOverridesHistoryArgs
  >(GET_COMPANY_DIMENSIONS_OVERRIDES_HISTORY, {
    variables: { category, companyId, isPrimary, ids },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  })

  const data = (queryRes?.getCompanyDimensionsOverridesHistory || []).filter(
    d => !dimension || d.dimension === dimension
  )
  if (error) {
    return <Message variant="alert" body={error.message}></Message>
  }
  return (
    <CompanyDimensionHistory data={data} loading={loading} viewBy={viewBy || EViewBy.DEFAULT} />
  )
}

export default CompanyDimensionHistoryContainer
