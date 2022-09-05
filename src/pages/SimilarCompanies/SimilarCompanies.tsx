import { useLazyQuery } from '@apollo/client'
import React, { FormEvent, useState } from 'react'
import { Box } from 'theme-ui'
import { Updating } from '../../components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import strings from '../../strings'
import { Palette } from '../../theme'
import { isCompanyId } from '../../utils'
import { GET_SIMILAR_COMPANIES } from './graphql'
import { searchByOptions, SimilarCompaniesSearch, SimilarCompaniesData } from './helpers'
import SimilarCompaniesDownload from './SimilarCompaniesDownload'
import SimilarCompaniesFilters from './SimilarCompaniesFilters'
import SimilarCompaniesList from './SimilarCompaniesLists'

const initialSearchState: SimilarCompaniesSearch = {
  companyId: '',
  searchBy: searchByOptions[0].value as string,
  total: 30,
  pagination: { page: 1, pageSize: 1000 },
}

const SimilarCompanies = () => {
  const { header } = strings

  const [companies, setCompaniesData] = useState<SimilarCompaniesData[] | undefined>(undefined)

  const [totalResult, setTotalResult] = useState<number>(0)

  const [companiesSelected, setCompaniesSelected] = useState<SimilarCompaniesData[]>([])

  const [errorMessage, setErrorMessage] = useState<string>('')

  const [state, setState] = useState<SimilarCompaniesSearch>(initialSearchState)

  const [manualLoading, setManualLoading] = useState<boolean>(false)

  const [searchCompany, setSearchCompany] = useState<string>(state.companyId)

  //Graphql
  const [
    getSimilarCompanies,
    { loading, error: err, data: getSimilarCompaniesData },
  ] = useLazyQuery(GET_SIMILAR_COMPANIES, {
    fetchPolicy: 'network-only',
    onCompleted() {
      const companiesData = getSimilarCompaniesData?.getSimilarCompanies
      setCompaniesData(
        !!companiesData.data && !!companiesData.data.length
          ? [
              companiesData?.data.find(
                (c: SimilarCompaniesData) => +c.companyId === +searchCompany
              ),
              ...companiesData?.data.filter(
                (c: SimilarCompaniesData) => +c.companyId !== +searchCompany
              ),
            ]
          : []
      )
      setTotalResult(companiesData?.total)
      if (!!companiesSelected) {
        const newCompaniesSelected = companiesSelected.filter(company =>
          companiesData?.data?.some((c: SimilarCompaniesData) => c.companyId === company.companyId)
        )
        setCompaniesSelected(newCompaniesSelected)
      }
      setManualLoading(false)
    },
    onError() {
      setErrorMessage(err?.message || 'Failed to get similar companies')
    },
  })

  const getData = (search: SimilarCompaniesSearch, resetDownload: boolean = true) => {
    setErrorMessage('')
    if (!isCompanyId(search.companyId)) return
    if (resetDownload) {
      setCompaniesSelected([])
    }
    setState(search)
    setSearchCompany(search.companyId)
    setManualLoading(true)
    getSimilarCompanies({
      variables: {
        input: {
          companyId: Number(search.companyId),
          searchBy: search.searchBy,
          total: search.total,
          currentPage: search.pagination.page,
          pageSize: initialSearchState.pagination.pageSize,
        },
      },
    })
  }

  //Search
  const onSearch = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    if (errorMessage?.length) {
      setErrorMessage('')
    }

    getData(state)
  }

  return (
    <Box
      sx={{
        maxWidth: '95vw',
        width: '95vw',
        mx: `calc((-95vw + 1024px)/2)`,
        '@media screen and (min-width: 2560px)': {
          maxWidth: '60vw',
          width: '60vw',
          mx: `calc((-60vw + 1024px)/2)`,
        },
        '@media screen and (min-width: 1920px) and (max-width: 2559px)': {
          maxWidth: '90vw',
          width: '90vw',
          mx: `calc((-90vw + 1024px)/2)`,
        },
      }}
    >
      <Heading as="h2">{header.similarCompanies}</Heading>
      <Section sx={{ mt: 5, p: 5, maxWidth: '100%' }}>
        <SimilarCompaniesFilters
          placeholder="Search similar companies"
          option={searchByOptions}
          state={state}
          setState={setState}
          onSearch={onSearch}
          getData={getData}
        ></SimilarCompaniesFilters>
        {loading || manualLoading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : errorMessage?.length ? (
          <Paragraph bold sx={{ textAlign: 'center', color: Palette.red, p: 20, my: 20 }}>
            {errorMessage.toUpperCase()}
          </Paragraph>
        ) : companies === undefined ? (
          <></>
        ) : !companies?.length ? (
          <Paragraph sx={{ textAlign: 'center', p: 20, my: 20 }}>NO DATA AVAILABLE</Paragraph>
        ) : (
          <>
            <SimilarCompaniesDownload
              totalCompanies={totalResult}
              companiesSelected={companiesSelected}
              setCompaniesSelected={setCompaniesSelected}
            ></SimilarCompaniesDownload>
            <SimilarCompaniesList
              searchCompany={searchCompany}
              data={companies}
              companiesSelected={companiesSelected}
              setCompaniesSelected={setCompaniesSelected}
            ></SimilarCompaniesList>
          </>
        )}
      </Section>
    </Box>
  )
}

export default SimilarCompanies
