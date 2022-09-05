import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { FooterCTAs } from '../../components'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import strings from '../../strings'
import { Routes } from '../../types/enums'
import { ViewHistoryProps } from './CompanyForm'
import { GET_USE_CASE_TYPE, GET_COMPANY_USE_CASE, GET_COMPANY_CURRENT_CLIENT } from './graphql'
import CompanyContext from './provider/CompanyContext'
import { CurrentClient, UseCase } from './UseCase'

export type UseCaseTypeResult = {
  useCaseTypeId: number
  useCaseTypeName: string
  isMultiple: boolean
  isFile: boolean
}

export type UseCaseFormProps = {
  info?: React.ReactElement
  isEdit?: boolean
  setError(err: Error): void
} & ViewHistoryProps

const UseCaseFormPage = ({
  isEdit,
  setError,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
}: UseCaseFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings
  const history = useHistory()

  // Context
  const { companyId } = React.useContext(CompanyContext)

  // State
  const [error] = useState('')

  // Graphql
  const { data: types, loading: typeLoading } = useQuery(GET_USE_CASE_TYPE)
  const { data, loading: dataLoading, refetch } = useQuery(GET_COMPANY_USE_CASE, {
    variables: { companyId: +companyId },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  })

  const { data: currentClient, loading: currentClientLoading, refetch: refectCurrentClient } = useQuery(
    GET_COMPANY_CURRENT_CLIENT,
    {
      variables: { companyId: +companyId },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
    }
  )

  const refetchClient = React.useCallback(async () => {
    await refectCurrentClient()
  }, [refectCurrentClient])

  const refetchUseCase = React.useCallback(async () => {
    await refetch()
  }, [refetch])

  return (
    <>
      <CompanyFormsSectionLayout
        title={copy.titles.useCase}
        isLoading={typeLoading && dataLoading && currentClientLoading}
        error={error}
      >
        <CurrentClient
          data={currentClient?.getCompanyCurrentClient?.currentClients || []}
          loading={currentClientLoading}
          isEdit={isEdit}
          refetch={() => {
            refetchClient()
          }}
          showViewHistory={showViewHistory}
          refetchViewHistoryCols={refetchViewHistoryCols}
          setError={setError}
        />
        <UseCase
          types={types?.getUseCaseType || []}
          data={data?.getCompanyUseCase.useCases || []}
          loading={dataLoading}
          refetch={() => {
            refetchUseCase()
          }}
          showViewHistory={showViewHistory}
          refetchViewHistoryCols={refetchViewHistoryCols}
          setError={setError}
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
    </>
  )
}

export default UseCaseFormPage
