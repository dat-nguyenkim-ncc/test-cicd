import React, { useState, useCallback } from 'react'

import { Pagination } from '../components'
import { PaginationProps } from '../components/Pagination/Pagination'
import { IPagination } from '../types'

export default function usePagination({ gotoPageCallback = (pagination: IPagination) => {} }: any) {
  const [pagination, setPagination] = useState<IPagination>({ page: 1, pageSize: 10 })
  const [total, setTotal] = useState(0)

  const gotoPage = useCallback(
    (pagination: IPagination) => {
      const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
      setPagination(newPagination)
      gotoPageCallback(pagination)
    },
    [gotoPageCallback]
  )

  const Component = useCallback(
    (props: Partial<PaginationProps>) => (
      <Pagination
        {...props}
        sx={{ justifyContent: 'center' }}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={Math.ceil(total / pagination.pageSize)}
        changePage={page => gotoPage({ ...pagination, page })}
        changePageSize={pageSize => gotoPage({ page: 1, pageSize })}
      />
    ),
    [pagination, total, gotoPage]
  )

  return {
    Pagination: Component,
    total,
    setTotal,
    pagination,
  }
}
