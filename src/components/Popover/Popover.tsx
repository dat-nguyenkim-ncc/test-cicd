import React, { PropsWithChildren } from 'react'
import {
  ArrowContainer,
  Popover as TinyPopover,
  PopoverProps as TinyPopoverProps,
} from 'react-tiny-popover'
import { Box, Flex, SxStyleProp } from 'theme-ui'
import { ButtonProps, PopoverPositions, PopoverAlign, ViewInterface } from '../../types'
import Button from '../Button'

export type PopoverProps = PropsWithChildren<{
  content: JSX.Element
  positions?: PopoverPositions[]
  buttons?: Array<ButtonProps & { isCancel?: boolean }>
  align?: PopoverAlign
  padding?: number
  showCancel?: boolean
  disabled?: boolean
  onCancelCallBack?(): void
  onClickOutSide?(): void
  noArrow?: boolean
  isToggle?: boolean
  open: boolean
  setOpen(open: boolean): void
  buttonSx?: SxStyleProp
  zIndex?: string
  disableClickOutside?: boolean
  containerStyle?: Partial<CSSStyleDeclaration>
  noFixed?: boolean
  noDefaultWrapper?: boolean
  popoverProps?: Partial<TinyPopoverProps>
  callCancelCBAfterAction?: boolean
  divSx?: SxStyleProp
}>

const tinyProps = {
  positions: ['top', 'right', 'bottom', 'left'] as PopoverPositions[],
  padding: 0,
  boundaryInset: 0,
  reposition: true,
} as TinyPopoverProps

const ButtonsPopover = ({
  buttons,
  setOpen,
  onCancelCallBack,
  sx,
  callCancelCBAfterAction,
}: ViewInterface<
  Pick<PopoverProps, 'buttons' | 'setOpen' | 'onCancelCallBack' | 'callCancelCBAfterAction'>
>) => {
  return (
    <Flex sx={{ justifyContent: 'flex-end', ...sx }}>
      {buttons?.map((b, index) => (
        <Button
          key={index}
          sx={{ ml: index === 0 ? 0 : 4 }}
          variant={b.type}
          label={b.label}
          onPress={async () => {
            await b.action()

            if (b.isCancel) {
              callCancelCBAfterAction && onCancelCallBack && onCancelCallBack()
              setOpen(false)
            }
          }}
          disabled={b.disabled}
          icon={b.icon}
        />
      ))}
    </Flex>
  )
}

function getArrowStyle(position: string, arrowSize = 10) {
  const p = 1
  const zIndex = 1
  const color = 'white'
  switch (position) {
    case 'left':
      return {
        right: p,
        borderLeft: `${arrowSize}px solid ${color}`,
        zIndex,
      }
    case 'right':
      return {
        left: p,
        borderRight: `${arrowSize}px solid ${color}`,
        zIndex,
      }
    case 'bottom':
      return {
        top: p,
        borderBottom: `${arrowSize}px solid ${color}`,
        zIndex,
      }
    default:
      return {
        bottom: p,
        borderTop: `${arrowSize}px solid ${color}`,
        zIndex,
      }
  }
}

const Popover = ({
  children,
  content,
  positions = ['top', 'right', 'bottom', 'left'],
  align = 'center',
  padding = 4,
  buttons = [],
  showCancel = true,
  disabled = false,
  onClickOutSide,
  onCancelCallBack,
  noArrow = false,
  isToggle = false,
  open,
  setOpen,
  buttonSx,
  zIndex,
  disableClickOutside = false,
  divSx,
  ...props
}: PopoverProps) => {
  return (
    <TinyPopover
      {...tinyProps}
      {...props.popoverProps}
      containerStyle={{
        zIndex,
        ...(props.noFixed ? {} : { position: 'fixed' }),
        ...props.containerStyle,
      }}
      positions={positions}
      align={align}
      isOpen={open && !disabled}
      onClickOutside={() => {
        if (disableClickOutside) return
        setOpen(false)
        onClickOutSide && onClickOutSide()
      }}
      content={({ position, childRect, popoverRect }) =>
        noArrow ? (
          <>
            {content}
            <ButtonsPopover
              buttons={buttons}
              onCancelCallBack={onCancelCallBack}
              setOpen={setOpen}
              sx={buttonSx}
              callCancelCBAfterAction={props.callCancelCBAfterAction}
            />
          </>
        ) : (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowColor={'#ddd'}
            arrowSize={12}
          >
            <ArrowContainer
              position={position}
              childRect={childRect}
              popoverRect={popoverRect}
              arrowColor={'#ddd'}
              arrowSize={12}
              style={{
                paddingLeft: 0,
                paddingTop: 0,
                paddingBottom: 0,
                paddingRight: 0,
              }}
              arrowStyle={getArrowStyle(position, 12)}
            >
              {props.noDefaultWrapper ? (
                content
              ) : (
                <Box
                  sx={{
                    background: '#fff',
                    zIndex: 1001,
                    border: '1px solid #ddd',
                    borderRadius: 10,
                    // boxShadow: '0px 1px 4px 0px rgba(222,222,222,0.9)',
                    top: 22,
                    padding: padding || 4,
                  }}
                >
                  {content}
                  <ButtonsPopover
                    buttons={buttons}
                    onCancelCallBack={onCancelCallBack}
                    setOpen={setOpen}
                    sx={buttonSx}
                    callCancelCBAfterAction={props.callCancelCBAfterAction}
                  />
                </Box>
              )}
            </ArrowContainer>
          </ArrowContainer>
        )
      }
    >
      <Box sx={divSx} onClick={() => !isToggle && setOpen(true)}>
        {children}
      </Box>
    </TinyPopover>
  )
}

export default Popover
