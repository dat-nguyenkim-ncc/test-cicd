import React from 'react'
import { Box } from '@theme-ui/components'
import { v4 as uuidv4 } from 'uuid'
import { getMagicBytesOfFile, getThumbnailOfPdf } from '../../../pages/CompanyForm/helpers'
import { FileState, ViewInterface } from '../../../types'
import { acceptedFormats } from '../../../utils'

type Props = ViewInterface<{
  onChangeFile(e: FileState[]): void
  disabled?: boolean
  files: FileState[]
  content: React.ReactElement
  accept?: string[]
  multiple?: boolean
}>

export type { Props as UpdaloadFileProps }

const UploadFile = (props: Props) => {
  const refFile = React.useRef<HTMLInputElement>(null)

  const onFile = () => {
    refFile?.current?.click()
  }

  const onFileChange = async (event: React.FormEvent<HTMLInputElement>) => {
    if (refFile.current?.files?.length) {
      const arrFiles = await Promise.all(
        Array.from(refFile.current.files).map(async e => {
          const id = uuidv4()
          return {
            fileId: id,
            file: e,
            name: e.name.slice(0, e.name.lastIndexOf('.')),
            description: '',
            type: '',
            magicBytes: acceptedFormats.csv.includes(e.type)
              ? ''
              : await getMagicBytesOfFile(e, event),
            thumbnail: await getThumbnailOfPdf(e, id, event),
          }
        })
      )

      props.onChangeFile(props.multiple ? [...props.files, ...arrFiles] : arrFiles)
      const target = event.currentTarget
      if (target) {
        target.value = ''
      }
    }
  }

  return (
    <Box sx={props.sx}>
      <input
        ref={refFile}
        type="file"
        multiple={props.multiple}
        hidden
        accept={props.accept?.toString() || ''}
        onChange={onFileChange}
        style={{ display: 'none' }}
        disabled={props.disabled}
      />
      <Box onClick={onFile}>{props.content}</Box>
    </Box>
  )
}

export default UploadFile
