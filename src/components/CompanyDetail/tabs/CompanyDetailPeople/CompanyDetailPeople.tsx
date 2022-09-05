import React, { useEffect } from 'react'
import { Box } from 'theme-ui'
import { CompanyPeople } from '../../../../types'
import usePagination from '../../../../hooks/usePagination'
import { useQuery } from '@apollo/client'
import {
  GetCompanyPeopleResult,
  GetCompanyPeopleVariables,
  GET_COMPANY_PEOPLE,
} from '../../../../pages/CompanyForm/graphql/companyPeople'
import Updating from '../../../Updating'
import TwoColumnsList from '../../../TwoColumnsList/TwoColumnsList'

export type CompanyDetailPeopleProps = {
  data: CompanyPeople
}

const CompanyDetailPeople = ({ data }: CompanyDetailPeopleProps) => {
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const { data: peopleData, loading } = useQuery<GetCompanyPeopleResult, GetCompanyPeopleVariables>(
    GET_COMPANY_PEOPLE,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      skip: !data?.companyId,
      variables: {
        companyId: data?.companyId,
        take: pagination.pageSize,
        skip: pagination.pageSize * (pagination.page - 1),
        activeOnly: true,
      },
    }
  )

  useEffect(() => {
    if (peopleData?.getCompanyPeople?.total !== total)
      setTotal(peopleData?.getCompanyPeople?.total || 0)
  }, [peopleData, total, setTotal])

  const people = peopleData?.getCompanyPeople?.result || []

  if (loading) return <Updating loading />
  return (
    <Box sx={{ mt: 6, maxWidth: '100%' }}>
      <TwoColumnsList list={people} />
      <Pagination />
    </Box>
  )
}

export default CompanyDetailPeople
