import React from 'react'
import { Palette, PaletteKeys } from '../../theme'

type Props = {
  color?: PaletteKeys
}

function Triangle({ color = 'text' }: Props) {
  return (
    <svg width={6} height={7} viewBox="0 0 6 7" fill="none">
      <path
        d="M4.76 2.76L2.706.706C2.077.077.957.478.932 1.342L.817 5.325c-.025.864 1.07 1.33 1.735.737l2.168-1.93a.933.933 0 00.04-1.373z"
        fill={Palette[color]}
      />
    </svg>
  )
}

export default Triangle
