import React from 'react'
import { HeadingProps } from 'theme-ui'
import { Story, Meta } from '@storybook/react/types-6-0'
import Heading from './'

export default {
  title: 'Primitives/Heading',
  component: Heading,
  argTypes: {
    as: {
      control: {
        type: 'inline-radio',
        options: ['h1', 'h2', 'h3', 'h4'],
      },
    },
  },
} as Meta

const Template: Story<HeadingProps> = args => <Heading as={args.as as any}>{args.children}</Heading>

export const H1 = Template.bind({})
H1.storyName = 'H1'
H1.args = {
  as: 'h1',
  children: 'Henderson BCG Sans Regular 74px',
} as HeadingProps

export const H2 = Template.bind({})
H2.storyName = 'H2'
H2.args = {
  as: 'h2',
  children: 'Henderson BCG Serif Regular 50px',
} as HeadingProps

export const H3 = Template.bind({})
H3.storyName = 'H3'
H3.args = {
  as: 'h3',
  children: 'Henderson BCG Serif Regular 34px',
} as HeadingProps

export const H4 = Template.bind({})
H4.storyName = 'H4'
H4.args = {
  as: 'h4',
  children: 'Henderson BCG Sans Regular 24px',
} as HeadingProps
