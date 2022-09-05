import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailAcquisitions, {
  CompanyDetailAcquisitionsProps,
} from './CompanyDetailAcquisitions'
import { companyAcquisitions } from '../../../../__mock__'
import { Section } from '../../../primitives'

export default {
  title: 'Company Details/CompanyDetailAcquisitions',
  component: CompanyDetailAcquisitions,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<CompanyDetailAcquisitionsProps> = args => (
  <Section sx={{ m: 6, mx: 'auto' }}>
    <CompanyDetailAcquisitions {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  data: { acquisitionRounds: companyAcquisitions(), isExternalViewDetail: true },
} as CompanyDetailAcquisitionsProps
