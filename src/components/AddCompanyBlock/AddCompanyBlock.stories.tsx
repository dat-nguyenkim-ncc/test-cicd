import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import AddCompanyBlock, { AddCompanyBlockProps } from './AddCompanyBlock'

export default {
  title: 'Widgets/AddCompanyBlock',
  component: AddCompanyBlock,
} as Meta

const Template: Story<AddCompanyBlockProps> = args => <AddCompanyBlock {...args} />

export const Default = Template.bind({})
Default.args = {} as AddCompanyBlockProps
