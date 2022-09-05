import React from 'react'
import { Flex, Label, Box } from 'theme-ui'
import { Icon, ButtonText } from '..'
import { FileState, ViewInterface } from '../../types'
import { FileItem } from '../FileItem'
import { UploadFileInput } from './UploadFileInput'

type Props = ViewInterface<{
  fileState: FileState[]
  setFileState(v: FileState[]): void
  label: string
  accept?: string[]
  multiple?: boolean
  invalidFn?(f: FileState): boolean
}>

const UploadFile = (props: Props) => {
  return (
    <Box sx={{ ...props.sx }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Label sx={{ width: 'auto', m: 0 }}>{props.label}</Label>
        <UploadFileInput
          files={props.fileState}
          onChangeFile={files => {
            props.setFileState(files)
          }}
          multiple={props.multiple}
          accept={props.accept || []}
          content={
            <Flex>
              <Icon icon="uploadAlt" color="primary" iconSize={14} />
              <ButtonText sx={{ border: 'none', ml: 1 }} label="Upload file" />
            </Flex>
          }
        />
      </Flex>
      {!!props.fileState.length && (
        <Box sx={{ mt: 4 }}>
          {props.fileState.map((f, index) => (
            <FileItem
              sx={{ my: 3 }}
              key={index}
              file={f}
              onDelete={() => {
                props.setFileState(props.fileState.filter((_, idx) => idx !== index))
              }}
              invalid={props.invalidFn && props.invalidFn(f)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default UploadFile
