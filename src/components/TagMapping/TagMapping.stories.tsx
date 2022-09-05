import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import TagMapping, { TagMappingProps } from './TagMapping'
import { Section } from '../primitives'

export default {
  title: 'Taxonomy/TagMapping',
  component: TagMapping,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<TagMappingProps> = args => (
  <Section sx={{ m: 4, margin: 'auto' }}>
    <TagMapping {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Fintech',
  mappings: {
    aux: {
      data: [
        {
          id: '1602162955848',
          value: 'retail_banking',
          label: 'Retail Banking',
          endpoint: true,
          parent: [
            { id: '1602163039764', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162670040', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162616471', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162954943', label: 'Retail Banking', value: 'retail_banking' },
          ],
        },
      ],
    },
    primary: {
      data: [
        {
          id: '1602162955848',
          value: 'retail_banking',
          label: 'Retail Banking',
          endpoint: true,
          parent: [
            { id: '1602163039764', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162670040', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162616471', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162954943', label: 'Retail Banking', value: 'retail_banking' },
          ],
        },
        {
          id: '1602162955848',
          value: 'retail_banking',
          label: 'Retail Banking',
          endpoint: true,
          parent: [
            { id: '1602163039764', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162670040', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162616471', label: 'Corporate Banking', value: 'corporate_banking' },
            { id: '1602162954943', label: 'Retail Banking', value: 'retail_banking' },
          ],
        },
      ],
    },
  },
} as TagMappingProps
