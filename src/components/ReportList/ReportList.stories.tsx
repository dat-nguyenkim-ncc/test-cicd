import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import ReportList, { Props } from './ReportList'
import { Section } from '../primitives'

export default {
  title: 'Reports Management/Reporst List',
  component: ReportList,
} as Meta

const Template: Story<Props> = args => (
  <Section>
    <ReportList {...args} />
  </Section>
)

export const Default = Template.bind({})
Default.args = {
  reports: [
    {
      issueNumber: "33",
      name: 'Consumer Electronics Show 2021',
      version: 'Master version',
      publishedDate: '20 Oct, 2021',
      uploadedDate: '25 Oct, 2021',
      expandStatus: 1,
      description: '',
      urlAttachment: '',
    },
    {
      issueNumber: "32",
      name: 'Embedded World 2020',
      version: 'Master version',
      publishedDate: '20 Oct, 2021',
      uploadedDate: '25 Oct, 2021',
      expandStatus: 1,
      description: '',
      urlAttachment: '',
    },
  ],
  onDownload: item => {
    console.log('onDownload', item)
  },
  onEdit: item => {
    console.log('onEdit', item)
  },
} as Props
