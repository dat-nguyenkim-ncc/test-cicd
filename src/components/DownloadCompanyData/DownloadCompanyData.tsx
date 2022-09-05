import React, { ChangeEvent, useState } from 'react'
import { Flex } from 'theme-ui'
import { FormOption, ViewInterface } from '../../types'
import { Button, Dropdown, Updating } from '../'
import { Heading, Paragraph, Section } from '../primitives'
import strings from '../../strings'

export type StateDownloadData = {
  mapping: string | null
  category: string | null
}

export type DownloadCompanyDataProps = ViewInterface<{
  categoryOptions: FormOption[]
  mappingOptions: FormOption[]
  lastUpdated: string
  loading?: boolean
  onPressDownload(data: StateDownloadData): void
}>

const DownloadCompanyData = ({
  onPressDownload,
  categoryOptions,
  mappingOptions,
  lastUpdated,
  loading,
  sx,
}: DownloadCompanyDataProps) => {
  const { downloadCompanyData: copy } = strings
  const [state, setState] = useState<StateDownloadData>({
    mapping: mappingOptions[0].value ? (mappingOptions[0].value as string) : null,
    category: categoryOptions[0].value ? (categoryOptions[0].value as string) : null,
  })

  const onChangeDropdown = (e: ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, [e.currentTarget.name]: e.currentTarget.value })
  }

  const onDownloadPress = () => {
    onPressDownload(state)
  }

  return (
    <Section sx={sx}>
      <Heading as="h3">{copy.heading}</Heading>
      <Paragraph sx={{ mt: 6, maxWidth: 380 }}>{copy.downloadData}</Paragraph>
      <Flex mt={6} sx={{ justifyContent: 'space-between' }}>
        <Paragraph bold>{copy.filterBy}</Paragraph>
        <Dropdown
          onChange={onChangeDropdown}
          name="category"
          options={categoryOptions}
          label={copy.dropdowns.category}
          value={state.category as string}
        />
        <Flex
          sx={{
            flex: 0.7,
            width: 274,
            height: 76,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {!loading ? (
            <Button
              onPress={onDownloadPress}
              size="big"
              label={copy.downloadButton}
              icon="download"
            />
          ) : (
            <Updating noPadding loading />
          )}
        </Flex>
      </Flex>
    </Section>
  )
}

export default DownloadCompanyData
