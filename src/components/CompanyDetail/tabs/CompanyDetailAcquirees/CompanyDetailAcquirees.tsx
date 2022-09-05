import { useQuery } from '@apollo/client'
import React from 'react'
import { Box } from 'theme-ui'
import { Updating } from '../../..'
import usePagination from '../../../../hooks/usePagination'
import { GET_COMPANY_ACQUIREES_BY_ID } from '../../../../pages/CompanyForm/graphql'
import CompanyDetailAcquisitions from '../CompanyDetailAcquisitions'
import { CompanyDetailPeopleProps } from '../CompanyDetailPeople/CompanyDetailPeople'

const CompanyDetailAcquirees = ({ data }: CompanyDetailPeopleProps) => {
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const { data: acquireesData, loading } = useQuery(GET_COMPANY_ACQUIREES_BY_ID, {
    skip: !data?.companyId,
    variables: {
      companyId: data?.companyId,
      size: pagination.pageSize,
      page: pagination.page,
      showAll: false,
    },
    onCompleted() {
      if (acquireesData?.getCompanyAcquireesById?.total !== total)
        setTotal(acquireesData?.getCompanyAcquireesById?.total || 0)
    },
  })

  if (loading) return <Updating loading />
  return (
    <Box sx={{ mt: 6, maxWidth: '100%' }}>
      <CompanyDetailAcquisitions
        data={{
          acquisitionRounds: acquireesData?.getCompanyAcquireesById?.acquirees || [],
          isExternalViewDetail: false,
        }}
        isAcquirees
      />
      <Pagination />
    </Box>
  )
}

export default CompanyDetailAcquirees
