import { Box, Flex } from '@theme-ui/components'
import React, { useState } from 'react'
import { LeadingActions, SwipeableListItem, SwipeAction } from 'react-swipeable-list'
import 'react-swipeable-list/dist/styles.css'
import { Button } from '..'
import { PaletteKeys } from '../../theme'
import { Paragraph } from '../primitives'

type Props = {
  endSwipe(): void
  color?: PaletteKeys
  bgColor?: PaletteKeys
  label?: string
  height?: number
  disabled?: boolean
  destructive?: boolean
}

const SwipeButton = ({
  endSwipe,
  color = 'red',
  bgColor = 'bgRed',
  label = 'Swipe to Delete',
  height = 44,
  disabled,
  destructive = true,
}: Props) => {
  const [isInProgress, setIsInProgress] = useState<boolean>(false)

  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction destructive={destructive} onClick={() => endSwipe()}>
        <Box sx={{ height: height, bg: 'transparent' }}></Box>
      </SwipeAction>
    </LeadingActions>
  )

  return (
    <Box sx={{ bg: bgColor, borderRadius: 10 }}>
      <SwipeableListItem
        blockSwipe={disabled}
        onSwipeProgress={() => {
          if (!isInProgress) {
            setIsInProgress(true)
          }
        }}
        onSwipeEnd={() => {
          setIsInProgress(false)
        }}
        leadingActions={leadingActions()}
        threshold={0.7}
      >
        <Flex
          sx={{
            bg: 'transparent',
            height: height,
            width: '100%',
            justifyContent: 'center',
            borderRadius: 10,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Flex
            sx={{
              bg: color,
              height: height,
              width: '100px',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button sx={{ bg: color }} icon="trash"></Button>
          </Flex>

          <Box sx={{ flex: 1, alignItems: 'center', alignSelf: 'center' }}>
            <Paragraph sx={{ width: '100%', textAlign: 'center', color: color }} bold>
              {label}
            </Paragraph>
          </Box>
        </Flex>
      </SwipeableListItem>
    </Box>
  )
}
export default SwipeButton
