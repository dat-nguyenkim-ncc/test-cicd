import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import UploadDocumentation, { UploadDocumentationProps } from './UploadDocumentation'
import { Box } from 'theme-ui'

export default {
  title: 'Form Elements/UploadDocumentation',
  component: UploadDocumentation,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<UploadDocumentationProps> = args => (
  <Box sx={{ bg: 'white', p: 6 }}>
    <UploadDocumentation {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {} as UploadDocumentationProps
