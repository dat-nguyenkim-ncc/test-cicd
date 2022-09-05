import { useQuery } from '@apollo/client'
import React from 'react'
import { Box } from 'theme-ui'
import { Updating } from '../../..'
import usePagination from '../../../../hooks/usePagination'
import { GET_COMPANY_INVESTMENTS } from '../../../../pages/CompanyForm/graphql'
import CompanyDetailFinancials from '../CompanyDetailFinancials'
import { CompanyDetailPeopleProps } from '../CompanyDetailPeople/CompanyDetailPeople'

const CompanyDetailInvestments = ({ data }: CompanyDetailPeopleProps) => {
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const { data: investmentsData, loading } = useQuery(GET_COMPANY_INVESTMENTS, {
    skip: !data?.companyId,
    variables: {
      id: data?.companyId,
      size: pagination.pageSize,
      page: pagination.page,
      showAll: false,
      showDetail: true,
    },
    onCompleted() {
      if (investmentsData?.getCompanyInvestments?.total !== total)
        setTotal(investmentsData?.getCompanyInvestments?.total || 0)
    },
  })

  if (loading) return <Updating loading />
  return (
    <Box sx={{ mt: 6, maxWidth: '100%' }}>
      <CompanyDetailFinancials
        data={investmentsData?.getCompanyInvestments?.investmentDetails || []}
        isInvestment={true}
      />
      <Pagination />
    </Box>
  )
}

export default CompanyDetailInvestments
