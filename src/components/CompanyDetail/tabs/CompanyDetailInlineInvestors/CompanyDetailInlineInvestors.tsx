import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { InvestorsProps } from '../../../../types'
import strings from '../../../../strings'
import Icon from '../../../Icon'
import { Paragraph } from '../../../primitives'

export type CompanyDetailInlineInvestorsProps = InvestorsProps & {}

const CompanyDetailInlineInvestors = ({ lead, other }: CompanyDetailInlineInvestorsProps) => {
  const [opened, setOpened] = useState(!lead)
  const {
    companyDetail: { financials: copy },
  } = strings

  const onToggle = () => {
    setOpened(!opened)
  }

  return (
    <Box>
      {lead && (
        <>
          <Flex
            sx={{ cursor: other ? 'pointer' : 'default', alignItems: 'start' }}
            onClick={other ? onToggle : undefined}
          >
            <Paragraph sx={{ mb: 2, mr: 2 }} light>
              {copy.fundingRounds.leadInvestor}
            </Paragraph>
            {other && <Icon size="tiny" icon={opened ? 'indicatorUp' : 'indicatorDown'} />}
          </Flex>
          <Paragraph sx={{ mb: 4 }}>{lead}</Paragraph>
        </>
      )}
      {other && opened && (
        <>
          <Paragraph sx={{ mb: 2 }} light>
            {copy.fundingRounds.otherInvestors}
          </Paragraph>
          <Paragraph>{other}</Paragraph>
        </>
      )}
    </Box>
  )
}

export default CompanyDetailInlineInvestors
