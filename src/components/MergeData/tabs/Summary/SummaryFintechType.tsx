import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Text } from 'theme-ui'
import ExpandLabel from './ExpandLabel'

type SummaryFintechTypeProps = {
  label?: string
  data: string[]
}

const SummaryFintechType = ({ label, data }: SummaryFintechTypeProps) => {
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
            {data.map((fin, index) => (
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
                {fin}
              </Text>
            ))}
          </Box>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryFintechType
