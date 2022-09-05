import React from 'react'
import { Flex, Box } from 'theme-ui'
import { Icon, ButtonText, ReasonTextField } from '..'
import { AcceptedType } from '../../pages/CompanyForm/helpers'
import { FileState } from '../../types'
import { FileItem } from '../FileItem'
import { Paragraph } from '../primitives'
import { ReasonTextFieldProps } from '../UpdateCompanyField/ReasonTextField'
import { UploadFileInput } from '../UploadFile'

type Props = {
  state?: FileState
  reasonRequired?: boolean
  hideReason?: boolean
  invalid: boolean
  onChangeFile(file: FileState[]): void
  acceptTypes: AcceptedType
} & ReasonTextFieldProps

const UpdateFileForm = function ({
  state,
  onChangeFile,
  reason,
  setReason,
  reasonRequired,
  hideReason = false,
  invalid,
  acceptTypes,
}: Props) {
  return (
    <>
      <UploadFileInput
        files={state ? [state] : []}
        onChangeFile={onChangeFile}
        accept={acceptTypes.format}
        content={
          <Flex sx={{ justifyContent: 'flex-end' }}>
            <Icon icon="uploadAlt" color="primary" iconSize={14} />
            <ButtonText sx={{ border: 'none', ml: 1 }} label="Choose file" />
          </Flex>
        }
      />
      {!!state && (
        <Box sx={{ mt: 4 }}>
          <FileItem
            sx={{ my: 3 }}
            file={state}
            onDelete={() => {
              onChangeFile([])
            }}
            invalid={invalid}
          />
        </Box>
      )}
      {invalid && (
        <Paragraph sx={{ flex: 1, mt: 4, color: 'red' }}>{acceptTypes.invalidText}</Paragraph>
      )}
      {!hideReason && (
        <ReasonTextField reason={reason} setReason={setReason} required={reasonRequired} />
      )}
    </>
  )
}

export default UpdateFileForm
