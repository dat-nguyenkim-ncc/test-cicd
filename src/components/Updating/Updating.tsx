import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Paragraph } from '../primitives'
import { motion } from 'framer-motion'
import strings from '../../strings'
import { ViewInterface } from '../../types'

export type UpdatingProps = ViewInterface<{
  loading?: boolean
  noPadding?: boolean
  text?: string
}>

const Motion = motion.custom(Box)

type CircleProps = {
  index: number
}

const Circle = ({ index }: CircleProps) => (
  <Motion
    sx={{
      mx: '2px',
      height: '4px',
      width: '4px',
      borderRadius: '100%',
      backgroundColor: 'primary',
      mt: '-4px',
    }}
    animate={{
      y: '100%',
    }}
    transition={{
      delay: index * 0.5,
      easings: 'easeInOut',
      duration: 0.75,
      repeatType: 'reverse',
      repeat: Infinity,
    }}
  />
)

const Updating = ({ loading, noPadding = false, text, sx }: UpdatingProps) => {
  const { common: copy } = strings

  const loadingStyles = loading
    ? {
        width: '100%',
        pt: noPadding ? 0 : 7,
        justifyContent: 'center',
      }
    : {}
  return (
    <Flex sx={{ alignItems: 'center', ...loadingStyles, ...sx }}>
      <Circle index={0} />
      <Circle index={1} />
      <Circle index={2} />
      <Paragraph bold sx={{ ml: 1, color: 'primary' }}>
        {text || (loading ? copy.loading : copy.updating)}
      </Paragraph>
    </Flex>
  )
}

export default Updating
