import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import ExpandLabel from './ExpandLabel'
import { FundraisingDTOResult } from '../../../../pages/CompanyForm/Fundraising'
import strings from '../../../../strings'
import { getValue } from '../MergeFundraising/RadioFundraising'
import { groupBy } from 'lodash'

const {
  pages: { fundraising: copy },
} = strings

type SummaryFundraisingProps = {
  label?: string
  data: FundraisingDTOResult[]
}

const SummaryFundraising = ({ label, data }: SummaryFundraisingProps) => {
  const [isExpand, setExpand] = useState<boolean>(true)
  const distinctList = Object.values(groupBy(data || [], f => f.fundraising_id)).map(
    list => list[0]
  )

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
        (distinctList && !!distinctList.length ? (
          distinctList.map((fundraising: FundraisingDTOResult, index: number) => {
            return Object.keys(fundraising).map(_key => {
              const key = _key as keyof FundraisingDTOResult
              // @ts-ignore
              if (!key || key.includes('typename') || key === 'fundraising_id') return null
              return (
                <Flex key={key + index} sx={{ mt: 14 }}>
                  <Paragraph bold>{`${copy.keys[key]}:`}</Paragraph>
                  <Paragraph
                    sx={{
                      maxWidth: 400,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      ml: 3,
                    }}
                  >
                    {getValue(key, fundraising)}
                  </Paragraph>
                </Flex>
              )
            })
          })
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryFundraising
