import { Avatar, AvatarProps } from '@theme-ui/components'
import React from 'react'
import { DEFAULT_AVATAR } from '../../../pages/CompanyForm/mock'

export default function ({ ref: _, src, size, ...props }: AvatarProps) {
  const [url, setUrl] = React.useState<string | undefined>(src)
  React.useEffect(() => {
    setUrl(src)
  }, [src])

  const sxSize = size ? `${size}px` : ''

  return (
    <Avatar
      {...props}
      sx={{ width: sxSize, height: sxSize, objectFit: 'contain', ...props.sx }}
      src={url || DEFAULT_AVATAR}
      alt="company-logo"
      onError={() => {
        setUrl('')
      }}
    />
  )
}
