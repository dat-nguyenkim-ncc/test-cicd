import { Box, BoxProps } from '@theme-ui/components'
import React from 'react'
import { Flex } from 'theme-ui'
import { ViewDataOverrides, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import ReasonPopover, { ReasonPopoverProps } from '../ReasonPopover'
import Switch, { SwitchProps } from '../Switch/Switch'

export type Props = ViewInterface<
  {
    reasonProps?: Partial<ReasonPopoverProps>
    switchProps: SwitchProps
    onSave(reason: string): Promise<void>
    isLoading?: boolean
    disabled?: boolean
    isHorizontal?: boolean | undefined
  } & ViewDataOverrides
>

export default function ReasonSwitch({
  switchProps,
  viewHistory,
  viewPendingChangeRequest,
  disabled,
  ...props
}: Props) {
  const [reason, setReason] = React.useState('')

  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        ...props.sx,
      }}
    >
      <ReasonPopover
        prefix={!switchProps?.hide ? <Paragraph>Enable</Paragraph> : <></>}
        {...(props.reasonProps as ReasonPopoverProps)}
        sx={
          props.isHorizontal
            ? {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                ...props.reasonProps?.sx,
              }
            : {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                ...props.reasonProps?.sx,
              }
        }
        disabled={disabled || switchProps?.hide}
        viewSx={
          props.isHorizontal
            ? {
                flexDirection: 'column-reverse',
                gap: 1,
                mx: 3,
                justifyContent: 'flex-end',
                flex: 1,
                ...props.reasonProps?.viewSx,
              }
            : {
                flexDirection: 'column-reverse',
                gap: 1,
                mb: 3,
                justifyContent: 'flex-end',
                flex: 1,
                textAlign: 'right',
                ...props.reasonProps?.viewSx,
              }
        }
        reason={reason}
        setReason={setReason}
        viewHistory={viewHistory}
        viewPendingChangeRequest={viewPendingChangeRequest}
        buttons={[
          {
            label: 'Save',
            isCancel: true,
            action: async () => {
              await props.onSave(reason)
              setReason('')
            },
            disabled: props.isLoading,
          },
        ]}
      >
        {!switchProps?.hide && <Switch {...switchProps} disabled={disabled} sx={{ ...switchProps.sx, maxWidth: '53px' }} />}
      </ReasonPopover>
    </Flex>
  )
}

export const Dot = ({ sx, ...boxProps }: ViewInterface<BoxProps>) => (
  <Box
    sx={{
      borderStyle: 'solid',
      borderColor: 'primary',
      backgroundColor: 'primary',
      width: 5,
      height: 5,
      borderRadius: '100%',
      cursor: 'pointer',
      ...sx,
    }}
    {...boxProps}
  />
)
