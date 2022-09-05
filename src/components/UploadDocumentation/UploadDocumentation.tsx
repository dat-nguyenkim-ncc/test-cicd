import React, { PropsWithChildren, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Button, Dropdown, Icon, Modal } from '..'
import { ChangeFieldEvent, FieldStates, FileState, ViewInterface } from '../../types'
import strings from '../../strings'
import { acceptedFormats } from '../../utils'
import { Heading, Paragraph } from '../primitives'
import TextField from '../TextField'
import { v4 as uuidv4 } from 'uuid'
import {
  FieldNameKeys,
  getFieldVariants,
  getMagicBytesOfFile,
  validAttachmentType,
} from '../../pages/CompanyForm/helpers'
import {
  acceptAttachmentType,
  attachmentTypeOptions,
  attachmentTypeWarning,
  EnumFileType,
} from '../../pages/CompanyManagement/CompanyFilter/helpers'
import { EnumAttachmentType } from '../../types/enums'

export type UploadDocumentationProps = PropsWithChildren<
  ViewInterface<{
    onChangeFile(e: FileState[]): void
    disabled?: boolean
    setErrorAttachment(e: FieldNameKeys[]): void
    files: FileState[]
    hideLabel?: boolean
  }>
>

export const getAttachmentType = (type: string) => {
  return Object.keys(acceptAttachmentType).find(key =>
    acceptAttachmentType[key as EnumFileType].includes(type as EnumAttachmentType)
  )
}

export const maxlength = {
  name: 256,
  description: 4000,
}

const UploadDocumentation = ({
  sx,
  onChangeFile: setFiles,
  files,
  children,
  disabled,
  hideLabel = false,
  setErrorAttachment,
}: UploadDocumentationProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const refFile = useRef<HTMLInputElement>(null)
  const [modalWarningVisible, setModalWarningVisible] = useState<boolean>(false)
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: 'Warning',
    content: '',
  })
  const [errorFiles, setErrorFiles] = useState<string[]>([])

  const onFile = () => {
    refFile?.current?.click()
  }

  useEffect(() => {
    setErrorAttachment((!!errorFiles.length ? ['attachment'] : []) as FieldNameKeys[])
  }, [errorFiles, setErrorAttachment])

  const onFileChange = async (event: SyntheticEvent) => {
    if (refFile.current?.files?.length) {
      const arrFiles = await Promise.all(
        Array.from(refFile.current.files).map(async e => ({
          fileId: uuidv4(),
          file: e,
          name: e.name.slice(0, e.name.lastIndexOf('.')),
          description: '',
          type: '',
          magicBytes: await getMagicBytesOfFile(e, event),
        }))
      )
      setFiles([...files, ...arrFiles])
      const target = event.target as HTMLInputElement
      if (target) {
        target.value = ''
      }
    }
  }

  const onFieldChange = (e: ChangeFieldEvent, index: number) => {
    const { name, value } = e.target
    const cloneState = [...files]
    cloneState[index] = { ...cloneState[index], [name]: value }
    setFiles(cloneState)
  }

  const onRemoveItem = (index: number) => {
    if (!files) return
    const newFileList = files.slice()
    newFileList.splice(index, 1)
    const newErrorFiles = errorFiles.filter(item => item !== files[index].fileId)
    setErrorFiles(newErrorFiles)
    setFiles(newFileList)
  }

  const validate = (value: string, maxlength: number): keyof FieldStates => {
    if (!value.length) return 'default'
    return getFieldVariants({ maxlength: maxlength }, value) === 'error' ? 'error' : 'validated'
  }

  const validateType = (file: FileState, type: string) => {
    return validAttachmentType(file, type)
  }

  return (
    <>
      <input
        ref={refFile}
        type="file"
        multiple
        hidden
        accept={acceptedFormats.documentation.toString()}
        onChange={onFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <Box sx={sx}>
        {!hideLabel && (
          <Paragraph sx={{ mb: 4 }} bold>
            {copy.fieldTitles.attachments}
          </Paragraph>
        )}
        {children}
        {files && (
          <Box mb={4} sx={{ mb: 4 }}>
            {files.map((f, index) => {
              const checkType =
                !errorFiles.includes(f.fileId) &&
                files.filter(
                  ({ type }) => !!type && type !== EnumAttachmentType.OTHER && type === f.type
                ).length < 2

              return (
                <Box
                  key={index}
                  sx={{
                    bg: 'gray03',
                    my: 3,
                    borderRadius: 10,
                    p: 4,
                    border: checkType ? null : '1px solid red',
                  }}
                >
                  <Flex>
                    <Paragraph sx={{ flex: 1 }}>{f.file.name}</Paragraph>
                    <Button
                      onPress={() => {
                        onRemoveItem(index)
                      }}
                      icon="remove"
                      size="tiny"
                      variant="black"
                    />
                  </Flex>
                  {errorFiles.includes(f.fileId) && (
                    <Paragraph sx={{ flex: 1, color: 'red' }}>
                      {f.type
                        ? `${f.type} must be a valid ${getAttachmentType(f.type)} file`
                        : `Please select file type`}
                    </Paragraph>
                  )}
                  <Grid columns={'1fr 1fr'} gap={2} mt={3}>
                    <Box>
                      <TextField
                        placeholder="File name"
                        name="name"
                        colorInput="gray01"
                        onChange={e => onFieldChange(e, index)}
                        value={f.name}
                        fieldState={!f.name ? 'error' : validate(f.name, maxlength.name)}
                        disabled={disabled}
                      />
                    </Box>
                    <Box>
                      <Dropdown
                        name="type"
                        placeholder="Select"
                        colorInput="gray01"
                        value={f.type}
                        options={attachmentTypeOptions}
                        onChange={e => {
                          const value = e.target.value
                          const cloneError = [...errorFiles].filter(id => id !== f.fileId)
                          if (attachmentTypeWarning.includes(value)) {
                            setMessage({
                              ...message,
                              content:
                                'The attached file will become live on the FCT portal - please ensure it does not contain any confidential company information',
                            })
                            setModalWarningVisible(true)
                          }
                          if (!validateType(f, value)) cloneError.push(f.fileId)
                          setErrorFiles(cloneError)
                          onFieldChange(e, index)
                        }}
                        onBlur={() => {
                          if (
                            !f.type ||
                            (!validateType(f, f.type) && !errorFiles.includes(f.fileId))
                          ) {
                            setErrorFiles([...errorFiles, f.fileId])
                          }
                        }}
                        variant={checkType ? undefined : 'error'}
                        disabled={disabled}
                      />
                    </Box>
                  </Grid>
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      placeholder="Description"
                      name="description"
                      type="textarea"
                      colorInput="gray01"
                      onChange={e => onFieldChange(e, index)}
                      value={f.description}
                      fieldState={validate(f.description, maxlength.description)}
                      disabled={disabled}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}

        <Paragraph sx={{ mb: 4 }}>{copy.fields.uploadBody}</Paragraph>
        <Button
          label={copy.buttons.upload}
          variant="primary"
          onPress={onFile}
          disabled={disabled}
        />

        {modalWarningVisible && (
          <Modal
            buttons={[
              {
                label: copy.buttons.ok,
                type: 'primary',
                action: () => {
                  setModalWarningVisible(false)
                },
              },
            ]}
          >
            <Flex>
              <Icon icon="alert" size="small" background="red" color="white" />
              <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                {message.title}
              </Heading>
            </Flex>
            <Paragraph center sx={{ mt: 3, fontSize: 16, lineHeight: '25px' }}>
              {message.content}
            </Paragraph>
          </Modal>
        )}
      </Box>
    </>
  )
}

export default UploadDocumentation
