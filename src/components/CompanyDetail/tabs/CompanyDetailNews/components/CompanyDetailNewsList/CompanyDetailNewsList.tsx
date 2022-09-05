import React from 'react'
import { Flex } from 'theme-ui'
import { INIT_FILTER_NEWS, NewsFilterType } from '../../../../../../pages/CompanyForm/News/helpers'
import NewsFilter from '../../../../../../pages/CompanyForm/News/NewsFilter'
import { NewsModel } from '../../../../../../pages/CompanyForm/NewsForm'
import { IPagination } from '../../../../../../types'
import { NewsList } from '../../../../../NewsList'
import Pagination from '../../../../../Pagination'
import { Paragraph } from '../../../../../primitives'

type Props = {
  isInternalCompany: boolean
  newsListData: NewsModel[]
  total: number
  pagination: IPagination
  currentFilter: NewsFilterType
  setCurrentFilter: Function
  gotoPage: Function
}

export default function CompanyDetailNewsList({
  isInternalCompany,
  newsListData,
  total,
  pagination,
  currentFilter,
  setCurrentFilter,
  gotoPage,
}: Props) {
  const changeFilter = (filter: NewsFilterType) => {
    setCurrentFilter(filter)
    gotoPage({ ...pagination, page: 1 }, filter)
  }

  const resetFilter = () => {
    setCurrentFilter(INIT_FILTER_NEWS)
    gotoPage({ ...pagination, page: 1 }, INIT_FILTER_NEWS)
  }

  return (
    <>
      {/* filter */}
      {isInternalCompany && (
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <NewsFilter
            resetFilter={resetFilter}
            changeFilter={changeFilter}
            filter={currentFilter}
          />
        </Flex>
      )}

      {/* news list */}
      {newsListData.length ? (
        <NewsList data={newsListData} />
      ) : (
        <Paragraph center>NO DATA AVAILABLE</Paragraph>
      )}

      <Pagination
        sx={{ justifyContent: 'center' }}
        hidePageButtons={!isInternalCompany}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={Math.ceil(total / pagination.pageSize)}
        changePage={page => {
          gotoPage({ ...pagination, page }, currentFilter)
        }}
        changePageSize={pageSize => {
          gotoPage({ page: 1, pageSize }, currentFilter)
        }}
      />
    </>
  )
}
