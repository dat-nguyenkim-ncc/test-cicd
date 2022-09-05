import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Menu, { MenuProps } from './Menu'
import { Box, NavLink } from 'theme-ui'

export default {
  title: 'Primitives/Menu',
  component: Menu,
} as Meta

const Template: Story<MenuProps> = args => (
  <Box sx={{ backgroundColor: 'primary' }}>
    <Menu {...args} />
  </Box>
)

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
} as MenuProps
