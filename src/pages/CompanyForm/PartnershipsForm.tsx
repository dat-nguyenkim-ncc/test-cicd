import React, { useContext, useEffect, useState, useCallback } from 'react'
import { FooterCTAs, Pagination } from '../../components'
import strings from '../../strings'
import { Routes } from '../../types/enums'
import { useApolloClient } from '@apollo/client'
import CompanyContext from './provider/CompanyContext'
import { IPagination, PartnershipGroupType } from '../../types'
import { useHistory, useParams } from 'react-router-dom'
import { Box } from 'theme-ui'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import { onError } from '../../sentry'
import { PartnershipsList } from '../../components/PartnershipsList'
import { GET_COMPANY_PARTNERSHIPS } from './graphql'
import PartnersList from '../../components/PartnersList'
import { Paragraph } from '../../components/primitives'

export type PartnershipsFormProps = {
  info?: React.ReactElement
  isEdit?: boolean
  refetchViewHistoryCols(): void
}

const PartnershipsForm = (props: PartnershipsFormProps) => {
  const client = useApolloClient()
  const { companyId } = useContext(CompanyContext)
  const { cr } = useParams<any>()
  const rowId = cr && decodeURIComponent(cr)
  const history = useHistory()
  const {
    pages: { addCompanyForm: copy },
  } = strings
  const { isEdit } = props

  const [editState, setEditState] = useState<PartnershipGroupType[]>([])
  const [totalPartners, setTotalPartners] = useState<string[]>([])

  const [pagination, setPagination] = useState<IPagination>({ page: 1, pageSize: 10 })
  const [totalResult, setTotalResult] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, _setError] = useState('')
  const setError = (error: Error) => {
    _setError(error?.message || '')
    onError(error)
  }

  const fetchData = useCallback(
    async (pagination: IPagination) => {
      const dataInPage = await client.query({
        query: GET_COMPANY_PARTNERSHIPS,
        variables: {
          companyId: +companyId,
          page: pagination.page,
          pageSize: pagination.pageSize,
          rowId,
        },
        fetchPolicy: 'network-only',
      })
      const res = dataInPage?.data?.getCompanyPartnerships
      setEditState(res?.data || [])
      setTotalPartners(res?.partners || [])
      setTotalResult(res?.total)
    },
    [client, companyId, rowId]
  )

  const refetchData = useCallback(
    async (pgn: IPagination = pagination) => {
      try {
        setIsLoading(true)
        await fetchData(pgn)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchData, pagination]
  )

  useEffect(() => {
    refetchData()
  }, [refetchData])

  const gotoPage = (pagination: IPagination) => {
    const newPagination = { ...pagination, page: pagination.page < 1 ? 1 : pagination.page }
    setPagination(newPagination)
    refetchData(newPagination)
  }

  return (
    <>
      <CompanyFormsSectionLayout title={copy.titles.news} isLoading={isLoading} error={error}>
        {totalResult ? (
          <>
            {isEdit && <PartnersList data={totalPartners} maximumNumberOfShownItems={25} />}

            <Box sx={{ mt: 10 }}>
              <PartnershipsList
                data={editState}
                isEdit
                onChange={(newState: PartnershipGroupType[]) => {
                  setEditState(newState)
                }}
                refetchViewHistoryCols={props.refetchViewHistoryCols}
              />
            </Box>
            <Pagination
              sx={{ justifyContent: 'center' }}
              currentPage={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={Math.ceil(totalResult / pagination.pageSize)}
              changePage={page => {
                gotoPage({ ...pagination, page })
              }}
              changePageSize={pageSize => {
                gotoPage({ page: 1, pageSize })
              }}
            />
          </>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 7 }}>NO DATA AVAILABLE</Paragraph>
        )}
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
    </>
  )
}
export default PartnershipsForm
