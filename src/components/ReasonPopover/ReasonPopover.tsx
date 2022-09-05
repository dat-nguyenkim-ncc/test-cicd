import React, { PropsWithChildren } from 'react'
import { Box, Flex, Label, SxStyleProp } from 'theme-ui'
import {
  PopoverPositions,
  ButtonProps,
  Variants,
  ViewInterface,
  ViewDataOverrides,
} from '../../types'
import { reasonPopverZIndex } from '../../utils/consts'
import Popover from '../Popover'
import { PopoverProps } from '../Popover/Popover'
import { Paragraph } from '../primitives'
import { labelColorMapVariants } from '../TextField/TextField'
import UpdateCompanyField from '../UpdateCompanyField'
import ViewOverrideButtons from './ViewOverrideButtons'

export type Props = ViewInterface<
  PropsWithChildren<{
    positions?: PopoverPositions[]
    buttons: Array<ButtonProps & { isCancel?: boolean }>
    showCancel?: boolean
    oldValue: string | number
    newValue: string | number
    setReason: (value: any) => void
    reason?: string
    disabled?: boolean
    label?: string

    variant?: Variants
    name?: string
    error?: string
    required?: boolean
    hasReason?: boolean
    warning?: string
    labelButton?: string
    onCancelCallBack?(): void
    onClickOutSide?(): void
    labelSx?: SxStyleProp
    reasonRequired?: boolean
    callCancelCBAfterAction?: boolean
    viewSx?: SxStyleProp
    suffix?: React.ReactElement | null
    prefix?: React.ReactElement | null
    disablePopover?: boolean
  }>
> &
  Pick<PopoverProps, 'zIndex'> &
  ViewDataOverrides

const ReasonPopover = ({
  oldValue,
  newValue,
  setReason,
  reason = '',
  buttons,
  positions,
  children,
  disabled = false,
  label,
  viewHistory,
  viewPendingChangeRequest,
  variant = 'black',
  name,
  error,
  required,
  hasReason,
  warning,
  labelButton,
  onCancelCallBack,
  onClickOutSide,
  sx,
  labelSx,
  zIndex = reasonPopverZIndex,
  totalItemPendingCR,
  suffix,
  prefix,
  disablePopover = false,
  ...props
}: Props) => {
  const [open, setOpen] = React.useState(false)
  const renderButtons = [
    {
      label: 'Cancel',
      action: () => {
        onCancelCallBack && onCancelCallBack()
      },
      type: 'secondary',
      isCancel: true,
    } as ButtonProps,
    ...(buttons || []).map(b => ({
      ...b,
      disabled: b.disabled || (props.reasonRequired && !reason),
    })),
  ]

  return (
    <Box sx={sx}>
      <Flex>
        {label && (
          <Label sx={{ ...labelSx, color: labelColorMapVariants[variant], flex: 3 }} htmlFor={name}>
            {label}
            {required ? '*' : ''}
            {error && (
              <Paragraph bold sx={{ ml: 3, color: 'red' }}>
                {error}
              </Paragraph>
            )}
          </Label>
        )}
        <ViewOverrideButtons
          sx={props.viewSx}
          disabled={disabled}
          viewPendingChangeRequest={viewPendingChangeRequest}
          viewHistory={viewHistory}
          totalItemPendingCR={totalItemPendingCR}
          callback={() => {
            setOpen(false)
          }}
        />
      </Flex>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        {prefix}
        <Box sx={{ flex: 1 }}>
          <Popover
            open={open}
            setOpen={setOpen}
            onClickOutSide={() => {
              setReason('')
              onClickOutSide && onClickOutSide()
              onCancelCallBack && onCancelCallBack()
            }}
            onCancelCallBack={() => {
              onCancelCallBack && onCancelCallBack()
            }}
            callCancelCBAfterAction={!!props.callCancelCBAfterAction}
            disabled={disabled || disablePopover}
            content={
              <UpdateCompanyField
                newValue={newValue}
                oldValue={oldValue}
                setReason={setReason}
                reason={reason}
                hasReason={hasReason}
                warning={warning}
                reasonRequired={props.reasonRequired}
              />
            }
            positions={positions || (['top', 'right', 'bottom', 'left'] as PopoverPositions[])}
            buttons={renderButtons}
            zIndex={zIndex}
          >
            {children}
          </Popover>
        </Box>
        {suffix}
      </Flex>
    </Box>
  )
}

export default ReasonPopover
