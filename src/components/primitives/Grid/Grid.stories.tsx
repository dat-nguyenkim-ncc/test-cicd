import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Grid, { GridProps } from './Grid'

export default {
  title: 'Primitives/Grid',
  component: Grid,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<GridProps> = args => <Grid {...args} />

export const Default = Template.bind({})
Default.args = {
  children: '',
} as GridProps
