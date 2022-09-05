import React, { useState } from 'react'
import { Box, Flex, Label } from '@theme-ui/components'
import { Checkbox, Icon, Popover } from '..'
import { FormOption, PopoverPositions, Variants, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import { reasonPopverZIndex } from '../../utils/consts'
import { labelColorMapVariants } from '../TextField/TextField'
import { SxStyleProp } from 'theme-ui'
import { Palette, PaletteKeys } from '../../theme'
import { PopoverProps as TinyPopoverProps } from 'react-tiny-popover'

type Props = ViewInterface<{
  id?: string
  label?: string
  labelSx?: SxStyleProp
  divSx?: SxStyleProp
  variant?: Variants
  bg?: PaletteKeys
  options: FormOption[]
  state: Array<string | number>
  positions?: PopoverPositions[]
  onClickOutSide?(): void
  onChange(state: Array<string | number>): void
  popoverProps?: Partial<TinyPopoverProps>
}>

const MultiSelect = ({
  id,
  sx,
  divSx,
  label,
  labelSx,
  variant = 'black',
  bg = 'white',
  options,
  state,
  positions,
  onClickOutSide,
  onChange,
  popoverProps,
}: Props) => {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ width: '100%', ...divSx }}>
      {label && (
        <Label sx={{ color: labelColorMapVariants[variant], flex: 1, ...labelSx }}>{label}</Label>
      )}
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Popover
          isToggle
          positions={positions}
          align={'start'}
          open={open}
          setOpen={setOpen}
          onClickOutSide={() => {
            setOpen(false)
            onClickOutSide && onClickOutSide()
          }}
          content={
            <Box
              sx={{
                borderRadius: 10,
                mt: 1,
                py: 2,
                bg: 'white',
                border: `solid 1px ${Palette.gray01}`,
                width: id ? document.getElementById(id)?.offsetWidth : 'auto',
                maxHeight: 250,
                overflowY: 'auto',
                ...sx,
              }}
            >
              {options.map((o, index) => {
                const isChecked = state.includes(o.value)
                return (
                  <Checkbox
                    key={index}
                    label={o.label}
                    square
                    sx={{ py: 1, px: 3, '&:hover': { bg: 'bgPrimary' } }}
                    onPress={() => {
                      let cloneState = [...state]
                      if (!isChecked) {
                        cloneState.push(o.value)
                      } else {
                        cloneState = cloneState.filter(s => s !== o.value)
                      }
                      onChange(cloneState)
                    }}
                    checked={isChecked}
                  />
                )
              })}
            </Box>
          }
          divSx={{ width: '100%' }}
          zIndex={reasonPopverZIndex}
          noArrow
          popoverProps={popoverProps}
        >
          <Box
            onClick={() => setOpen((prev: boolean): boolean => !prev)}
            id={id}
            sx={{ cursor: 'pointer' }}
          >
            <Flex
              sx={{
                alignItems: 'center',
                width: '100%',
                bg,
                py: 3,
                px: 4,
                borderRadius: 8,
              }}
            >
              <Paragraph sx={{ flex: 1 }}>
                {state.length
                  ? options
                      .filter(o => state.includes(o.value))
                      .map(item => item.label)
                      .join(', ')
                  : 'Select'}
              </Paragraph>
              <Icon icon="indicatorDown" />
            </Flex>
          </Box>
        </Popover>
      </Flex>
    </Box>
  )
}

export default MultiSelect
