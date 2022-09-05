import { Box, Text } from '@theme-ui/components'
import React, { useState } from 'react'
import { Popover } from '..'
import { Palette } from '../../theme'
import { ViewInterface } from '../../types'
import { reasonPopverZIndex } from '../../utils/consts'
import { SxStyleProp } from 'theme-ui'

const INNER_WIDTH = 250
const URL = 'https://'

type TooltipProps = ViewInterface<{
  content: string
  disabled?: boolean
  id?: string
  isShow?: boolean
  isWhite?: boolean
  divSx?: SxStyleProp
  contentSx?: SxStyleProp
  containerSx?: Partial<CSSStyleDeclaration>
  numberOfTextLine?: number
}>

const Tooltip = ({
  sx,
  contentSx,
  children,
  content,
  disabled,
  id,
  isShow,
  isWhite,
  containerSx,
  numberOfTextLine,
  ...props
}: TooltipProps) => {
  const [isOpen, setOpen] = useState<boolean>(false)

  const cid = React.useMemo(() => id?.toLowerCase().split(' ').join('-'), [id])

  const onOpen = (value: boolean) => {
    if (value !== isOpen) {
      setOpen(value)
    }
  }
  return (
    <>
      <>
        <Box
          sx={{ ...contentSx }}
          onMouseEnter={() => {
            if (disabled) return
            if (isShow) {
              onOpen(true)
              return
            }
            if (!cid) {
              return
            }
            const el = document.getElementById(cid)?.offsetWidth
            const elNowrap = document.getElementById(`${cid}-nowrap`)?.offsetWidth

            if (
              el &&
              elNowrap &&
              (cid.includes(URL) ? elNowrap + INNER_WIDTH : elNowrap) >
                (numberOfTextLine ? el * numberOfTextLine : el)
            ) {
              onOpen(true)
            }
          }}
          onMouseLeave={() => {
            onOpen(false)
          }}
        >
          <Box id={cid}>{children}</Box>
        </Box>
        <Box
          id={`${cid}-nowrap`}
          sx={{
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            position: 'fixed',
            zIndex: -1,
          }}
        >
          {children}
        </Box>
      </>
      {isOpen && (
        <Popover
          {...props}
          divSx={{ overflow: 'hidden', textOverflow: 'ellipsis', ...props.divSx }}
          containerStyle={containerSx}
          zIndex={reasonPopverZIndex}
          open={!disabled && isOpen}
          setOpen={() => {}}
          positions={['bottom', 'top']}
          align="start"
          noArrow
          content={
            <Box
              sx={{
                mt: 3,
                p: 3,
                bg: isWhite ? 'white' : 'black',
                border: `solid 1px ${Palette.gray01}`,
                borderRadius: 8,
                ...sx,
              }}
            >
              <Text
                as="p"
                sx={{
                  color: isWhite ? 'black' : 'white',
                  wordBreak: (sx as any)?.wordBreak || 'break-all',
                }}
              >
                {content}
              </Text>
            </Box>
          }
        ></Popover>
      )}
    </>
  )
}
export default Tooltip
