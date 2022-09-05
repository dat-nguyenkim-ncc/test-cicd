import React from 'react'
import { Flex } from 'theme-ui'
import { Button } from '../'
import { Variants, ViewInterface } from '../../types'
import { footerZIndex } from '../../utils/consts'

type CTA = {
  label: string
  disabled?: boolean
  onClick?(): void
  variant?: Variants
}

export type FooterCTAsProps = ViewInterface<{
  buttons: CTA[]
}>

const FooterCTAs = ({ buttons, sx }: FooterCTAsProps) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        backgroundColor: 'primary',
        alignItems: 'center',
        borderRadius: 10,
        py: 5,
        mt: 5,
        width: '100%',
        position: 'sticky',
        bottom: 1,
        zIndex: footerZIndex,
        ...sx,
      }}
    >
      {buttons.map((b, index) => (
        <Button
          key={index}
          disabled={b.disabled}
          onPress={b.onClick}
          sx={{ ml: index > 0 ? 4 : 0, width: '290px' }}
          variant={b.variant || 'secondary'}
          label={b.label}
        />
      ))}
    </Flex>
  )
}

export default FooterCTAs
