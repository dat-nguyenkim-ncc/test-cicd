import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex, Text } from 'theme-ui'
import ExpandLabel from './ExpandLabel'
import { MergeCompanyOverridesInput } from '../../MergeData'
import { getLabel, getValue } from '../MergeOverrides/MergeOverrides'

type Props = {
  label?: string
  data: MergeCompanyOverridesInput[]
}

const SummaryOverrides = ({ label, data }: Props) => {
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
          <>
            {data.map((item, index) => {
              const value = getValue(item.field, item.value)
              return (
                <Flex key={index} sx={{ ml: 1, mt: 3, gap: 2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      borderStyle: 'solid',
                      borderColor: 'primary',
                      backgroundColor: 'primary',
                      width: 5,
                      height: 5,
                      borderRadius: '100%',
                      cursor: 'pointer',
                    }}
                  />
                  <Text variant="body">{getLabel(item.field)}:</Text>
                  {typeof value === 'string' ? <Text variant="body">{value}</Text> : <>{value}</>}
                </Flex>
              )
            })}
          </>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryOverrides
