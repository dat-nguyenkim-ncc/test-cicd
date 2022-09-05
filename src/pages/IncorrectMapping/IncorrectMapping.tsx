import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Divider, Flex, Text } from '@theme-ui/components'
import {
  Icon,
  Modal,
  Pagination,
  Updating,
  IncorrectMappingList,
  IncorrectMappingFilter,
  FormConfirm,
} from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { FormOption, IPagination } from '../../types'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_INCORRECT_MAPPING } from './graphql'
import strings from '../../strings'
import {
  defaultColumns,
  defaultPagination,
  IncorrectMappingDetails,
  IncorrectMappingFilterType,
  initialFilter,
  SortBy,
  EColumn,
  defaultQueryColumns,
} from './helpers'
import { ETLRunTimeContext } from '../../context'
import { UPDATE_INCORRECT_MAPPING } from '../../pages/IncorrectMapping/graphql'
import { localstorage, LocalstorageFields } from '../../utils'
import { EPageKey, Routes } from '../../types/enums'

const NORMALVIEW_COLUMNS_THRESHOLD = {
  MAX: 5,
  MIN: 2,
}

const IncorrectMapping = () => {
  const history = useHistory()
  const { header } = strings
  const {
    pages: { incorrectMapping: copy },
  } = strings
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const isFirstRun = useRef(true)
  const [selectedCompany, setSelectedCompany] = useState<
    Partial<{
      companyId: string
      companyName: string
    }>
  >({})
  const [filterState, setFilterState] = useState<IncorrectMappingFilterType>({ ...initialFilter })
  const [selectedColumns, setSelectedColumns] = useState<FormOption[]>([...defaultColumns])
  const [messageModal, setMessageModal] = useState<{
    type?: 'error' | 'loading' | 'success'
    title?: string
    content?: string
  }>({})
  const [totalRecord, setTotalRecord] = useState<number>(0)

  const [update] = useMutation(UPDATE_INCORRECT_MAPPING)
  const [getData, { data, loading: dataLoading }] = useLazyQuery(GET_INCORRECT_MAPPING, {
    fetchPolicy: 'network-only',
    onCompleted() {
      setTotalRecord(data?.getIncorrectMapping.total)
    },
    onError() {
      setTotalRecord(0)
    },
  })

  const refetchAPI = React.useCallback(
    (filter: IncorrectMappingFilterType = filterState) => {
      const input = {
        page: filter.pagination.page,
        pageSize: filter.pagination.pageSize,
        sortBy: filter.sortBy,
        mapped_l1_cluster: filter.mapped_l1_cluster,
        suggested_l1_cluster: filter.suggested_l1_cluster,
        columns: Array.from(
          new Set([...defaultQueryColumns, ...filter.columns.map(({ value }) => value)])
        ),
      }
      getData({ variables: { input } })
    },
    [getData, filterState]
  )

  const onChangeFilter = React.useCallback(
    (newFilter: IncorrectMappingFilterType) => {
      setFilterState(newFilter)
      localstorage.set(LocalstorageFields.INCORRECT_MAPPING_FILTER, JSON.stringify(newFilter))
      refetchAPI(newFilter)
    },
    [refetchAPI, setFilterState]
  )

  const isWideView = useMemo(() => {
    if (filterState.columns.length >= NORMALVIEW_COLUMNS_THRESHOLD.MAX) return true
    if (
      filterState.columns.length >= NORMALVIEW_COLUMNS_THRESHOLD.MIN &&
      filterState.columns.find(({ value: columnName }) =>
        [EColumn.DESCRIPTION, EColumn.LONG_DESCRIPTION].includes(columnName as string)
      )
    )
      return true
    return false
  }, [filterState.columns])

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      const filter = localstorage.get(LocalstorageFields.INCORRECT_MAPPING_FILTER)
      if (filter) {
        setSelectedColumns(JSON.parse(filter).columns)
        onChangeFilter(JSON.parse(filter))
      } else refetchAPI()
    }
  }, [refetchAPI, onChangeFilter])

  const resetFilter = () => {
    onChangeFilter({ ...initialFilter })
    setSelectedColumns([...defaultColumns])
  }

  const gotoPage = (pagination: IPagination, sortBy: SortBy) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    onChangeFilter({ ...filterState, pagination: newPagination, sortBy })
  }

  const handleReview = async (companyId: string) => {
    if (!checkTimeETL()) return
    try {
      setSelectedCompany({})
      setMessageModal({ type: 'loading' })
      await update({ variables: { companyId } })
      setMessageModal({
        type: 'success',
        title: 'Success',
        content: copy.message.reviewSuccess,
      })
    } catch (error) {
      setMessageModal({ type: 'error', title: 'Error', content: error.message })
    }
  }

  const handleMap = (company: IncorrectMappingDetails) => {
    if (!checkTimeETL()) return
    history.push({
      pathname: Routes.EDIT_COMPANY_TAXONOMY.replace(':id', company.company_id),
      search: new URLSearchParams({
        page: EPageKey.INCORRECT_MAPPING,
      }).toString(),
    })
  }

  return (
    <>
      <Heading
        sx={{
          ...(isWideView
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
        as="h2"
      >
        {header.incorrectMapping}
      </Heading>
      <Section
        sx={{
          mt: 5,
          p: 5,
          ...(isWideView
            ? { width: '95vw', mx: 'calc((-95vw + 1024px)/2)', maxWidth: 'none' }
            : {}),
        }}
      >
        {!dataLoading && !!totalRecord && (
          <>
            <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading as="h4" sx={{ fontWeight: 'bold' }}>
                {totalRecord ? `${totalRecord}` : ''} Pending Requests
              </Heading>
            </Flex>
            <Divider opacity={0.3} my={5} />
          </>
        )}
        <IncorrectMappingFilter
          filter={filterState}
          gotoPage={gotoPage}
          onChangeFilter={onChangeFilter}
          resetFilter={resetFilter}
          refetchAPI={() => {
            gotoPage({ ...filterState.pagination, page: 1 }, filterState.sortBy)
          }}
        />
        {dataLoading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : !data || !data?.getIncorrectMapping.data.length ? (
          <Paragraph sx={{ textAlign: 'center', p: 20, my: 40 }}>NO DATA AVAILABLE</Paragraph>
        ) : (
          <>
            <IncorrectMappingList
              setMessageModal={setMessageModal}
              handleToggle={(c: IncorrectMappingDetails) => {
                setSelectedCompany({
                  companyId: c.company_id,
                  companyName: c.name,
                })
              }}
              data={data?.getIncorrectMapping.data || []}
              columns={filterState.columns}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              applyColumns={() => {
                onChangeFilter({ ...filterState, columns: selectedColumns })
              }}
              onMap={handleMap}
            />
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={filterState.pagination.page}
              pageSize={filterState.pagination.pageSize}
              totalPages={Math.ceil(totalRecord / filterState.pagination.pageSize)}
              changePage={page => {
                gotoPage({ ...filterState.pagination, page }, filterState.sortBy)
              }}
              changePageSize={pageSize => {
                gotoPage({ ...defaultPagination, pageSize }, filterState.sortBy)
              }}
            />
          </>
        )}

        {messageModal.type && (
          <Modal
            sx={{ minWidth: 500 }}
            buttons={
              messageModal.type === 'loading'
                ? []
                : [
                    {
                      label: 'Ok',
                      type: 'primary',
                      action: () => {
                        refetchAPI()
                        setMessageModal({})
                      },
                    },
                  ]
            }
          >
            <>
              {messageModal.type === 'loading' ? (
                <Updating sx={{ py: 7 }} />
              ) : (
                <>
                  <Flex>
                    <Icon
                      {...(messageModal.type === 'error'
                        ? { icon: 'alert', background: 'red' }
                        : { icon: 'tick', background: 'green' })}
                      size="small"
                      color="white"
                    />
                    <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                      {messageModal.title}
                    </Heading>
                  </Flex>
                  {(messageModal.content || null) && (
                    <Paragraph center sx={{ mt: 3, fontSize: 16, lineHeight: 2 }}>
                      {messageModal.content}
                    </Paragraph>
                  )}
                </>
              )}
            </>
          </Modal>
        )}
        {selectedCompany.companyId && (
          <Modal
            sx={{
              p: 4,
              maxWidth: '60vw',
              alignItems: 'flex-start',
              minWidth: 500,
            }}
          >
            <FormConfirm
              textConfirm={copy.buttons.review}
              color="gold"
              bgColor="bgGold"
              onConfirm={() => {
                selectedCompany.companyId && handleReview(selectedCompany.companyId)
              }}
              onCancel={() => {
                setSelectedCompany({})
              }}
              sx={{ width: '100%' }}
            >
              <>
                <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5, mb: 4 }}>
                  {copy.confirm.review}
                  <br />
                  <span
                    style={{ fontWeight: 'bold' }}
                  >{` ${selectedCompany.companyId} - ${selectedCompany.companyName} `}</span>
                  ?
                </Text>
              </>
            </FormConfirm>
          </Modal>
        )}
      </Section>
    </>
  )
}

export default IncorrectMapping
