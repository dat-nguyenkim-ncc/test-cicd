import { useApolloClient } from '@apollo/client'
import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, ButtonText, Icon, ReasonTextField } from '..'
import { GET_SIGN_URL_FOR_OTHERS } from '../../pages/CompanyForm/graphql'
import { onError } from '../../sentry'
import strings from '../../strings'
import { FileState, ViewInterface } from '../../types'
import { ENumDataType, EnumSignUrlOperation } from '../../types/enums'
import Modal from '../Modal'
import { Heading, Paragraph } from '../primitives'
import { UploadFile } from '../UploadFile'

export type FileItem = {
  id: string | null
  name?: string
  extension?: string
  isChangeRequest?: boolean
}

type Props = ViewInterface<{
  disabled?: boolean
  isEdit?: boolean
  isOverride?: boolean
  multiple?: boolean
  file: FileItem
  fileState: FileState[]
  handleChangeFile(v: FileState[], b?: boolean): Promise<void> | void
  label: string
  invalidMessage: string
  acceptTypes: string[]
  invalidFn?(f: FileState): boolean
  reason?: string
  setReason?(value: string): void
  reasonRequired?: boolean
  data_type: ENumDataType
}>

const FileModal = ({
  sx,
  disabled,
  file,
  fileState,
  handleChangeFile,
  acceptTypes,
  label,
  invalidFn,
  reason = '',
  setReason = () => {},
  reasonRequired = true,
  multiple,
  invalidMessage,
  data_type,
}: Props) => {
  const client = useApolloClient()

  const [modalVisible, setModalVisible] = React.useState<boolean>(false)
  const [updating, setUpdating] = React.useState<boolean>(false)

  const invalidFile = invalidFn && invalidFn(fileState?.[0])

  const cursor = updating ? 'wait' : 'pointer'

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type,
        operation: EnumSignUrlOperation.GET,
        ids: [value],
        content_types: [],
      }
      const res = await client.query({
        query: GET_SIGN_URL_FOR_OTHERS,
        variables: { input },
        fetchPolicy: 'network-only',
      })
      if (res.data.getOthersSignUrl) {
        window.open(res.data.getOthersSignUrl[0].signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      onError(error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Box sx={{ ...sx, ml: 1 }}>
      <Flex sx={{ py: 2 }}>
        {file?.id ? (
          <Flex
            sx={{
              alignItems: 'start',
              width: '100%',
              bg: 'white',
              px: 3,
              borderRadius: 8,
            }}
          >
            <Paragraph
              onClick={() => {
                !updating && file.id && onDownloadFile(file.id)
              }}
              sx={{ color: 'primary', cursor }}
              bold
            >
              {`${file.name || file.id}${file.extension || ''}`}
            </Paragraph>
            {!file.isChangeRequest && (
              <>
                <Button
                  sx={{ height: 'auto' }}
                  color="primary"
                  variant="invert"
                  icon="pencil"
                  onPress={async () => {
                    setModalVisible(true)
                  }}
                />
                {/* <Button
                  sx={{ height: 'auto' }}
                  color="secondary"
                  variant="invert"
                  icon="close"
                  onPress={async () => {
                    handleChangeFile([])
                    setModalVisible(true)
                  }}
                /> */}
              </>
            )}
          </Flex>
        ) : (
          <Flex
            sx={{
              minWidth: 'fit-content',
              px: 3,
              cursor: updating ? 'wait' : 'default',
              alignItems: 'start',
            }}
            onClick={() => {
              !disabled && setModalVisible(true)
            }}
          >
            <Icon icon="uploadAlt" color="primary" iconSize={14} />
            <ButtonText
              sx={{
                border: 'none',
                ml: 1,
                cursor,
              }}
              label="Choose file"
            />
          </Flex>
        )}
      </Flex>

      {modalVisible && (
        <Modal
          sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '300px' }}
          buttonsStyle={{
            justifyContent: 'flex-end',
            width: '100%',
          }}
          buttons={[
            {
              label: strings.common.cancel,
              type: 'secondary',
              sx: { p: '10px 60px' },
              disabled,
              action: () => {
                setModalVisible(false)
                handleChangeFile([])
                // setReason?.('')
              },
            },
            {
              label: strings.common.submit,
              type: 'primary',
              sx: { p: '10px 60px' },
              disabled: disabled || invalidFile || (!reason && !!setReason && reasonRequired),
              action: async () => {
                await handleChangeFile([...fileState], true)
                setModalVisible(false)
                setReason?.('')
              },
            },
          ]}
          updating={updating}
        >
          <Heading sx={{ fontWeight: 300, mb: 4 }} as={'h4'}>
            Attach File
          </Heading>
          <Box
            sx={{
              maxHeight: '60vh',
              overflow: 'auto',
              width: '100%',
              pr: 12,
              minHeight: reasonRequired ? '220px' : '70px',
            }}
          >
            <UploadFile
              sx={{ mb: 4, width: '100%' }}
              setFileState={handleChangeFile}
              fileState={fileState || []}
              label={label}
              accept={acceptTypes || []}
              invalidFn={invalidFn}
              multiple={multiple}
            />
            {invalidFile && <Paragraph sx={{ flex: 1, color: 'red' }}>{invalidMessage}</Paragraph>}
            {reasonRequired && (
              <ReasonTextField reason={reason} setReason={setReason} required={!!setReason} />
            )}
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default FileModal