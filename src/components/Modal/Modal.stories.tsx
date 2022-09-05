import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Modal, { ModalProps } from './Modal'

export default {
  title: 'Primitives/Modal',
  component: Modal,
} as Meta

const Template: Story<ModalProps> = args => <Modal {...args} />

export const Default = Template.bind({})
Default.args = {
  body: 'This company will be added to the internal database',
  buttons: [{ label: 'Confirm', type: 'primary', action: () => {} }],
} as ModalProps

export const TwoButtons = Template.bind({})
TwoButtons.args = {
  body: `Mussum Ipsum, cacilds vidis litro abertis. Todo mundo vê os porris que eu tomo, mas ninguém vê
  os tombis que eu levo! Suco de cevadiss deixa as pessoas mais interessantis. Praesent vel
  viverra nisi. Mauris aliquet nunc non turpis scelerisque, eget. Nullam volutpat risus nec leo
  commodo, ut interdum diam laoreet. Sed non consequat odio.`,
  buttons: [
    { label: 'Confirm', type: 'primary', action: () => {} },
    { label: 'Cancel', type: 'muted', action: () => {} },
  ],
} as ModalProps
