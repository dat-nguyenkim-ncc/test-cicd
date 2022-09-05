import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Section, { SectionProps } from './Section'
import { Box } from 'theme-ui'

export default {
  title: 'Primitives/Section',
  component: Section,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<SectionProps> = args => (
  <Box sx={{ height: '100vh', p: 5, width: '100%', backgroundColor: 'gray03' }}>
    <Section {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  children: 'Section',
} as SectionProps
