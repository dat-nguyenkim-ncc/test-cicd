import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Image } from '@theme-ui/components'
import { ImageProps } from 'theme-ui'
import logo from './logo.png'

type Props = ImageProps &
  PropsWithChildren<{
    cursor?: string
  }>

export default function CompanyLogo({
  width,
  height,
  variant = 'logo',
  src,
  cursor = 'pointer',
  ref: _,
  ...props
}: Props) {
  const [url, setUrl] = useState<string | undefined>(src)
  useEffect(() => {
    setUrl(src)
  }, [src])
  return (
    <Image
      {...props}
      variant={variant}
      sx={{
        boxShadow:
          'rgb(0 0 0 / 20%) 0px 3px 3px -2px, rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px',
        cursor,
        objectFit: 'contain',
      }}
      src={url || logo}
      alt="company-logo"
      width={width || '100%'}
      height={height || '100%'}
      onError={(e) => {
        setUrl('')
      }}
    />
  )
}
