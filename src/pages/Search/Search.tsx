import React, { useState } from 'react'
import { useOktaAuth } from '@okta/okta-react'
import { FormSearch, DownloadCompanyData, Modal, Updating } from '../../components'
import { Heading, Paragraph } from '../../components/primitives'
import strings from '../../strings'
import { StateDownloadData } from '../../components/DownloadCompanyData/DownloadCompanyData'
import { Routes } from '../../types/enums'

const PageSearch = () => {
  const {
    pages: { search: copy },
  } = strings

  const { REACT_APP_DOWNLOAD_DATA_ENDPOINT: ENDPOINT, REACT_APP_STAGE } = process.env

  const { authState } = useOktaAuth()
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setIsLoading] = useState(false)

  const [titleModal, setTitleModal] = useState('Success!')
  const [messageModal, setMessageModal] = useState(
    'Your company data report is generated. You will receive it via your email in some minutes'
  )
  const [titleColor, setTitleColor] = useState('green')

  const onPressDownload = async (state: StateDownloadData) => {
    setIsLoading(true)
    if (!ENDPOINT || !REACT_APP_STAGE || !authState.accessToken) {
      setIsLoading(false)
      return
    }
    let url = `${ENDPOINT}/files/${state.category}/data?mapping=${state.mapping}&token=${authState.accessToken}`
    console.log(url)
    fetch(url, {
      method: 'GET',
      mode: 'no-cors',
    }).then(
      () => {
        showModalSuccess()
      },
      error => {
        showModalError(error)
      }
    )
  }

  const showModalSuccess = () => {
    setIsLoading(false)
    setTitleModal('Success!')
    setMessageModal(
      'The data report is being generated. It will be sent to your email address shortly'
    )
    setTitleColor('green')
    setModalVisible(true)
  }

  const showModalError = (error: any) => {
    setIsLoading(false)
    setTitleModal('Error!')
    setMessageModal('An error has occurred. Please try again')
    setTitleColor('red')
    setModalVisible(true)
    console.log(error)
  }

  const onModalConfirm = () => {
    setModalVisible(false)
  }
  // TODO: add props to Download Company Data
  // TODO: retrieve total number of results from BE so we dont have to limit on the FE

  return (
    <>
      <Heading as="h2">{copy.title}</Heading>
      {loading ? (
        <Updating loading />
      ) : (
        <>
          <FormSearch inputId="PageSearch-search-companies" baseUrl={Routes.SEARCH_QUERY} placeholder={copy.placeholder} />
          <DownloadCompanyData
            lastUpdated={new Date().toUTCString()}
            onPressDownload={onPressDownload}
            categoryOptions={copy.categoryOptions}
            mappingOptions={copy.mappingOptions}
          />
        </>
      )}
      {modalVisible && (
        <Modal
          buttons={[
            {
              label: 'OK',
              type: 'primary',
              action: onModalConfirm,
            },
          ]}
        >
          <Heading center as="h4" sx={{ color: titleColor }}>
            {titleModal}
          </Heading>
          <Paragraph center sx={{ mt: 20 }}>
            {messageModal}
          </Paragraph>
        </Modal>
      )}
    </>
  )
}

export default PageSearch
