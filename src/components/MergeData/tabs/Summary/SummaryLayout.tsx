import React, { PropsWithChildren } from 'react'
import { Box } from 'theme-ui'
import { Paragraph } from '../../../primitives'
import ExpandLabel from './ExpandLabel'

type Props = PropsWithChildren<{
  label: string
  isEmpty: boolean
}>

const SummaryLayout = ({ label, ...props }: Props) => {
  const [isExpand, setExpand] = React.useState(true)

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
        (!props.isEmpty ? (
          <>{props.children}</>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryLayout
