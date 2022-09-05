import React from 'react'
import { Palette, PaletteKeys } from '../../theme'

type IconParams = {
  color?: PaletteKeys
  bg?: PaletteKeys
  stroke?: PaletteKeys
}

export const Check = ({ color = 'text', bg = 'transparent', stroke }: IconParams) => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <circle cx={9} cy={9} r={8.5} stroke={Palette[stroke || color]} fill={Palette[bg]} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.253 12.376a.922.922 0 01-1.243-.056L4.402 9.712a.922.922 0 111.304-1.304l1.962 1.963 4.626-4.627a.922.922 0 111.304 1.304l-5.23 5.23a.935.935 0 01-.115.098z"
      fill={Palette[color]}
    />
  </svg>
)

export const Ellipsis = ({ color = 'text', bg = 'transparent' }: IconParams) => (
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <circle cx={10} cy={10} r={9.5} stroke={Palette[color]} fill={Palette[bg]} />
    <circle cx={6} cy={10} r={1} fill={Palette[color]} />
    <circle cx={10} cy={10} r={1} fill={Palette[color]} />
    <circle cx={14} cy={10} r={1} fill={Palette[color]} />
  </svg>
)

export const Info = ({ color = 'text', bg = 'transparent' }: IconParams) => (
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9.5" stroke={Palette[color]} fill={Palette[bg]} />
    <circle cx="10" cy="6" r="1" fill={Palette[color]} />
    <line
      x1="9"
      y1="9"
      x2="10"
      y2="9"
      stroke={Palette[color]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="9"
      y1="14"
      x2="11"
      y2="14"
      stroke={Palette[color]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="9"
      x2="10"
      y2="14"
      stroke={Palette[color]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)
