import { useLazyQuery } from '@apollo/client'
import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { Button } from '../../../components'
import strings from '../../../strings'
import { FormOption } from '../../../types'
import { EnumExpandStatusId } from '../../../types/enums'
import { downloadFileCsv } from '../../../utils/helper'
import { CompanyManagementIdsResult, CompanyManagementResult } from '../CompanyFilter/helpers'
import { defaultPagination } from '../CompanyManagement'
import { GET_COMPANY_MANAGEMENT_DATA, GET_COMPANY_MANAGEMENT_IDS } from '../graphql'
import CompaniesDownloadModal from './../../../components/CompanyDownloadModal/CompanyDownloadModal'

const MAX_PAGE_SIZE = 3000

type CompaniesDownloadProps = {
  companyIdsSelected: number[]
  filterCompanyIds: number[]
  totalCompanies: number
  filter: any
  companiesSelected: CompanyManagementResult[]
  columnList: FormOption[]
  isSelectedAll: boolean
  setMessage: React.Dispatch<React.SetStateAction<{ title: string; content: string }>>
}

const defaultFilename = `CompanyManagement_
${moment().format('YYYY-MM-DD_HH-mm-ss')}`

const generateWarning = (hasDuplicated: boolean, hasOut: boolean) => {
  if (!hasDuplicated && !hasOut) return ''
  return `The download you have chosen includes ${
    hasDuplicated && hasOut ? '‘out’ and ‘duplicate’' : hasOut ? '‘out’' : '‘duplicate’'
  }  companies, would you like to continue?`
}

const CompaniesDownload = ({
  isSelectedAll,
  filter,
  columnList,
  setMessage,
  companyIdsSelected,
  totalCompanies,
  filterCompanyIds,
}: CompaniesDownloadProps) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [filename, setFilename] = useState(defaultFilename)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (modalVisible) setFilename(defaultFilename)
  }, [modalVisible])

  const handleExportCsv = (rows: CompanyManagementResult[], _keys?: string[]) => {
    if (!rows || !rows.length) return
    const flatCompanies = rows.map(o => {
      return {
        ...o,
        category: o.category
          ?.filter(i => i.is_primary)
          .map(i => i.name)
          .join(','),
        sector: o.sector
          ?.filter(i => i.is_primary)
          .map(i => i.name)
          .join(','),
        value_chain: o.value_chain
          ?.filter(i => i.is_primary)
          .map(i => i.name)
          .join(','),
        risk: o.risk
          ?.filter(i => i.is_primary)
          .map(i => i.name)
          .join(','),
        cluster: o.cluster
          ?.filter(i => i.is_primary)
          .map(i => i.name)
          .join(','),
      }
    })
    const keys: string[] =
      _keys ||
      Array.from(
        new Set([
          'company_id',
          'name',
          'category',
          'fct_status_id',
          ...columnList.map(e => `${e.value}`),
        ])
      )

    downloadFileCsv(filename, flatCompanies, keys)
    setModalVisible(false)
    setFilename('')
    setWarning('')
  }

  const [getCompanyData, { data: companyData, loading: companyLoading }] = useLazyQuery<{
    getCompanyManagementData: CompanyManagementResult[]
  }>(GET_COMPANY_MANAGEMENT_DATA, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      const hasDuplicated = companyData?.getCompanyManagementData?.some(
        ({ fct_status_id }) => fct_status_id !== EnumExpandStatusId.FOLLOWING
      )
      const hasOut = companyData?.getCompanyManagementData?.some(({ category }) =>
        category?.find(o => o.name === `Out`)
      )
      setWarning(generateWarning(!!hasDuplicated, !!hasOut))
    },
    onError(error) {
      setMessage({
        title: 'Error',
        content: error.message,
      })
    },
  })

  const [getCompanyIds, { loading: companyIdsLoading, data: companyIdsData }] = useLazyQuery<{
    getCompanyIds: CompanyManagementIdsResult
  }>(GET_COMPANY_MANAGEMENT_IDS, {
    fetchPolicy: 'no-cache',
    onCompleted(res) {
      const { hasDuplicated, hasOut } =
        companyIdsData?.getCompanyIds || ({} as CompanyManagementIdsResult)
      setWarning(generateWarning(hasDuplicated, hasOut))
    },
    onError(error) {
      setMessage({
        title: 'Error',
        content: error.message,
      })
    },
  })

  const getDownloadData = () => {
    if (isSelectedAll && totalCompanies > MAX_PAGE_SIZE) {
      getCompanyIds({
        variables: {
          input: {
            filter: isSelectedAll ? filter : undefined,
            companyIds: companyIdsSelected,
          },
        },
      })
      return
    } else {
      getCompanyData({
        variables: {
          input: {
            ...filter,
            selectedColumns: Array.from(
              new Set(['fct_status_id', 'category', ...filter.selectedColumns])
            ),
            companyIds: isSelectedAll ? filterCompanyIds : companyIdsSelected,
            pageNumber: defaultPagination.page,
            pageSize: isSelectedAll ? totalCompanies : companyIdsSelected.length,
          },
        },
      })
    }
  }

  const confirmDownload = () => {
    if (isSelectedAll && totalCompanies > MAX_PAGE_SIZE) {
      const exportData = companyIdsData?.getCompanyIds?.companyIds?.map((c: number) => ({
        company_id: c,
      })) as CompanyManagementResult[]
      handleExportCsv(exportData || [], ['company_id'])
      return
    } else {
      handleExportCsv(companyData?.getCompanyManagementData || [])
    }
  }

  const loading = companyLoading || companyIdsLoading

  return (
    <>
      <Button
        sx={{ fontWeight: 'normal', marginRight: 10 }}
        icon="download"
        label="Download"
        iconLeft
        onPress={() => {
          getDownloadData()
          setModalVisible(true)
        }}
      />

      {modalVisible && (
        <CompaniesDownloadModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleAgree={confirmDownload}
          loading={loading}
          filename={filename}
          setFilename={setFilename}
          warning={warning}
          // validateData={getDownloadData}
          note={`${strings.downloadCompanyData.note.replace('#num', MAX_PAGE_SIZE.toString())}`}
          title="Download Company Management"
        />
      )}
    </>
  )
}

export default CompaniesDownload
