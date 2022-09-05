import { useQuery } from '@apollo/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Box, Flex, SxStyleProp } from 'theme-ui'
import { Button, Drawer, FilterTemplate, Updating } from '../../../components'
import { Keyword } from '../../CompanyManagement/CompanyFilter'
import { KeywordFilterType } from '../../CompanyManagement/CompanyFilter/helpers'
import { GET_COMPANY_FILTER_DATA } from '../../CompanyManagement/graphql'
import { GetDimensionsItem } from '../../TaxonomyManagement'
import {
  AnalysisFilterType,
  INITIAL_ANALYSIS_FILTER,
  INITIAL_KEYWORD,
  KEYWORD_OPTIONS,
} from '../helpers'
import Category from './Category'
import Uniqueness from './Uniqueness'

const useStyle = () => ({
  filterButtonBox: { justifyContent: 'flex-end', mb: 5, alignItems: 'center' } as SxStyleProp,
})

type AnalysisFilterProps = {
  filter: AnalysisFilterType
  setFilterState(filter: AnalysisFilterType): void
  dataFilter: DataFilterType
  setDataFilter(filter: DataFilterType): void
  isCalledApi: React.MutableRefObject<boolean>
}

export type DataFilterType = {
  sector: GetDimensionsItem[]
  cluster: GetDimensionsItem[]
  valueChain: GetDimensionsItem[]
  risk: GetDimensionsItem[]
}

const AnalysisFilter = ({
  filter,
  setFilterState,
  dataFilter,
  setDataFilter,
  isCalledApi,
}: AnalysisFilterProps) => {
  const styles = useStyle()
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [currentFilter, setCurrentFilter] = useState<AnalysisFilterType>(filter)
  const [filterKeyword, setFilterKeyword] = useState<KeywordFilterType>(currentFilter.keyword)
  const [key, setKey] = useState<number>(0)

  useEffect(() => {
    setCurrentFilter(filter)
  }, [filter])

  useEffect(() => {
    setCurrentFilter(currentFilter => ({
      ...currentFilter,
      keyword: filterKeyword,
    }))
  }, [filterKeyword])

  const getClusters = useMemo(() => {
    if (!currentFilter.category.length) {
      return dataFilter.cluster
    }
    return dataFilter.cluster.filter(({ category }) =>
      currentFilter.category.some(c => c.value === category)
    )
  }, [currentFilter.category, dataFilter.cluster])

  //GRAPHQL
  const { data, loading } = useQuery(GET_COMPANY_FILTER_DATA, {
    onCompleted() {
      setDataFilter({
        sector: data?.getCompanyFilterData?.sector,
        cluster: data?.getCompanyFilterData?.cluster,
        valueChain: data?.getCompanyFilterData?.valueChain,
        risk: data?.getCompanyFilterData?.risk,
      })
    },
  })
  return (
    <>
      <Flex sx={styles.filterButtonBox}>
        <Button
          onPress={() => {
            setFilterVisible(true)
          }}
          sx={{
            color: 'primary',
            ml: 3,
            px: 18,
          }}
          icon="filter"
          variant="outline"
          label="Filter"
          color="black50"
          iconLeft
        />
      </Flex>

      <Drawer visible={filterVisible}>
        <FilterTemplate
          key={key}
          onClose={() => {
            setCurrentFilter(filter)
            setFilterVisible(false)
            setFilterKeyword(filter.keyword)
          }}
          resetFilter={() => {
            setFilterState({
              ...INITIAL_ANALYSIS_FILTER,
            })
            setFilterVisible(false)
            setFilterKeyword({ ...INITIAL_KEYWORD })
            isCalledApi.current = true
            setKey(key + 1) // re-render UI when reset filter
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                setFilterState({
                  ...currentFilter,
                  page: 1,
                })
                setFilterVisible(false)
              },
              sx: {
                px: 16,
                py: 2,
                borderRadius: 8,
              },
            },
          ]}
        >
          {loading ? (
            <Updating loading />
          ) : (
            <>
              <Category
                setCurrentFilter={setCurrentFilter}
                currentFilter={currentFilter}
                dataFilter={dataFilter}
                clusters={getClusters}
              />

              <Box style={{ transform: 'translateY(-20px)' }}>
                <Keyword
                  state={filterKeyword}
                  keywordOptions={KEYWORD_OPTIONS}
                  onChange={setFilterKeyword}
                  isShowOperations={false}
                  isCollapseOpen={false}
                />
              </Box>

              <Uniqueness currentFilter={currentFilter} setCurrentFilter={setCurrentFilter} />
            </>
          )}
        </FilterTemplate>
      </Drawer>
    </>
  )
}

export default AnalysisFilter
