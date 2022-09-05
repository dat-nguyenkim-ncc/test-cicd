import { useLazyQuery, useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { Button, Pagination, Updating } from '../../../components'
import { ErrorModal } from '../../../components/ErrorModal'
import { Paragraph } from '../../../components/primitives'
import strings from '../../../strings'
import { Palette } from '../../../theme'
import { FundingRoundTypeResponse, IPagination, RoundTypesOption } from '../../../types'
import { GET_FUNDING_ROUND_MAPPINGS } from '../graphql'
import {
  DEFAULT_FILTER,
  EMPTY_ROUND_ID,
  FIRST_PAGE,
  FUNDING_ROUND_VIEWING_FIELDS,
} from '../helpers'
import {
  FundingRoundMappingDTO,
  FundingRoundMappingFilterDTO,
  GetFundingRoundMappingsResponse,
} from '../types'
import FundingRoundMappingModal from './FundingRoundMappingModal'
import { Text } from 'theme-ui'
import { GET_FUNDING_ROUND_TYPES } from '../../CompanyForm/graphql'
import { formatFundingRoundTypes } from '../../CompanyForm'
import FundingRoundMappingFilter from './Filter'
import localstorage, { LocalstorageFields } from '../../../utils/localstorage'

const defaultPagination: IPagination = {
  page: 1,
  pageSize: 10,
}

const FundingRoundMappings = () => {
  const {
    sourceMappingManagement: { roundMapping },
  } = strings

  const [pagination, setPagination] = useState<IPagination>({ ...defaultPagination })
  const [fundingRoundEditing, setFundingRoundEditing] = useState<
    FundingRoundMappingDTO | undefined
  >(undefined)

  const [roundTypeOptions, setRoundTypeOptions] = useState<RoundTypesOption>({} as RoundTypesOption)

  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const [filterState, setFilterState] = useState<FundingRoundMappingFilterDTO>({
    ...DEFAULT_FILTER,
  })

  const isFirstRun = useRef<boolean>(true)

  const formatRoundIdInput = (roundId: number) =>
    +roundId !== EMPTY_ROUND_ID ? roundId : undefined

  // GRAPHQL
  const [
    getFundingRoundMappings,
    { data: fundingRoundMappingsResponse, loading: fundingRoundMappingLoading },
  ] = useLazyQuery<GetFundingRoundMappingsResponse>(GET_FUNDING_ROUND_MAPPINGS, {
    fetchPolicy: 'network-only',
    onError(error) {
      setErrorMessage(error.message)
    },
    notifyOnNetworkStatusChange: true,
  })

  const refresh = useCallback(
    (
      filter: FundingRoundMappingFilterDTO | undefined,
      paginationInput: IPagination | undefined
    ) => {
      const filterStateQuery = filter || filterState

      const paginationQuery = paginationInput || pagination

      getFundingRoundMappings({
        variables: {
          input: {
            pageNumber: paginationQuery.page,
            pageSize: paginationQuery.pageSize,
            round1Id: formatRoundIdInput(filterStateQuery.round1Id),
            round2Id: formatRoundIdInput(filterStateQuery.round2Id),
            sourceValue:
              !filterStateQuery.isSourceValueBlank && !filterStateQuery.sourceValue
                ? undefined
                : filterStateQuery.sourceValue,
          },
        },
      })
    },
    [filterState, getFundingRoundMappings, pagination]
  )

  const getLocalFilter = (): FundingRoundMappingFilterDTO | undefined => {
    const localState = localstorage.get(LocalstorageFields.FUNDING_ROUND_MAPPING)
    return localState ? JSON.parse(localState) : localState
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      const localFilterState = getLocalFilter()
      if (localFilterState) setFilterState(localFilterState)
      refresh(localFilterState, pagination)
    }
  }, [filterState, refresh, pagination])

  const { loading: loadingFundingRoundsTypes } = useQuery<FundingRoundTypeResponse>(
    GET_FUNDING_ROUND_TYPES,
    {
      onCompleted: response => {
        setRoundTypeOptions(formatFundingRoundTypes(response.getFundingRoundTypes))
      },
    }
  )

  const { data, total } = fundingRoundMappingsResponse?.getFundingRoundMappings || {
    data: [],
    total: 0,
  }

  const gotoPage = (pagination: IPagination, filterStateInput?: FundingRoundMappingFilterDTO) => {
    const page = pagination.page < FIRST_PAGE ? FIRST_PAGE : pagination.page
    localstorage.set(
      LocalstorageFields.FUNDING_ROUND_MAPPING,
      JSON.stringify(filterStateInput || filterState)
    )

    const newPagination = { ...pagination, page, pageSize: pagination.pageSize }

    setPagination(newPagination)
    refresh(filterStateInput, newPagination)
  }

  const onCancel = () => {
    setFundingRoundEditing(undefined)
  }

  const loading = loadingFundingRoundsTypes || fundingRoundMappingLoading

  return (
    <>
      <Paragraph sx={{ color: 'red', my: 3 }}>{roundMapping.warning}</Paragraph>
      <FundingRoundMappingFilter
        loading={loading}
        filterState={filterState}
        gotoPage={gotoPage}
        pagination={pagination}
        roundTypeOptions={roundTypeOptions}
        setFilterState={setFilterState}
        getLocalFilter={getLocalFilter}
      ></FundingRoundMappingFilter>
      {loading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <>
          {data.length ? (
            <>
              <Box>
                <Flex sx={{ p: 2, mr: 40 }}>
                  {FUNDING_ROUND_VIEWING_FIELDS.map(({ label, key }) => (
                    <Label key={key} sx={{ flex: 1 }}>
                      {label}
                    </Label>
                  ))}
                </Flex>
                {data.map((item: FundingRoundMappingDTO, index) => {
                  return (
                    <Flex
                      key={index}
                      sx={{
                        bg: index % 2 === 0 ? Palette.gray03 : Palette.white,
                        alignItems: 'center',
                        minHeight: '40px',
                        borderRadius: 10,
                        p: 2,
                      }}
                    >
                      {FUNDING_ROUND_VIEWING_FIELDS.map(({ key, format }) => (
                        <Text sx={{ flex: 1, fontSize: 14 }} key={key}>
                          {format ? format(item[key]) : item[key]?.toString() || ''}
                        </Text>
                      ))}
                      <Button
                        sx={{ height: 'auto' }}
                        color="primary"
                        variant="invert"
                        icon="pencil"
                        onPress={() => {
                          setFundingRoundEditing(item)
                        }}
                      />
                    </Flex>
                  )
                })}
              </Box>

              <Pagination
                sx={{ justifyContent: 'center' }}
                currentPage={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={Math.ceil(total / pagination.pageSize)}
                changePage={page => {
                  gotoPage({ ...pagination, page })
                }}
                changePageSize={pageSize => {
                  gotoPage({ ...defaultPagination, pageSize })
                }}
              />
            </>
          ) : (
            <Paragraph sx={{ textAlign: 'center', p: 6 }}>{roundMapping.noData}</Paragraph>
          )}
        </>
      )}

      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onOK={() => {
            setErrorMessage(undefined)
          }}
        />
      )}

      <FundingRoundMappingModal
        fundingRoundMappingEdit={fundingRoundEditing}
        onCancel={onCancel}
        setErrorMessage={setErrorMessage}
        refreshFundingRoundMappings={() => {
          refresh(filterState, pagination)
        }}
        roundTypeOptions={roundTypeOptions}
      />
    </>
  )
}

export default FundingRoundMappings
