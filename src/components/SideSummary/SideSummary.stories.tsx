import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import SideSummary, { SideSummaryProps } from './SideSummary'
import { Box } from 'theme-ui'
import { EnumCompanyTypeSector } from '../../types/enums'

export default {
  title: 'Company Details/SideSummary',
  component: SideSummary,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<SideSummaryProps> = args => (
  <Box sx={{ bg: 'white', p: 7 }}>
    <SideSummary {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  content: [
    {
      title: 'CLUSTERS',
      items: [
        { label: 'Fintech', parent: [] },
        { label: 'Retail Accounts' },
        { label: 'Accounts & Savings' },
        { label: 'Digital Banking' },
      ],
      type: EnumCompanyTypeSector.FIN,
    },
  ],
} as SideSummaryProps

export const MultipleTitles = Template.bind({})
MultipleTitles.args = {
  content: [
    {
      title: 'CATEGORIES',
      items: [
        { label: 'Fintech', parent: [] },
        { label: 'Retail Accounts' },
        { label: 'Accounts & Savings' },
        { label: 'Digital Banking' },
      ],
      type: EnumCompanyTypeSector.FIN,
    },
    {
      title: 'SECTORS',
      items: [{ label: 'No sectors mapped' }],
      type: EnumCompanyTypeSector.FIN,
    },
  ],
} as SideSummaryProps
