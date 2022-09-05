import React from 'react'
import { Flex } from 'theme-ui'
import { ViewInterface } from '../../types'
import Link from '../Link'

export type TabMenuProps = ViewInterface<{
  buttons: { active?: boolean; label: string; to: string; disabled?: boolean }[]
}>

const TabMenu = ({ buttons, sx }: TabMenuProps) => {
  return (
    <Flex sx={sx}>
      {buttons.map((b, index) => (
        <Link
          key={index}
          sx={{
            width: `calc(${100 / buttons.length}% + 10px)`,
            ml: index > 0 ? '-10px' : 0,
            zIndex: b.active ? 10 : 0,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
          }}
          variant={b.active ? 'tabActive' : 'tab'}
          to={b.disabled ? '#' : b.to}
        >
          {b.label}
        </Link>
      ))}
    </Flex>
  )
}

export default TabMenu
