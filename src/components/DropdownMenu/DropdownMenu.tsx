import React, { useState } from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Button } from '..'
import { ButtonProps, PopoverPositions, ViewInterface } from '../../types'
import { Popover } from 'react-tiny-popover'

export type Props = ViewInterface<{
  buttons: Array<ButtonProps & { isCancel?: boolean }>
  positions?: PopoverPositions[]
  onClickOutSide?(): void
}>

const DropdownMenu = ({ children, sx, buttons, positions, onClickOutSide }: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Popover
        positions={positions}
        isOpen={open}
        onClickOutside={() => {
          setOpen(false)
          onClickOutSide && onClickOutSide()
        }}
        content={({ position, childRect, popoverRect }) => (
          <Box sx={{ borderRadius: 10, mt: 8, ...sx }}>
            {buttons?.map((b, index) => (
              <Button
                key={index}
                sx={{ width: '100%', justifyContent: 'start' }}
                variant={b.type}
                label={b.label}
                onPress={async () => {
                  await b.action()

                  if (b.isCancel) {
                    // onCancelCallBack && onCancelCallBack()
                    setOpen(false)
                  }
                }}
                disabled={b.disabled}
                icon={b.icon}
              />
            ))}
          </Box>
        )}
      >
        <div onClick={() => setOpen(true)}>
          {children || <Button icon="menu" variant="invert" sx={{ width: '100%' }} />}
        </div>
      </Popover>
    </Flex>
  )
}

export default DropdownMenu
