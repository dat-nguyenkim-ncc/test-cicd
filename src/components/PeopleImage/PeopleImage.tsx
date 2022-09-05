import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Icon, ButtonText, CompanyLogo } from '..'
import { LogoState } from '../../pages/CompanyForm/CompanyForm'
import { DEFAULT_AVATAR } from '../../pages/CompanyForm/mock'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import { UploadFileInput } from '../UploadFile'
import { UpdaloadFileProps } from '../UploadFile/UploadFileInput/UploadFileInput'

type Props = {
  state: LogoState[]
  image: string
  reasonRequired?: boolean
  hideReason?: boolean
  invalidImage: boolean
  disabled?: boolean
} & ViewInterface<Pick<UpdaloadFileProps, 'onChangeFile'>>

export default function ({ state, onChangeFile, image, invalidImage, sx, disabled }: Props) {
  const cursor = disabled ? 'not-allowed' : 'pointer'
  return (
    <Box sx={{ ...sx, ml: 1 }}>
      <Flex sx={{ mb: 2 }}>
        <CompanyLogo
          variant="addAvatar"
          cursor={cursor}
          src={(state[0]?.src as string) || image || DEFAULT_AVATAR}
        />
        <UploadFileInput
          files={state}
          disabled={disabled}
          onChangeFile={onChangeFile}
          accept={['.jpg', '.png']}
          content={
            <Flex
              sx={{
                minWidth: 'fit-content',
                ml: 3,
                mt: 1,
                cursor,
              }}
            >
              <Icon icon="uploadAlt" color="primary" iconSize={14} />
              <ButtonText sx={{ border: 'none', ml: 1, cursor }} label="Choose image" />
            </Flex>
          }
        />
      </Flex>
      {invalidImage && (
        <Paragraph sx={{ flex: 1, color: 'red' }}>
          {'Logo must be a valid image file (JPG/PNG)'}
        </Paragraph>
      )}
    </Box>
  )
}
