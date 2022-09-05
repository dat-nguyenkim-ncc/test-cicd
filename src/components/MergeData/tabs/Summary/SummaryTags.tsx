import React, { useState } from 'react'
import { TagData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import { Box, Text } from 'theme-ui'
import ExpandLabel from './ExpandLabel'

type SummaryTagsProps = {
  label?: string
  data: TagData[]
}

const SummaryTags = ({ label, data }: SummaryTagsProps) => {
  const [isExpand, setExpand] = useState<boolean>(true)
  return (
    <Box
      sx={{
        pb: 16,
        mb: 16,
        px: 2,
        borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label && (
        <ExpandLabel label={label} isExpand={isExpand} onClick={() => setExpand(!isExpand)} />
      )}

      {isExpand &&
        (data && !!data.length ? (
          <Box sx={{ py: 16 }}>
            {data.map((tag, index) => (
              <Text
                key={index}
                sx={{
                  mt: 2,
                  mr: 2,
                  p: '8px 12px',
                  color: 'white',
                  backgroundColor: 'primary',
                  borderRadius: 10,
                  display: 'inline-block',
                }}
              >
                {tag.label}
              </Text>
            ))}
          </Box>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryTags
