import React from 'react'
import { Box, BoxProps, Flex, SxStyleProp } from 'theme-ui'
import { Variants, ViewInterface } from '../../types'
import { Button } from '../'
import { Paragraph } from '../primitives'
import { Paths } from '../Icon'
import { modalZIndex } from '../../utils/consts'
import Updating from '../Updating'
import { PropsWithChildren } from 'react-router/node_modules/@types/react'

export type ButtonType = {
  label: string
  action(): void
  type: Variants
  disabled?: boolean
  icon?: Paths
  sx?: SxStyleProp
  visible?: boolean
}

export type ModalProps = ViewInterface<{
  buttons?: ButtonType[]
  body?: string
  maxWidth?: number | string
  buttonsStyle?: SxStyleProp
  updating?: boolean
  zIndex?: string
}>

const Modal = ({
  maxWidth = 550,
  buttons,
  body,
  children,
  sx,
  buttonsStyle,
  updating = false,
  zIndex = modalZIndex,
}: ModalProps) => {
  return (
    <Flex
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black50',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: zIndex,
      }}
    >
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'background',
          borderRadius: 10,
          maxWidth: maxWidth,
          p: 7,
          ...sx,
        }}
      >
        {updating ? (
          <Updating sx={{ width: '100%', py: 7, px: 125, justifyContent: 'center' }} />
        ) : !children ? (
          <>
            {body && <Paragraph>{body}</Paragraph>}
            <Flex sx={{ mt: 5 }}>
              {buttons?.map((b, index) => (
                <Button
                  key={index}
                  sx={{ ...b.sx, ml: index === 0 ? 0 : 4 }}
                  variant={b.type}
                  label={b.label}
                  onPress={b.action}
                  disabled={b.disabled}
                  icon={b.icon}
                />
              ))}
            </Flex>
          </>
        ) : (
          <>
            {children}
            {!!buttons?.length && (
              <Flex sx={{ mt: 5, ...buttonsStyle }}>
                {buttons.map((b, index) => {
                  return typeof b.visible === 'undefined' || b.visible === true ? (
                    <Button
                      key={index}
                      sx={{ ...b.sx, ml: index === 0 ? 0 : 4 }}
                      variant={b.type}
                      label={b.label}
                      onPress={b.action}
                      disabled={b.disabled}
                      icon={b.icon}
                    />
                  ) : null
                })}
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default Modal

export const ModalContent = (props: PropsWithChildren<BoxProps>) => {
  return <Box {...props} />
}
