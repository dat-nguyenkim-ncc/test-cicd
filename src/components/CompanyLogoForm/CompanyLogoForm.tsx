import React, { useRef, useState } from 'react'
import { Flex, Slider, Image, Box } from 'theme-ui'
import AvatarEditor from 'react-avatar-editor'
import md5 from 'md5'
import { Icon, ButtonText, CompanyLogo, ReasonTextField } from '..'
import { LogoState } from '../../pages/CompanyForm/CompanyForm'
import { FileState } from '../../types'
import { Paragraph, Heading } from '../primitives'
import { ReasonTextFieldProps } from '../UpdateCompanyField/ReasonTextField'
import { UploadFileInput } from '../UploadFile'
import Modal from '../Modal'
import strings from '../../strings'
import imageFileToBase64, { convertBase64ToFile } from '../../utils/imageFileToBase64'
import { convertDataURIToBinary } from '../../pages/CompanyForm/helpers'
import { checkLimitFileSize } from '../../utils/acceptedFileTypes'

import logoPlaceholder from '../CompanyLogo/logo.png'

type Props = {
  state: LogoState[]
  logo: string
  reasonRequired?: boolean
  hideReason?: boolean
  invalidImage: boolean
  setInvalidImage(state: boolean): void
  onChangeFile(image: LogoState): void
} & ReasonTextFieldProps

const initScale = {
  scale: 1,
  min: 1,
  max: 5,
}

const CompanyLogoForm = function ({
  state,
  onChangeFile,
  reason,
  setReason,
  reasonRequired,
  logo,
  hideReason = false,
  invalidImage,
  setInvalidImage,
}: Props) {
  const initialState = useRef(state)
  const lastValidState = useRef(state)
  const cropEditor = useRef<AvatarEditor>(null)

  const [openCropModal, setOpenCropModal] = useState(false)
  const [cropScale, setCropScale] = useState(initScale)

  const handleChangeImage = async (files: FileState[]) => {
    try {
      const [file] = files
      if (!checkLimitFileSize(file.file)) {
        throw new Error('Image size must be less than 2MB')
      }
      const image = await imageFileToBase64(file, { cropToSquare: false })
      onChangeFile(image)
      const minScale = 1 / Math.max(image.width / image.height, image.height / image.width)
      setCropScale({
        ...initScale,
        min: minScale,
        scale: minScale,
      })
      setOpenCropModal(true)
      if (invalidImage) {
        setInvalidImage(false)
      }
    } catch (error) {
      const [file] = initialState.current
      onChangeFile(file)
      setInvalidImage(error)
      setCropScale(initScale)
    }
  }

  const handleSubmitCropImage = () => {
    if (cropEditor.current) {
      const [file] = state
      const canvas = cropEditor.current.getImage()
      const url = canvas.toDataURL('image/png')
      const uint = convertDataURIToBinary(url)
      const newFile = { ...file, file: convertBase64ToFile(url, file.file) }
      const image = {
        ...newFile,
        src: url,
        hash: md5(uint),
      }
      onChangeFile(image)
      lastValidState.current = [image]
      setOpenCropModal(false)
      setCropScale(initScale)
    }
  }

  return (
    <>
      <UploadFileInput
        files={state}
        onChangeFile={handleChangeImage}
        accept={['.jpg', '.jpeg', '.png']}
        content={
          <Flex sx={{ justifyContent: 'flex-end' }}>
            <Icon icon="uploadAlt" color="primary" iconSize={14} />
            <ButtonText sx={{ border: 'none', ml: 1 }} label="Choose file" />
          </Flex>
        }
      />
      <Flex sx={{ justifyContent: 'center', p: 3 }}>
        <CompanyLogo src={(state[0]?.src as string) || logo} />
      </Flex>
      {invalidImage && (
        <Paragraph sx={{ flex: 1, color: 'red' }}>
          Image must be valid (JPG/JPEG/PNG) and less than 2MB
        </Paragraph>
      )}
      {!hideReason && (
        <ReasonTextField reason={reason} setReason={setReason} required={reasonRequired} />
      )}
      {!invalidImage && openCropModal && (
        <Modal
          sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '300px' }}
          buttons={[
            {
              label: strings.common.cancel,
              type: 'secondary',
              sx: { p: '10px 60px' },
              action: () => {
                setOpenCropModal(false)
                const [file] = lastValidState.current
                onChangeFile(file)
                setInvalidImage(false)
                setCropScale(initScale)
              },
            },
            {
              label: strings.common.ok,
              type: 'primary',
              sx: { p: '10px 60px' },
              action: handleSubmitCropImage,
            },
          ]}
        >
          <Heading as="h4" sx={{ fontWeight: 300, mb: 4 }}>
            Adjust image
          </Heading>
          <Flex sx={{ justifyContent: 'center', p: 3, width: '100%' }}>
            <AvatarEditor
              ref={cropEditor}
              image={state[0]?.src as string}
              scale={cropScale.scale}
            />
          </Flex>
          <Flex sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Box padding={3}>
              <Image src={logoPlaceholder} width={15} height={15} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Slider
                defaultValue={cropScale.scale}
                onChange={e => setCropScale({ ...cropScale, scale: Number(e.target.value) })}
                min={cropScale.min}
                max={cropScale.max}
                step={0.1}
              />
            </Box>
            <Box padding={3}>
              <Image src={logoPlaceholder} width={20} height={20} />
            </Box>
          </Flex>
        </Modal>
      )}
    </>
  )
}

export default CompanyLogoForm
