import { useQuery } from '@apollo/client'
import React from 'react'
import { Box } from 'theme-ui'
import { GET_COMPANY_NEWS, GET_EXTERNAL_COMPANY_NEWS } from '../../../../pages/CompanyForm/graphql'
import {
  convertToInput,
  INIT_FILTER_NEWS,
  NewsFilterType,
} from '../../../../pages/CompanyForm/News/helpers'
import { NewsModel } from '../../../../pages/CompanyForm/NewsForm'
import { IPagination, TagNewsData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import Updating from '../../../Updating'
import { SentimentChart, CompanyDetailNewsList } from './components'
import { CompanyNewsChartResult, GET_COMPANY_NEWS_CHART } from './components/SentimentChart'

type Props = {
  data: TagNewsData
}

const NEWS_AVAILABLE_INIT_VALUE: number = -1

export default function CompanyDetailNews(props: Props) {
  const [currentFilter, setCurrentFilter] = React.useState<NewsFilterType>(INIT_FILTER_NEWS)
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })

  const isNewsAvailable = React.useRef(NEWS_AVAILABLE_INIT_VALUE)

  const { data: chartData, loading: chartLoading } = useQuery(GET_COMPANY_NEWS_CHART, {
    variables: { companyId: +props.data.companyId },
    fetchPolicy: 'network-only',
  })

  const {
    data: newsInternalData,
    loading: newsInternalLoading,
    refetch: newsInternalRefetch,
  } = useQuery(GET_COMPANY_NEWS, {
    skip: !+props.data?.companyId || !props.data.isInternalCompany,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      companyId: +props.data.companyId,
      take: pagination.pageSize,
      skip: (pagination.page - 1) * pagination.pageSize,
      activeOnly: true,
      filterInput: convertToInput({ ...currentFilter, title: currentFilter.title.trim() }),
    },
  })

  const {
    data: newsExternalData,
    loading: newsExternalLoading,
    refetch: newsExternalRefetch,
    networkStatus,
  } = useQuery(GET_EXTERNAL_COMPANY_NEWS, {
    skip: !props.data?.companyId || props.data.isInternalCompany,
    variables: {
      companyId: props.data.companyId,
      source: props.data.source,
      limit: pagination.pageSize,
    },
    notifyOnNetworkStatusChange: true,
  })

  const queryResult = props.data.isInternalCompany
    ? newsInternalData?.getCompanyNews
    : newsExternalData?.getExternalCompanyNews

  const newsListData: NewsModel[] = queryResult?.result || []
  const total: number = queryResult?.total || 0

  const gotoPage = (p: IPagination, filter: NewsFilterType) => {
    const newPagination = { ...p, page: p.page < 1 ? 1 : p.page }
    setPagination(newPagination)

    if (!props.data.isInternalCompany && newsListData?.length) {
      const isNext = p.page > pagination.page
      newsExternalRefetch({
        companyId: props.data.isInternalCompany,
        source: props.data.source,
        limit: p.pageSize,
        afterId: isNext ? newsListData[newsListData.length - 1]?.id : null,
        beforeId: !isNext ? newsListData[0]?.id : null,
      } as any)
    }
    if (props.data.isInternalCompany && newsListData?.length) {
      newsInternalRefetch({
        companyId: +props.data.companyId,
        take: newPagination.pageSize,
        skip: (newPagination.page - 1) * newPagination.pageSize,
        activeOnly: true,
        filterInput: convertToInput(filter),
      })
    }
  }

  const isNewsLoading = newsExternalLoading || newsInternalLoading || networkStatus === 4
  if (chartLoading && isNewsLoading) return <Updating loading />

  const newsChartRes: CompanyNewsChartResult = chartData?.getCompanyNewsChart
  if (isNewsAvailable.current === NEWS_AVAILABLE_INIT_VALUE && !isNewsLoading)
    isNewsAvailable.current = newsListData?.length ?? 0

  if (!newsChartRes?.sentimentChartData && !isNewsAvailable.current)
    return (
      <Paragraph sx={{ mt: 3 }} center>
        NO DATA AVAILABLE
      </Paragraph>
    )

  return (
    <Box mt={3}>
      {/* chart */}

      {chartLoading ? (
        <Updating loading text="Loading Sentiment Chart..." />
      ) : (
        <SentimentChart companyNewsChartRes={newsChartRes} />
      )}

      {/* News list */}
      {newsExternalLoading || newsInternalLoading ? (
        <Updating loading />
      ) : (
        <CompanyDetailNewsList
          isInternalCompany={props.data.isInternalCompany}
          newsListData={newsListData}
          total={total}
          pagination={pagination}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          gotoPage={gotoPage}
        />
      )}
    </Box>
  )
}
