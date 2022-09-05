import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import DownloadCompanyData, { DownloadCompanyDataProps } from './DownloadCompanyData'
import { Box } from 'theme-ui'
import { categoryOptions, mappingOptions } from './mock'

export default {
  title: 'Widgets/DownloadCompanyData',
  component: DownloadCompanyData,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<DownloadCompanyDataProps> = args => (
  <Box sx={{ p: 7, backgroundColor: 'gray03', width: '100%' }}>
    <DownloadCompanyData {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  categoryOptions,
  mappingOptions,
  onPressDownload: () => {},
  lastUpdated: new Date().toUTCString(),
} as DownloadCompanyDataProps
