import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import SearchResultBlock, { onChangeProps, SearchResultBlockProps } from './SearchResultBlock'
import { Box } from 'theme-ui'
import { companyDetails } from '../../__mock__'
import { BrowserRouter } from 'react-router-dom'

export default {
  title: 'Search/SearchResultBlock',
  component: SearchResultBlock,
} as Meta

const Template: Story<SearchResultBlockProps> = args => (
  <Box sx={{ p: 5, width: '100%', backgroundColor: 'gray03' }}>
    <BrowserRouter>
      <SearchResultBlock {...args} />
    </BrowserRouter>
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  heading: 'Internal Database',
  type: 'internal',
  onChange: (event: onChangeProps) => {
    console.log(event)
  },
  list: [
    {
      companyDetails: companyDetails(),
      source: { label: 'Source: XPTO' },
    },
  ],
  state: {},
  onMergeCompany: () => {},
} as SearchResultBlockProps
