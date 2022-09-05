import React, { FormEvent, useMemo, useState } from 'react'
import { Flex, Label } from '@theme-ui/components'
import { Geography, Attachment, Financing, MnA, Overview, Source, Keyword } from '.'
import {
  Button,
  ButtonText,
  Drawer,
  Dropdown,
  FilterTemplate,
  Icon,
  Search,
  Updating,
} from '../../../components'
import strings from '../../../strings'
import { FileState, FormOption, IPagination, TagData, RoundTypesOption } from '../../../types'
import { SortDirection } from '../../../types/enums'
import { useQuery } from '@apollo/client'
import { GET_COMPANY_FILTER_DATA } from '../graphql'
import {
  OverviewFilterType,
  GeographyFilterType,
  FinancingFilterType,
  MnAFilterType,
  AttachmentFilterType,
  SourceFilterType,
  SortBy,
  GeographyType,
  IpoFilterType,
  KeywordFilterType,
  keywordOptions,
} from '../CompanyFilter/helpers'
import { GetDimensionsItem } from '../../TaxonomyManagement'
import Ipo from './Ipo'
import { UploadFileInput } from '../../../components/UploadFile'
import { acceptedFormats, isCompanyId, validFileType } from '../../../utils'
import { Box, Divider } from 'theme-ui'
import { FileItem } from '../../../components/FileItem'
import { useCallback } from 'react'
import { Paragraph } from '../../../components/primitives'
import exportIdsCsv from '../../../utils/exportIdsCsv'
import { formatFundingRoundTypes } from '../../CompanyForm/helpers'

type CompanyFilterProps = {
  sortBy: SortBy
  pagination: IPagination
  columnsFilter: FormOption[]
  filterOverview: OverviewFilterType
  filterKeyword: KeywordFilterType
  filterGeography: GeographyFilterType
  filterFinancing: FinancingFilterType
  filterMnA: MnAFilterType
  filterIpo: IpoFilterType
  filterAttachment: AttachmentFilterType
  filterSource: SourceFilterType
  gotoPage(pagination: IPagination, newSortBy: SortBy): void
  setFilterOverview(overview: OverviewFilterType): void
  setFilterKeyword(keyword: KeywordFilterType): void
  setFilterGeography(geography: GeographyFilterType): void
  setFilterFinancing(financing: FinancingFilterType): void
  setFilterMnA(mnA: MnAFilterType): void
  setFilterIpo(ipo: IpoFilterType): void
  setFilterAttachment(attachment: AttachmentFilterType): void
  setFilterSource(source: SourceFilterType): void
  resetFilter(): void
  revertFilterChange(): void
  refetchAPI(): void
  setCompanyIds(ids: number[]): void
  setClustersData?(clusters: GetDimensionsItem[]): void
}

const CompanyFilter = ({
  sortBy,
  pagination,
  columnsFilter,
  gotoPage,
  filterOverview,
  filterKeyword,
  filterGeography,
  filterFinancing,
  filterMnA,
  filterIpo,
  filterAttachment,
  filterSource,
  setFilterOverview,
  setFilterKeyword,
  setFilterGeography,
  setFilterFinancing,
  setFilterMnA,
  setFilterIpo,
  setFilterAttachment,
  setFilterSource,
  resetFilter,
  revertFilterChange,
  refetchAPI,
  setCompanyIds,
  setClustersData,
}: CompanyFilterProps) => {
  const { companyManagement: copy } = strings

  const [fileState, setFileState] = useState<FileState[]>([])
  const [state, setState] = useState<{ search?: string }>({ search: '' })
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [key, setKey] = useState<number>(0)
  const [filterData, setFilterData] = useState<{
    overview: {
      sector: GetDimensionsItem[]
      cluster: GetDimensionsItem[]
      valueChain: GetDimensionsItem[]
      insCluster: GetDimensionsItem[]
      risk: GetDimensionsItem[]
      regCluster: GetDimensionsItem[]
      tagGroups: TagData[]
    }
    financing: {
      roundTypes: RoundTypesOption
    }
    geography: GeographyType
  }>({
    overview: {
      sector: [],
      cluster: [],
      valueChain: [],
      insCluster: [],
      risk: [],
      regCluster: [],
      tagGroups: [],
    },
    financing: {
      roundTypes: {
        roundType1: [],
        roundType2: {},
      },
    },
    geography: {
      region: [],
      region1: [],
      region2: [],
      countries: [],
    },
  })

  //GRAPHQL
  const { data, loading } = useQuery(GET_COMPANY_FILTER_DATA, {
    onCompleted() {
      const { roundType1, roundType2 } = formatFundingRoundTypes(
        data.getCompanyFilterData.roundTypes
      )
      setFilterData({
        overview: {
          sector: data?.getCompanyFilterData.sector,
          cluster: data?.getCompanyFilterData.cluster,
          valueChain: data?.getCompanyFilterData.valueChain,
          insCluster: data?.getCompanyFilterData.insCluster,
          risk: data?.getCompanyFilterData.risk,
          regCluster: data?.getCompanyFilterData.regCluster,
          tagGroups: data?.getCompanyFilterData.tagGroups,
        },
        financing: {
          roundTypes: {
            roundType1,
            roundType2,
          },
        },
        geography: data?.getCompanyFilterData.geography,
      })
      setClustersData && setClustersData(data?.getCompanyFilterData.cluster)
    },
  })

  const onChangeSearch = (search: string) => {
    setState({ ...state, search })
  }

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {}

  const processCSV = useCallback(
    (str: string) => {
      const rows = str.replaceAll(`"`, '').split('\n')
      const listIds = rows.reduce((acc: number[], cur: string) => {
        if (isCompanyId(cur) && !acc.includes(+cur)) {
          acc.push(+cur)
        }
        return acc
      }, [] as number[])
      setCompanyIds(listIds)
    },
    [setCompanyIds]
  )

  const getClusters = useMemo(() => {
    if (!filterOverview.category.length) {
      return filterData.overview.cluster
    }
    return filterData.overview.cluster.filter(({ category }) =>
      filterOverview.category.some(c => c.value === category)
    )
  }, [filterOverview.category, filterData.overview.cluster])

  const memoOverview = useMemo(
    () => (
      <Overview
        state={filterOverview}
        data={filterData.overview}
        clusters={getClusters}
        onChange={setFilterOverview}
      />
    ),
    [filterOverview, filterData.overview, getClusters, setFilterOverview]
  )
  const memoKeyword = useMemo(
    () => (
      <Keyword state={filterKeyword} keywordOptions={keywordOptions} onChange={setFilterKeyword} />
    ),
    [filterKeyword, setFilterKeyword]
  )
  const memoGeography = useMemo(
    () => (
      <Geography
        state={filterGeography}
        data={filterData.geography}
        onChange={setFilterGeography}
      />
    ),
    [filterGeography, filterData.geography, setFilterGeography]
  )
  const memoFinancing = useMemo(
    () => (
      <Financing
        state={filterFinancing}
        onChange={setFilterFinancing}
        roundTypes={filterData.financing.roundTypes}
      />
    ),
    [filterFinancing, setFilterFinancing, filterData.financing.roundTypes]
  )
  const memoMnA = useMemo(() => <MnA state={filterMnA} onChange={setFilterMnA} />, [
    filterMnA,
    setFilterMnA,
  ])
  const memoIpo = useMemo(() => <Ipo state={filterIpo} onChange={setFilterIpo} />, [
    filterIpo,
    setFilterIpo,
  ])
  const memoAttachment = useMemo(
    () => <Attachment state={filterAttachment} onChange={setFilterAttachment} />,
    [filterAttachment, setFilterAttachment]
  )
  const memoSource = useMemo(() => <Source state={filterSource} onChange={setFilterSource} />, [
    filterSource,
    setFilterSource,
  ])
  const memoUpload = useMemo(
    () => (
      <>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Label sx={{ width: 'auto', m: 0 }}>{`Company id list`}</Label>
          <UploadFileInput
            sx={{ pr: 1 }}
            files={fileState}
            onChangeFile={files => {
              setFileState(files)
              const file = files[0]
              const reader = new FileReader()

              reader.onload = function (e) {
                const text = e.target?.result
                if (!!text) {
                  processCSV(text as string)
                }
              }

              reader.readAsText(file.file)
            }}
            accept={acceptedFormats.csvOnly}
            content={
              <Flex>
                <Icon icon="uploadAlt" color="primary" iconSize={14} />
                <ButtonText sx={{ border: 'none', ml: 1 }} label="CSV file" />
              </Flex>
            }
          />
        </Flex>
        {!!fileState.length && (
          <Box sx={{ mt: 4 }}>
            {fileState.map((f, index) => {
              const invalid = !validFileType(f, acceptedFormats.csvOnly)
              return (
                <React.Fragment key={index}>
                  <FileItem
                    sx={{ my: 3 }}
                    file={f}
                    onDelete={() => {
                      setFileState(fileState.filter((_, idx) => idx !== index))
                      setCompanyIds([])
                    }}
                    invalid={invalid}
                  />

                  {invalid && (
                    <Flex>
                      <Icon icon="alert" color="white" background="red" size="tiny" />
                      <Paragraph sx={{ ml: 2, color: 'red' }}>Only accept .csv file</Paragraph>
                    </Flex>
                  )}
                </React.Fragment>
              )
            })}
          </Box>
        )}
        <Button
          sx={{ mt: 3, color: 'primary' }}
          icon="download2"
          iconLeft
          label=".csv template"
          variant="outline"
          color="primary"
          onPress={() => {
            exportIdsCsv()
          }}
        />
        <Divider opacity={0.3} my={4} />
      </>
    ),
    [fileState, setFileState, processCSV, setCompanyIds]
  )

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', mb: 6 }}>
        <Search
          onSearch={onSearch}
          onChange={onChangeSearch}
          sx={{ visibility: 'hidden', py: 0, px: 2, bg: 'gray03', minWidth: 300 }}
          size="tiny"
          value={state.search}
          placeholder={copy.placeholder.search}
        />
        <Flex sx={{ alignItems: 'center' }}>
          <Icon icon="sort" color="text" sx={{ mr: 2 }} />
          <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Sort by</Label>
          <Dropdown
            sx={{ minWidth: 262, mr: 3 }}
            name="sortBy"
            value={sortBy.field}
            options={[{ label: 'Name', value: 'name' }, ...columnsFilter]}
            onChange={e => {
              const newSortBy = { ...sortBy, field: e.currentTarget.value }
              const newPagination = { ...pagination, page: 1 }
              gotoPage(newPagination, newSortBy)
            }}
          />
          <Dropdown
            name="sortBy"
            options={[
              { label: 'DESC', value: SortDirection.DESC },
              { label: 'ASC', value: SortDirection.ASC },
            ]}
            value={sortBy.direction}
            onChange={e => {
              const newSortBy = { ...sortBy, direction: e.currentTarget.value }
              const newPagination = { ...pagination, page: 1 }
              gotoPage(newPagination, newSortBy)
            }}
          />
          <Button
            onPress={() => {
              setFilterVisible(true)
            }}
            sx={{ color: 'primary', ml: 3, px: 18 }}
            icon="filter"
            variant="outline"
            label={copy.buttons.filter}
            color="black50"
            iconLeft
          />
        </Flex>
      </Flex>
      <Drawer visible={filterVisible}>
        <FilterTemplate
          key={key}
          onClose={() => {
            setFilterVisible(false)
            revertFilterChange()
          }}
          resetFilter={() => {
            setFilterVisible(false)
            resetFilter()
            setFileState([])
            setKey(key + 1) // re-render UI when reset filter
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                setFilterVisible(false)
                refetchAPI()
              },
              sx: { px: 16, py: 2, borderRadius: 8 },
            },
          ]}
        >
          {loading ? (
            <Updating loading />
          ) : (
            <>
              {memoOverview}
              {memoKeyword}
              {memoGeography}
              {memoFinancing}
              {memoMnA}
              {memoIpo}
              {memoAttachment}
              {memoSource}
              {memoUpload}
            </>
          )}
        </FilterTemplate>
      </Drawer>
    </>
  )
}
export default CompanyFilter
