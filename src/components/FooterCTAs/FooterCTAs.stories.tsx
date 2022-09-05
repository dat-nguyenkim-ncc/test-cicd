import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import FooterCTAs, { FooterCTAsProps } from './FooterCTAs'
import { Box } from 'theme-ui'

export default {
  title: 'Search/FooterCTAs',
  component: FooterCTAs,
  parameters: {
    layout: 'padded',
  },
} as Meta

const Template: Story<FooterCTAsProps> = args => (
  <Box sx={{ p: 5, backgroundColor: 'gray03', width: '100%' }}>
    <FooterCTAs {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  buttons: [
    {
      label: 'Button 1',
      onClick: () => {},
    },
    {
      label: 'Button 2',
      variant: 'outlineWhite',
      onClick: () => {},
    },
  ],
} as FooterCTAsProps

export const OnlyOneButton = Template.bind({})
OnlyOneButton.args = {
  buttons: [
    {
      label: 'Button 1',
      onClick: () => {},
    },
  ],
} as FooterCTAsProps
