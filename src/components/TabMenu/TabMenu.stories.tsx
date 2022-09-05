import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TabMenu, { TabMenuProps } from './TabMenu'
import { BrowserRouter } from 'react-router-dom'
import { Box } from 'theme-ui'

export default {
  title: 'Primitives/TabMenu',
  component: TabMenu,
  parameters: {
    layout: 'padded',
  },
} as Meta

const Template: Story<TabMenuProps> = args => (
  <BrowserRouter>
    <Box sx={{ width: '100%' }}>
      <TabMenu {...args} />
    </Box>
  </BrowserRouter>
)

export const Default = Template.bind({})
Default.args = {
  buttons: [
    { active: true, label: 'Test 1', to: '/' },
    { label: 'Test 2', to: '/' },
    { label: 'Test 2', to: '/' },
    { label: 'Test 2', to: '/' },
    { label: 'Test 2', to: '/' },
    { label: 'Test 2', to: '/' },
  ],
} as TabMenuProps
