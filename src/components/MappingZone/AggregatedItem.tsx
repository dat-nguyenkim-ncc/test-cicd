import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, Icon } from '..'
import { CompanyDetail, SourceDetail, ViewInterface } from '../../types'
import strings from '../../strings'
import { Paragraph } from '../primitives'
import { MappingItem } from '.'

export type AggregatedItemProps = ViewInterface<{
  company: CompanyDetail
  sources: SourceDetail[]
  onMap(): void
  isInDefaultSelected?: boolean
  isInReAggregate?: boolean
  amount?: string
}>

const AggregatedItem = ({
  amount,
  onMap,
  sources,
  sx,
  isInDefaultSelected,
  isInReAggregate,
}: AggregatedItemProps) => {
  const { aggregatedSource: copy } = strings
  const [state, setState] = useState({ opened: false })

  const onToggle = () => {
    setState({ ...state, opened: !state.opened })
  }

  return (
    <Box sx={{ py: 3, bg: 'gray02', borderRadius: 10, ...sx }}>
      <Flex>
        <Flex
          sx={{ pl: 5, py: 3, flex: 1, alignItems: 'center', cursor: 'pointer' }}
          onClick={onToggle}
        >
          <Paragraph sx={{ mr: 2 }} bold>
            {copy.title}
          </Paragraph>
          <Icon sx={{ mr: 2 }} size="tiny" icon={state.opened ? 'indicatorUp' : 'indicatorDown'} />
        </Flex>
        <Button
          onPress={onMap}
          label={'Map'}
          sx={{ color: 'primary', px: 4, py: 2, bg: 'white', mr: 2 }}
          variant="outline"
          color="black50"
        />
      </Flex>
      <Box mt={3}>
        {sources.map((s, index) => {
          if (index > 0 && !state.opened) return null
          return (
            <MappingItem
              key={index}
              aggregated
              type="internal"
              companyDetails={{ ...s.company, expandStatusId: null, primaryCategories: null }}
              source={s.source}
              showFlag={index === 0}
              isInReAggregate={isInReAggregate}
              isInDefaultSelected={isInDefaultSelected}
              amount={amount}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default AggregatedItem
