import * as React from 'react'

function UserSVG(props: any) {
  return (
    <svg
      width={12}
      height={13}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 0a4 4 0 110 8 4 4 0 010-8zm0 10c4.42 0 8 1.79 8 4v2H0v-2c0-2.21 3.58-4 8-4z"
        fill="#888"
      />
      <path d="M6 19L.5 17 0 16l1-2 2.5-.5 3.5-1 7 1.5 2 2-2 2-3.5 1H6z" fill="#888" />
    </svg>
  )
}

export default UserSVG
