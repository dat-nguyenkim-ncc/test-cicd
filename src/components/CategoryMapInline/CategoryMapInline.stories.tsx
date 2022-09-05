import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import CategoryMapInline, { CategoryMapInlineProps } from './CategoryMapInline'

export default {
  title: 'Taxonomy/CategoryMapInline',
  component: CategoryMapInline,
} as Meta

const Template: Story<CategoryMapInlineProps> = args => <CategoryMapInline {...args} />

export const Default = Template.bind({})
Default.args = {
  category: { label: 'Category 1', list: ['Subcategory 1'] },
} as CategoryMapInlineProps
