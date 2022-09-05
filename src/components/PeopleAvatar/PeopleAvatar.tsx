import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Icon, ButtonText, CompanyLogo } from '..'
import { LogoState } from '../../pages/CompanyForm/CompanyForm'
import { invalidUpdateData } from '../../pages/CompanyForm/helpers'
import { DEFAULT_AVATAR } from '../../pages/CompanyForm/mock'
import strings from '../../strings'
import { ViewInterface } from '../../types'
import CompanyLogoForm from '../CompanyLogoForm'
import Modal from '../Modal'
import { Avatar, Heading, Paragraph } from '../primitives'

type Props = ViewInterface<{
  state: LogoState[]
  image: string
  hashImage?: string
  reasonRequired?: boolean
  hideReason?: boolean
  disabled?: boolean
  isEdit?: boolean
  onChangeFile(state: LogoState, reason: string): void
  square?: boolean
  isOverride: boolean
}>

const PeopleAvatar = ({
  state,
  image,
  hashImage,
  sx,
  disabled,
  isEdit,
  square,
  onChangeFile,
  isOverride,
}: Props) => {
  const cursor = disabled ? 'auto' : 'pointer'
  const imageUrl = (state[0]?.src as string) || image || DEFAULT_AVATAR

  const [imageModalVisible, setImageModalVisible] = React.useState<boolean>(false)
  const [reason, setReason] = React.useState<string>('')
  const [imageState, setImageState] = React.useState<LogoState | undefined>()
  const [invalidImage, setInvalidImage] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(false)

  const handleChangeImage = async (image: LogoState) => {
    setImageState(image)
  }

  return (
    <Box sx={{ ...sx, ml: 1 }}>
      <Flex sx={{ mb: 2 }}>
        {square ? (
          <>
            <CompanyLogo
              variant="addAvatar"
              cursor={cursor}
              src={imageUrl}
              onClick={() => {
                !disabled && setImageModalVisible(true)
              }}
            />
            <Flex
              sx={{
                minWidth: 'fit-content',
                ml: 3,
                mt: 1,
                cursor,
                alignItems: 'start',
              }}
              onClick={() => {
                !disabled && setImageModalVisible(true)
              }}
            >
              <Icon icon="uploadAlt" color="primary" iconSize={14} />
              <ButtonText sx={{ border: 'none', ml: 1, cursor }} label="Choose image" />
            </Flex>
          </>
        ) : (
          <Box
            sx={{ cursor }}
            onClick={() => {
              !disabled && setImageModalVisible(true)
            }}
          >
            <Avatar src={imageUrl} size="48" />
          </Box>
        )}
      </Flex>
      {invalidImage && (
        <Paragraph sx={{ flex: 1, color: 'red' }}>
          Image must be valid (JPG/JPEG/PNG) and less than 2MB
        </Paragraph>
      )}

      {imageModalVisible && (
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
                setImageState(undefined)
                setImageModalVisible(false)
                setReason('')
                setInvalidImage(false)
              },
            },
            {
              label: strings.common.submit,
              type: 'primary',
              sx: { p: '10px 60px' },
              disabled:
                disabled ||
                !imageState ||
                invalidImage ||
                (isEdit &&
                  invalidUpdateData(
                    hashImage || '',
                    imageState?.hash,
                    reason,
                    isOverride,
                    false,
                    false
                  )),
              action: async () => {
                setLoading(true)
                if (imageState) await onChangeFile(imageState, reason)
                setLoading(false)
                setImageModalVisible(false)
              },
            },
          ]}
          updating={loading}
        >
          <Heading sx={{ fontWeight: 300, mb: 4 }} as={'h4'}>
            People Image
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', width: '100%', pr: 12 }}>
            <CompanyLogoForm
              state={imageState ? [imageState] : state}
              onChangeFile={handleChangeImage}
              reason={reason}
              setReason={setReason}
              reasonRequired={!isOverride && isEdit}
              logo={imageUrl}
              hideReason={!isEdit}
              invalidImage={invalidImage}
              setInvalidImage={setInvalidImage}
            />
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default PeopleAvatar
