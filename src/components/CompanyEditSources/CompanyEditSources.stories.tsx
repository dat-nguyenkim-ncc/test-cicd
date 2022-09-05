import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyEditSources, { CompanyEditSourcesProps } from './CompanyEditSources'
import { companyDetails, companySources } from '../../__mock__'
import { BrowserRouter } from 'react-router-dom'

export default {
  title: 'Search/CompanyEditSources',
  component: CompanyEditSources,
} as Meta

const Template: Story<CompanyEditSourcesProps> = args => (
  <BrowserRouter>
    <CompanyEditSources {...args} />
  </BrowserRouter>
)

export const Default = Template.bind({})
Default.args = {
  data: companyDetails(),
  sources: companySources,
  onClickBack: () => {},
  onClickSave: () => {},
  onRemoveSource: () => {},
} as CompanyEditSourcesProps
