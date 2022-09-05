import React from 'react'
import { Box } from 'theme-ui'

export type UserIconProps = {
  onClickLogout(): void
}

const UserIcon = ({ onClickLogout }: UserIconProps) => (
  <Box sx={{ cursor: 'pointer' }} onClick={onClickLogout}>
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <circle cx={14} cy={14} r={14} fill="#32BA86" />
      <mask id="usericon_prefix__a" maskUnits="userSpaceOnUse" x={0} y={0} width={28} height={28}>
        <circle cx={14} cy={14} r={14} fill="#32BA86" />
      </mask>
      <g mask="url(#usericon_prefix__a)" fill="#fff">
        <path d="M14 11a4 4 0 110 8 4 4 0 010-8zm0 10c4.42 0 8 1.79 8 4v2H6v-2c0-2.21 3.58-4 8-4z" />
        <path d="M12 30l-5.5-2-.5-1 1-2 2.5-.5 3.5-1 7 1.5 2 2-2 2-3.5 1H12z" />
      </g>
    </svg>
  </Box>
)

export default UserIcon
