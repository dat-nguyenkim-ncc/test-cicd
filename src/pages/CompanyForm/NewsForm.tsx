import React, { useCallback, useContext, useEffect, useState } from 'react'
import { FooterCTAs, Pagination, ReasonSwitch } from '../../components'
import { Heading, Paragraph } from '../../components/primitives'
import strings from '../../strings'
import {
  EnumCompanyNewsStatusId,
  EnumExpandStatus,
  EnumExpandStatusId,
  Routes,
} from '../../types/enums'
import { default as GET_COMPANY_NEWS } from './graphql/companyNews'
import { useApolloClient } from '@apollo/client'
import CompanyContext from './provider/CompanyContext'
import { GetCompanyOverrideInput, IPagination } from '../../types'
import { useHistory, useParams } from 'react-router-dom'
import { Box, Divider, Flex } from 'theme-ui'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import { onError } from '../../sentry'
import NewsItem, { TypeShow } from '../../components/NewsList/NewsItem'
import { ColumnNames, getNumPending, TableNames } from './helpers'
import useChangeRequest from '../../hooks/useChangeRequest'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import NewsFilter from './News/NewsFilter'
import { convertToInput, INIT_FILTER_NEWS, NewsFilterType } from './News/helpers'

export type NewsFormProps = {
  info?: React.ReactElement
  isEdit?: boolean
  refetchViewHistoryCols(): void
}

export type NewsModel = {
  id: string
  title: string
  datePublished: string
  publisher: string
  author: string
  url: string
  imageUrl: string
  source: string
  fctStatusId: EnumExpandStatusId | EnumCompanyNewsStatusId
  sentimentLabel?: string
  businessEvent?: string[]
}

const NewsForm = (props: NewsFormProps) => {
  //#region  DECLARE CONSTANTS
  const client = useApolloClient()
  const {
    companyId,
    handleUpdateStatus,
    isOverridesUser,
    companySource,
    hasHistoryField,
    viewHistory,
  } = useContext(CompanyContext)
  const { cr } = useParams<any>()
  const rowId = cr && decodeURIComponent(cr)
  const history = useHistory()
  const {
    pages: { addCompanyForm: copy },
  } = strings
  const { isEdit, refetchViewHistoryCols } = props
  //#endregion

  //#region   STATE
  const [editState, setEditState] = useState<NewsModel[]>([])
  const [isQuering, setIsQuering] = useState(false)
  const [pagination, setPagination] = useState<IPagination>({ page: 1, pageSize: 10 })
  const [totalResult, setTotalResult] = useState(0)
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [error, _setError] = useState('')
  const [currentFilter, setCurrentFilter] = useState<NewsFilterType>(INIT_FILTER_NEWS)
  const setError = (error: Error) => {
    _setError(error?.message || '')
    onError(error)
  }
  const [stateSwitchAll, setStateSwitchAll] = useState(false)
  //#endregion

  //#region  REQUEST SERVER
  const fetchData = useCallback(
    async (refetchHasFollowingOnly: boolean = false) => {
      try {
        const filterInput = convertToInput(currentFilter)
        setIsLoadingNews(!refetchHasFollowingOnly)
        const companyNewsDataPaging = await client.query({
          query: GET_COMPANY_NEWS,
          variables: {
            companyId: +companyId,
            take: 10,
            skip: 0,
            skipPaging: refetchHasFollowingOnly,
            rowId,
            filterInput,
          },
          fetchPolicy: 'network-only',
        })

        const newsOverviews = companyNewsDataPaging?.data?.getCompanyNews
        const hasFollowing = newsOverviews?.hasFollowing || false

        if (!refetchHasFollowingOnly) {
          const result = newsOverviews?.result
          setEditState(result)
          setTotalResult(newsOverviews?.total)
        } else if (!hasFollowing) {
          setEditState(prev =>
            prev.map(item => ({
              ...item,
              fctStatusId: EnumExpandStatusId.UNFOLLOWED,
            }))
          )
        }
        setStateSwitchAll(hasFollowing)
      } catch (error) {
        setError(error)
      } finally {
        setIsLoadingNews(false)
      }
    },
    [client, companyId, rowId, currentFilter]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetchNewsData = React.useCallback(
    async (pagination: IPagination, filter: NewsFilterType) => {
      setIsLoadingNews(true)
      const filterInput = convertToInput(filter)
      const dataInPage = await client.query({
        query: GET_COMPANY_NEWS,
        variables: {
          companyId: +companyId,
          take: pagination.pageSize,
          skip: pagination.pageSize * (pagination.page - 1),
          rowId,
          filterInput,
        },
        fetchPolicy: 'no-cache',
      })
      const newsOverviews = dataInPage?.data?.getCompanyNews

      const result = newsOverviews?.result
      setEditState(result)
      setTotalResult(newsOverviews?.total)
      setStateSwitchAll(newsOverviews.hasFollowing)
      setIsLoadingNews(false)
    },
    [rowId, client, companyId]
  )

  //#endregion

  //#region   HANDLE DATA RESPONSE
  //#endregion

  const gotoPage = React.useCallback(
    (pagination: IPagination, filter: NewsFilterType) => {
      const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
      setPagination(newPagination)
      refetchNewsData(newPagination, filter)
    },
    [refetchNewsData]
  )

  const changeFilter = React.useCallback(
    (filter: NewsFilterType) => {
      setCurrentFilter(filter)
      gotoPage({ ...pagination, page: 1 }, filter)
    },
    [pagination, gotoPage]
  )

  const resetFilter = React.useCallback(() => {
    setCurrentFilter(INIT_FILTER_NEWS)
    gotoPage({ ...pagination, page: 1 }, INIT_FILTER_NEWS)
  }, [pagination, gotoPage])

  const handleActionForAll = async () => {
    setIsQuering(true)
    setStateSwitchAll(!stateSwitchAll)
    refetchNewsData(pagination, currentFilter)
    setIsQuering(false)
  }

  const updateStatus = async (
    id: string | number,
    newStatus: EnumExpandStatusId,
    comment: string
  ) => {
    const mapFn = (item: NewsModel): NewsModel => {
      return item.id === id ? { ...item, fctStatusId: newStatus } : item
    }
    setEditState(editState.map(mapFn))
  }

  const { handleClickShowPendingCR, PendingCRModal, overviewPendingRequest } = useChangeRequest({
    refetchViewHistoryCols,
    handleApproveUpdateNewData: async (data, isAppendData) => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        await updateStatus(
          data.rowId || '',
          data.newValue as EnumExpandStatusId,
          data.comment || ''
        )
      }
      if (data.columnName === ColumnNames.NEWS_STATUS) {
        fetchData()
      }
    },
    defaultSource: companySource,
    companyId: +companyId,
  })

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })
  // #endregion

  const overrideActionAllNews: GetCompanyOverrideInput = {
    tableName: TableNames.COMPANIES,
    columnName: ColumnNames.NEWS_STATUS,
    companyId: +companyId,
    rowId: companyId.toString(),
  }

  return (
    <>
      <CompanyFormsSectionLayout
        title={copy.titles.news}
        isLoading={isLoadingNews || isQuering}
        error={error}
      >
        {isEdit && (
          <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row', flex: 1 }}>
            <Box sx={{ display: 'flex', flex: 1 }}>
              <Heading as="h5">Total: {totalResult}</Heading>
            </Box>
            <Flex>
              <NewsFilter
                resetFilter={resetFilter}
                changeFilter={changeFilter}
                filter={currentFilter}
              />
              {totalResult > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <ReasonSwitch
                    switchProps={{
                      checked: stateSwitchAll,
                      onToggle: () => {},
                    }}
                    onSave={async (reason: string) => {
                      const input = {
                        id: companyId.toString(),
                        companyId: +companyId,
                        reason: reason,
                        tableName: TableNames.COMPANIES,
                        columnName: ColumnNames.NEWS_STATUS,
                        newValue: stateSwitchAll
                          ? EnumCompanyNewsStatusId.UNFOLLOWED
                          : EnumCompanyNewsStatusId.FOLLOWING,
                        oldValue: stateSwitchAll
                          ? EnumCompanyNewsStatusId.FOLLOWING
                          : EnumCompanyNewsStatusId.UNFOLLOWED,
                      }

                      await handleUpdateStatus(input)
                      if (isOverridesUser) {
                        handleActionForAll()
                      }
                    }}
                    viewHistory={viewHistoryFn(overrideActionAllNews)}
                    viewPendingChangeRequest={viewPendingCQFn(overrideActionAllNews)}
                    reasonProps={{
                      prefix: <Paragraph bold>All</Paragraph>,
                      reasonRequired: !isOverridesUser,
                      oldValue: stateSwitchAll
                        ? EnumExpandStatus.FOLLOWING
                        : EnumExpandStatus.UNFOLLOWED,
                      newValue: stateSwitchAll
                        ? EnumExpandStatus.UNFOLLOWED
                        : EnumExpandStatus.FOLLOWING,
                      totalItemPendingCR: getNumPending(
                        overviewPendingRequest,
                        overrideActionAllNews
                      ),
                    }}
                  />
                </Box>
              )}
            </Flex>
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          {editState.map(item => {
            const isFollowing = item.fctStatusId === EnumExpandStatusId.FOLLOWING
            const overrideIdentity: GetCompanyOverrideInput = {
              tableName: TableNames.NEWS,
              columnName: ColumnNames.FCT_STATUS_ID,
              companyId: +companyId,
              rowId: item.id as string,
              source: item.source as string,
            }

            return (
              <React.Fragment key={item.id}>
                <NewsItem
                  disabled={!stateSwitchAll}
                  valueData={item}
                  sx={{ p: 4, bg: rowId === item.id ? 'bgPrimary' : 'auto', borderRadius: 10 }}
                  typeShow={TypeShow.TypeA}
                  suffixComp={
                    <ReasonSwitch
                      disabled={!stateSwitchAll}
                      switchProps={{
                        checked: isFollowing,
                        onToggle: () => {},
                      }}
                      onSave={async (reason: string) => {
                        const input = {
                          id: item.id,
                          companyId: +companyId,
                          reason: reason,
                          tableName: TableNames.NEWS,
                          columnName: ColumnNames.FCT_STATUS_ID,
                          source: item.source as string,
                          newValue: isFollowing
                            ? EnumExpandStatusId.UNFOLLOWED
                            : EnumExpandStatusId.FOLLOWING,
                          oldValue: isFollowing
                            ? EnumExpandStatusId.FOLLOWING
                            : EnumExpandStatusId.UNFOLLOWED,
                        }

                        await handleUpdateStatus(input)
                        if (isOverridesUser) {
                          await updateStatus(input.id, input.newValue, reason)
                        }
                      }}
                      viewHistory={viewHistoryFn(overrideIdentity)}
                      viewPendingChangeRequest={viewPendingCQFn(overrideIdentity)}
                      reasonProps={{
                        reasonRequired: !isOverridesUser,
                        oldValue: isFollowing
                          ? EnumExpandStatus.FOLLOWING
                          : EnumExpandStatus.UNFOLLOWED,
                        newValue: isFollowing
                          ? EnumExpandStatus.UNFOLLOWED
                          : EnumExpandStatus.FOLLOWING,
                        totalItemPendingCR: getNumPending(overviewPendingRequest, overrideIdentity),
                      }}
                    />
                  }
                />
                <Divider />
              </React.Fragment>
            )
          })}
        </Box>
        <Pagination
          sx={{ justifyContent: 'center' }}
          currentPage={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={Math.ceil(totalResult / pagination.pageSize)}
          changePage={page => {
            gotoPage({ ...pagination, page }, currentFilter)
          }}
          changePageSize={pageSize => {
            gotoPage({ page: 1, pageSize }, currentFilter)
          }}
        />
      </CompanyFormsSectionLayout>
      {isEdit && (
        <FooterCTAs
          buttons={[
            {
              label: copy.buttons.backToCompanyRecord,
              variant: 'outlineWhite',
              onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
            },
          ]}
        />
      )}
      <PendingCRModal />
    </>
  )
}
export default NewsForm
