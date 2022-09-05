import React from 'react'
import { Flex } from 'theme-ui'
import { ViewInterface } from '../../types'
import { ApiSourceType } from '../../types/enums'
import { Paragraph } from '../primitives'

type Props = ViewInterface<{
  source?: ApiSourceType
  sources: Array<ApiSourceType>
}>

const CompanySource = ({ source, sources }: Props) => {
  if (!source) return null
  return (
    <Flex sx={{ p: '10px 0' }}>
      <Paragraph sx={{ fontWeight: 600, pr: 1 }}>SOURCE ID:</Paragraph>
      <Paragraph>
        {(sources || [source])
          .slice()
          .map(s => (s === source && sources?.length > 1 ? ` ${s} (DEFAULT) ` : ` ${s} `))
          .join(' | ')}
      </Paragraph>
    </Flex>
  )
}

export default CompanySource
