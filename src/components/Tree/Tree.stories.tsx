import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import Tree, { TreeProps, ITree, Node } from './Tree'

const data: ITree = {
  '/root': {
    id: '/root',
    name: '/root',
    isRoot: true,
    children: ['/root/david', '/root/jslancer'],
  },
  '/root/david': {
    id: '/root/david',
    name: '/root/david',
    children: ['/root/david/readme.md'],
  },
  '/root/david/readme.md': {
    id: '/root/david/readme.md',
    name: '/root/david/readme.md',
    content: 'Thanks for reading me me. But there is nothing here.',
  },
  '/root/jslancer': {
    id: '/root/jslancer',
    name: '/root/jslancer',
    children: ['/root/jslancer/projects', '/root/jslancer/vblogs'],
  },
  '/root/jslancer/projects': {
    id: '/root/jslancer/projects',
    name: '/root/jslancer/projects',
    children: ['/root/jslancer/projects/treeview'],
  },
  '/root/jslancer/projects/treeview': {
    id: '/root/jslancer/projects/treeview',
    name: '/root/jslancer/projects/treeview',
    children: [],
  },
  '/root/jslancer/vblogs': {
    id: '/root/jslancer/vblogs',
    name: '/root/jslancer/vblogs',
    children: [],
  },
}

export default {
  title: 'Primitives/Tree',
  component: Tree,
} as Meta

const Template: Story<TreeProps> = args => <Tree {...args} />

export const Default = Template.bind({})
Default.args = {
  data,
  onSelect: (node: Node) => {
    console.log(node)
  },
} as TreeProps
