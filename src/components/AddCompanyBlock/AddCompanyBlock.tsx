import React, { useRef } from 'react'
import { Flex } from 'theme-ui'
import { acceptedFormats } from '../../utils'
import { Button } from '../'
import { Heading, Paragraph, Section } from '../primitives'
import strings from '../../strings'
import { ViewInterface } from '../../types'

export type AddCompanyBlockProps = ViewInterface<{
  onPressForm(): void
}>

const AddCompanyBlock = ({ onPressForm, sx }: AddCompanyBlockProps) => {
  const {
    pages: { addCompany: copy },
  } = strings

  const refFile = useRef<HTMLInputElement | null>(null)

  const onFileChange = () => {
    if (refFile.current?.files?.length) {
      console.log(refFile.current.files)
    }
  }

  return (
    <>
      <input
        ref={refFile}
        type="file"
        multiple
        hidden
        accept={acceptedFormats.csv.toString()}
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      <Section sx={sx}>
        <Flex sx={{ justifyContent: 'center' }}>
          <Flex
            sx={{
              justifyContent: 'center',
              borderRadius: 10,
              py: 5,
              px: 6,
              flexDirection: 'column',
              backgroundColor: 'gray02',
              width: `calc(50% - 30px)`,
            }}
          >
            <Heading center sx={{ mb: 4 }} as="h4">
              {copy.options.form.title}
            </Heading>
            <Paragraph center sx={{ mb: 4 }}>
              {copy.options.form.body}
            </Paragraph>
            <Button onPress={onPressForm} variant="primary" label={copy.options.form.button} />
          </Flex>
        </Flex>
      </Section>
    </>
  )
}

export default AddCompanyBlock
