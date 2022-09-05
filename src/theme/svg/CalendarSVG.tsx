import * as React from 'react'

function CalendarSVG(props: any) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.25 1.5h-1.5V0h-1.5v1.5h-1.5V0h-1.5v1.5h-1.5V0h-1.5v1.5H.75a.75.75 0 00-.75.75v9c0 .415.335.75.75.75h10.5a.75.75 0 00.75-.75v-9a.75.75 0 00-.75-.75zm-.75 9h-9V3.75h9v6.75z"
        fill="#888"
      />
      <path
        d="M4.5 5.25H3v1.5h1.5v-1.5zM6.75 5.25h-1.5v1.5h1.5v-1.5zM4.5 7.5H3V9h1.5V7.5zM6.75 7.5h-1.5V9h1.5V7.5zM9 5.25H7.5v1.5H9v-1.5zM9 7.5H7.5V9H9V7.5z"
        fill="#888"
      />
    </svg>
  )
}

export default CalendarSVG
