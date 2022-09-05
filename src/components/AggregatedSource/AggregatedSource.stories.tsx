import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import AggregatedSource, { AggregatedSourceProps } from './AggregatedSource'
import { Box } from 'theme-ui'
import { companyDetails, companySources } from '../../__mock__'
import { BrowserRouter } from 'react-router-dom'

export default {
  title: 'Search/AggregatedSource',
  component: AggregatedSource,
  parameters: {
    layout: 'padded',
  },
} as Meta

const Template: Story<AggregatedSourceProps> = args => (
  <Box sx={{ bg: 'white', padding: 7 }}>
    <BrowserRouter>
      <AggregatedSource {...args} />
    </BrowserRouter>
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  onCheck: (id: string) => {
    console.log(id)
  },
  company: companyDetails(),
  sources: companySources,
} as AggregatedSourceProps
