import React, { useState } from 'react'
import { Box } from 'theme-ui'
import { CompanyPeople } from '../../../../types'
import { useQuery } from '@apollo/client'
import Updating from '../../../Updating'
import { GET_COMPANY_TRACTIONS } from '../../../../pages/CompanyForm/graphql/companyTractions'
import { TractionsList } from '../../../TractionsList'
import {
  CompanyTractionsFilterType,
  initialTractionsFilter,
} from '../../../../pages/FindFintechs/helpers'
import Pagination from '../../../Pagination'
import CompanyTractionsFilter from './CompanyTractionsFilter'
import moment from 'moment'
import { DATE_FORMAT, TRACTION_DATE_FORMAT } from '../../../../utils/consts'
import { Paragraph } from '../../../primitives'

type Props = {
  data: CompanyPeople
}

const CompanyDetailTractions = ({ data }: Props) => {
  const [filterState, setFilterState] = useState<CompanyTractionsFilterType>({
    ...initialTractionsFilter,
  })

  const [totalCompanies, setTotalCompanies] = useState<number>(0)

  const getDate = (isRange: boolean, date: string) => {
    if (isRange && date) return moment(date, TRACTION_DATE_FORMAT).format(DATE_FORMAT)
    return ''
  }

  const { data: tractionsData, loading } = useQuery(GET_COMPANY_TRACTIONS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !data?.companyId,
    variables: {
      input: {
        companyId: data?.companyId,
        take: filterState.take,
        skip: filterState.take * (filterState.skip - 1),
        topic: filterState.topic,
        dateFrom: getDate(filterState.isRange, filterState.dateFrom),
        dateTo: getDate(filterState.isRange, filterState.dateTo),
        date: getDate(!filterState.isRange, filterState.date),
        isRange: filterState.isRange,
        textSentence: filterState.textSentence,
        activeOnly: true,
      },
    },
    onCompleted() {
      setTotalCompanies(tractionsData?.getCompanyTractions?.total || 0)
    },
  })

  const tractions = tractionsData?.getCompanyTractions?.result || []

  if (loading) return <Updating loading />

  return (
    <Box sx={{ mt: 6, maxWidth: '100%' }}>
      <CompanyTractionsFilter
        filter={filterState}
        setFilterState={setFilterState}
      ></CompanyTractionsFilter>

      {!tractions || !tractionsData?.getCompanyTractions?.result.length ? (
        <Paragraph sx={{ textAlign: 'center', p: 20, my: 40 }}>NO DATA AVAILABLE</Paragraph>
      ) : (
        <>
          <TractionsList data={tractions} />

          <Pagination
            sx={{ justifyContent: 'center' }}
            currentPage={filterState.skip}
            pageSize={filterState.take}
            totalPages={Math.ceil(totalCompanies / filterState.take)}
            changePage={page => {
              setFilterState({ ...filterState, skip: page })
            }}
            changePageSize={pageSize => {
              setFilterState({ ...filterState, take: pageSize, skip: 1 })
            }}
          />
        </>
      )}
    </Box>
  )
}

export default CompanyDetailTractions
