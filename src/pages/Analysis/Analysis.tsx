import { useQuery } from '@apollo/client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Pagination, Updating } from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import { getChildrenCluster } from '../CompanyManagement/CompanyFilter/helpers'
import AnalysisFilter, { DataFilterType } from './AnalysisFilter/AnalysisFilter'
import AnalysisList from './AnalysisList'
import { GET_KEYWORD_ANALYSIS } from './graphql'
import { AnalysisFilterType, INITIAL_ANALYSIS_FILTER } from './helpers'
import strings from '../../strings'

const Analysis = () => {
  const isFirstRun = useRef(true)
  const isCalledApi = useRef(true)
  const [filterState, setFilterState] = useState<AnalysisFilterType>({
    ...INITIAL_ANALYSIS_FILTER,
  })
  const [dataFilter, setDataFilter] = useState<DataFilterType>({
    sector: [],
    cluster: [],
    valueChain: [],
    risk: [],
  })
  const [totalCompanies, setTotalCompanies] = useState<number>(0)

  const input = useMemo(() => {
    return {
      categories: filterState.category.map(({ value }) => value),
      categoryCombination: filterState.categoryCombination,
      sectors: filterState.sector.map(({ value }) => value),
      sectorsCombination: filterState.sectorsCombination,
      valueChains: filterState.valueChain.map(({ value }) => value),
      valueChainsCombination: filterState.valueChainsCombination,
      risks: filterState.risk.map(({ value }) => value),
      risksCombination: filterState.risksCombination,
      clusters: filterState.cluster
        .filter(({ value }) => !!value.length)
        .map(item => ({
          combination: item.combination,
          clusterIds:
            item.clusterIds || getChildrenCluster(dataFilter.cluster || [], item.value[0]?.value),
        })),
      clustersCombination: filterState.clustersCombination,
      keywordSearch: {
        keywords: filterState.keyword.keywords.map(({ value }) => value),
        operations: filterState.keyword.operations.filter(
          ({ value }) => !!value?.toString().length
        ),
      },
      uniquenessPercent: filterState.uniquenessPercent,
      pageNumber: filterState.page,
      pageSize: filterState.pageSize,
    }
  }, [filterState, dataFilter.cluster])

  // GRAPHQL
  const { data: keywordAnalysisData, loading } = useQuery(GET_KEYWORD_ANALYSIS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: isCalledApi.current,
    variables: { input: input },
    onCompleted() {
      setTotalCompanies(keywordAnalysisData?.getKeywordAnalysis?.total || 0)
    },
  })

  const keywordAnalysis = keywordAnalysisData?.getKeywordAnalysis?.results || []

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      isCalledApi.current = true
    } else {
      isCalledApi.current = false
    }
  }, [input])

  return (
    <>
      <Heading as="h2">{strings.keywordAnalysisText.title}</Heading>
      <Section
        sx={{
          mt: 5,
        }}
      >
        <AnalysisFilter
          filter={filterState}
          setFilterState={setFilterState}
          dataFilter={dataFilter}
          setDataFilter={setDataFilter}
          isCalledApi={isCalledApi}
        />

        {isCalledApi.current ? (
          <Paragraph sx={{ textAlign: 'center', p: 20, my: 40, fontSize: 20 }}>
            {strings.keywordAnalysisText.contentFirstRender || ''}
          </Paragraph>
        ) : loading ? (
          <Updating loading sx={{ my: 50 }} />
        ) : !keywordAnalysis || !keywordAnalysis.length ? (
          <Paragraph sx={{ textAlign: 'center', p: 20, my: 40 }}>NO DATA AVAILABLE</Paragraph>
        ) : (
          <>
            <AnalysisList data={keywordAnalysis} />
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={filterState.page}
              pageSize={filterState.pageSize}
              totalPages={Math.ceil(totalCompanies / filterState.pageSize)}
              changePage={page => {
                setFilterState({ ...filterState, page: page })
              }}
              changePageSize={pageSize => {
                setFilterState({ ...filterState, pageSize: pageSize, page: 1 })
              }}
            />
          </>
        )}
      </Section>
    </>
  )
}

export default Analysis
