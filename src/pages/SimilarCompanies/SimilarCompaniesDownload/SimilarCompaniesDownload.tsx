import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { Flex, Text } from 'theme-ui'
import { Button, ButtonText } from '../../../components'
import { downloadFileCsv } from '../../../utils/helper'
import { SimilarCompaniesData } from '../helpers'
import CompaniesDownloadModal from './../../../components/CompanyDownloadModal/CompanyDownloadModal'

type SimilarCompaniesListsProps = {
  totalCompanies: number
  companiesSelected: SimilarCompaniesData[]
  setCompaniesSelected: React.Dispatch<React.SetStateAction<SimilarCompaniesData[]>>
}

const defaultFilename = `SimilarCompanies_${moment().format('YYYY-MM-DD_HH-mm-ss')}`

const SimilarCompaniesDownload = ({
  totalCompanies,
  companiesSelected,
  setCompaniesSelected,
}: SimilarCompaniesListsProps) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [filename, setFilename] = useState(defaultFilename)

  const totalSelected = companiesSelected.length

  useEffect(() => {
    if (modalVisible) setFilename(defaultFilename)
  }, [modalVisible])

  const exportToCsv = (rows: SimilarCompaniesData[]) => {
    if (!rows || !rows.length) return
    const keys: string[] = Object.keys(rows[0]).slice(1)
    downloadFileCsv(filename, rows, keys)
    setModalVisible(false)
    setFilename('')
  }

  return (
    <>
      {!!companiesSelected.length && (
        <Flex
          sx={{
            pl: 3,
            py: 3,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Flex>
            <Text sx={{ fontWeight: 'bold' }}>
              {`${totalSelected} / ${totalCompanies} Companies Selected`}
            </Text>
            {totalSelected > 0 && (
              <ButtonText
                sx={{ ml: 3 }}
                onPress={() => {
                  setCompaniesSelected([])
                }}
                label={`Clear all`}
              />
            )}
          </Flex>

          <Button
            sx={{ fontWeight: 'normal' }}
            icon="download"
            label="Download"
            iconLeft
            onPress={() => {
              setModalVisible(true)
            }}
          />
        </Flex>
      )}

      {modalVisible && (
        <CompaniesDownloadModal
          filename={filename}
          setFilename={setFilename}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleAgree={() => exportToCsv(companiesSelected)}
          loading={false}
          title="Download Similar Companies"
        />
      )}
    </>
  )
}

export default SimilarCompaniesDownload
