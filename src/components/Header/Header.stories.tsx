import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Header, { HeaderProps } from './Header'
import { NavLink } from 'theme-ui'

export default {
  title: 'Primitives/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: Story<HeaderProps> = args => <Header {...args} />

export const Default = Template.bind({})
Default.args = {
  links: [
    <NavLink key="1">Edit Global Taxonomy</NavLink>,
    <NavLink key="2">Add new company</NavLink>,
    <NavLink key="3">Add new entries</NavLink>,
    <NavLink key="4">Download company data</NavLink>,
  ],
  menus: [
    {
      title: 'Management',
      menu: [
        <NavLink key="1">Company Management</NavLink>,
        <NavLink key="2">Change Request Management</NavLink>,
      ],
    },
  ],
  active: '1',
} as HeaderProps
