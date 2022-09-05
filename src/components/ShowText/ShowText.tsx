import React, { useState } from 'react'
import { Link } from 'theme-ui'
import { Paragraph } from '../primitives'

type ShowTextProps = {
  value: string
  max: number
}
const ShowText = ({ value, max }: ShowTextProps) => {
  const [showFull, setShowFull] = useState(false)

  return (
    <>
      <Paragraph sx={{ mb: 2, wordWrap: 'break-word' }}>
        {showFull ? value : `${value.slice(0, max)}${value.length > max ? '...' : ''}`}
      </Paragraph>
      {value.length >= max && (
        <Link
          href=""
          onClick={e => {
            e.preventDefault()
            setShowFull(!showFull)
          }}
        >
          {showFull ? 'Show less' : 'Show more'}
        </Link>
      )}
    </>
  )
}

export default ShowText
