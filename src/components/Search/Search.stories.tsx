import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Search, { SearchProps } from './Search'
import { Box } from 'theme-ui'

export default {
  title: 'Search/Search',
  component: Search,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<SearchProps> = args => (
  <Box sx={{ p: 5, width: '100%', backgroundColor: 'gray03' }}>
    <Search {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Search a Fintech',
} as SearchProps
