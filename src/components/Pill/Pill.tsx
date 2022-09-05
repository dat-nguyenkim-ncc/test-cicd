import React from 'react'
import { Box } from 'theme-ui'
import flags from 'country-code-emoji'
import { Paragraph } from '../primitives'
import { ViewInterface } from '../../types'

export type PillProps = ViewInterface<{
  variant?: keyof typeof variants
  label?: string
  flag?: string
  alt?: string | null
  icon?: string
}>

const variants = {
  primary: {
    bg: 'primary',
    color: 'white',
  },
  muted: {
    bg: 'gray04',
    color: 'text',
  },
  flag: {
    bg: 'white',
    color: 'text',
  },
  out: {
    bg: 'transparent',
    borderColor: 'primary',
    color: 'primary',
    borderWidth: 1,
    borderStyle: 'solid',
  },
}

export const mapIcon: Record<string, string> = {
  fintech: 'Fi',
  insurtech: 'In',
  regtech: 'Re',
  out: 'Out',
  Duplicated: 'Du',
}

const Pill = ({ alt, variant = 'primary', label, flag, icon, sx }: PillProps) => {
  let flagEmoji
  try {
    flagEmoji = flags(flag)
  } catch (e) {}

  return (
    <Box
      sx={{
        p: 2,
        maxHeight: '28px',
        minHeight: '28px',
        minWidth: '33px',
        textAlign: 'center',
        borderRadius: 6,
        ...variants[flagEmoji ? 'flag' : variant],
        ...sx,
      }}
    >
      {icon || label ? (
        <Paragraph bold={!!icon} sx={{ mt: '-1px', lineHeight: 1 }}>
          {icon ? mapIcon[icon] || '' : label}
        </Paragraph>
      ) : (
        <>
          {flag && flag.length === 2 && (
            <Box title={alt || ''} sx={{ mt: '-1px', cursor: 'help', maxWidth: '15px' }}>
              {flagEmoji}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default Pill
