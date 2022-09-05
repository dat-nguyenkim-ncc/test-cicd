import { useQuery } from '@apollo/client'
import React from 'react'
import { Box } from 'theme-ui'
import { GET_COMPANY_PARTNERSHIPS } from '../../../../pages/CompanyForm/graphql'
import { CompanyPeople, IPagination } from '../../../../types'
import Pagination from '../../../Pagination'
import PartnersList from '../../../PartnersList'
import { PartnershipsList } from '../../../PartnershipsList'
import Updating from '../../../Updating'

type Props = {
  data: CompanyPeople
}

export default function CompanyDetailPartnerships(props: Props) {
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })

  const { data, loading, refetch } = useQuery(GET_COMPANY_PARTNERSHIPS, {
    skip: !props.data?.companyId,
    variables: {
      companyId: props.data.companyId,
      pageSize: pagination.pageSize,
      page: pagination.page,
      activeOnly: true,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  })

  const gotoPage = (p: IPagination) => {
    const newPagination = { ...p, page: p.page < 1 ? 1 : p.page }
    setPagination(newPagination)

    if (!props.data.companyId) {
      refetch({
        companyId: props.data.companyId,
        page: p.page,
        pageSize: p.pageSize,
      })
    }
  }

  if (loading) return <Updating loading />
  return (
    <Box mt={6}>
      {!!data?.getCompanyPartnerships.total && (
        <>
          <PartnersList data={data.getCompanyPartnerships.partners} />
          <PartnershipsList data={data.getCompanyPartnerships.data} />
          <Pagination
            sx={{ justifyContent: 'center' }}
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={Math.ceil(data.getCompanyPartnerships.total / pagination.pageSize)}
            changePage={page => {
              gotoPage({ ...pagination, page })
            }}
            changePageSize={pageSize => {
              gotoPage({ page: 1, pageSize })
            }}
          />
        </>
      )}
    </Box>
  )
}
