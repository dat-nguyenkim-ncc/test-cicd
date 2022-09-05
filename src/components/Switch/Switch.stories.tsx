import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { Box } from 'theme-ui'
import Switch, { SwitchProps } from './Switch'

export default {
  title: 'Primitives/Switch',
  component: Switch,
} as Meta

const Template: Story<SwitchProps> = args => {
  const [checked, setChecked] = React.useState(false)
  return (
    <Box sx={{ width: 44 }}>
      <Switch {...args} checked={checked} onToggle={() => setChecked(!checked)} />
    </Box>
  )
}

export const Default = Template.bind({})
