import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import Paragraph, { ParagraphProps } from './'

export default {
  component: Paragraph,
  title: 'Primitives/Paragraph',
  parameters: {
    bold: false,
  },
  argTypes: {
    bold: { control: 'boolean' },
  },
} as Meta

const Template: Story<ParagraphProps> = args => (
  <Paragraph bold={args.bold}>
    Mussum Ipsum, cacilds vidis litro abertis. Todo mundo vê os porris que eu tomo, mas ninguém vê
    os tombis que eu levo! Suco de cevadiss deixa as pessoas mais interessantis. Praesent vel
    viverra nisi. Mauris aliquet nunc non turpis scelerisque, eget. Nullam volutpat risus nec leo
    commodo, ut interdum diam laoreet. Sed non consequat odio.
  </Paragraph>
)

const TemplateHTML: Story<ParagraphProps> = args => (
  <Paragraph bold={args.bold}>
    {`Mussum Ipsum, cacilds vidis litro abertis. Todo mundo vê os porris que eu tomo, mas ninguém vê
    os tombis que eu levo! <a href="https://google.com" target="_blank">Suco de cevadiss</a> deixa as pessoas mais interessantis. Praesent vel
    viverra nisi. [Mauris aliquet](https://bcg.com) nunc non turpis scelerisque, eget. Nullam volutpat risus nec leo
    commodo, ut interdum diam laoreet. Sed non consequat odio.`}
  </Paragraph>
)

export const Default = Template.bind({})
export const Bold = Template.bind({})
Bold.args = {
  bold: true,
} as ParagraphProps
export const WithHTML = TemplateHTML.bind({})
WithHTML.args = {
  bold: true,
} as ParagraphProps
