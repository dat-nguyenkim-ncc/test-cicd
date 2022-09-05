import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TabMenuCategories, { TabMenuCategoriesProps } from './TabMenuCategories'
import { Section } from '../primitives'

export default {
  title: 'Primitives/TabMenuCategories',
  component: TabMenuCategories,
  parameters: { layout: 'fullscreen' },
} as Meta

const Template: Story<TabMenuCategoriesProps> = args => (
  <Section>
    <TabMenuCategories {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  buttons: [
    { label: 'PRIMARY', onClick: () => {}, active: true },
    { label: 'AUXILIARY', onClick: () => {}, active: false },
  ],
} as TabMenuCategoriesProps
