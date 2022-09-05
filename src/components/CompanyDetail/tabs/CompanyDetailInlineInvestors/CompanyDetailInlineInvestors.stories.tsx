import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CompanyDetailInlineInvestors, {
  CompanyDetailInlineInvestorsProps,
} from './CompanyDetailInlineInvestors'

export default {
  title: 'Company Details/CompanyDetailInlineInvestors',
  component: CompanyDetailInlineInvestors,
} as Meta

const Template: Story<CompanyDetailInlineInvestorsProps> = args => (
  <CompanyDetailInlineInvestors {...args} />
)

export const Default = Template.bind({})
Default.args = {
  lead: 'Accel Partners, VC',
  other:
    'Goodwater Capital, VC Orange, Corporate Passion Capital, VC Reference Capital (formerly Genevest), VC Stripe, Tech Thrive Capital, VC Vanderbilt University, Other Y Combinator, Accelerator',
} as CompanyDetailInlineInvestorsProps
