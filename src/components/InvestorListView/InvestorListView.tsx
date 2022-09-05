import React from 'react'
import { Flex, Box, Grid, Label } from 'theme-ui'
import { Icon } from '..'
import strings from '../../strings'
import { ViewInterface } from '../../types'
import { EnumExpandStatusId, EnumInvestorSource } from '../../types/enums'
import { Investor } from '../InvestorForm'
import { Paragraph } from '../primitives'

const INVESTOR_GRIDS = ['1fr 0.7fr']

const InvestorItem = (props: ViewInterface<{ investor: Investor; disabled?: boolean }>) => {
  const { investor } = props
  const hasChildren = !!investor.children?.length
  const [showChildren, setShowChildren] = React.useState(false)

  return (
    <Box sx={{ pb: showChildren ? 2 : 0, ...props.sx }}>
      <Flex
        sx={{ position: 'relative', cursor: hasChildren ? 'pointer' : undefined }}
        onClick={() => setShowChildren(!showChildren && hasChildren)}
      >
        <Grid
          columns={INVESTOR_GRIDS}
          sx={{
            alignItems: 'center',
            p: 2,
            opacity: props.disabled ? 0.5 : 1,
            flex: 1,
          }}
        >
          <Flex sx={{ alignItems: 'center' }}>
            <Paragraph sx={{ overflowWrap: 'break-word' }}>
              {investor.investor_name || ''}
            </Paragraph>
            {investor.isLead && (
              <Box
                bg="primary"
                sx={{
                  borderRadius: '10px',
                  ml: 2,
                  p: '4px 10px',
                  color: 'white',
                  fontSize: '12px',
                  minWidth: 'unset',
                }}
              >
                Lead
              </Box>
            )}
          </Flex>
          <Paragraph>{investor.investor_type || ''}</Paragraph>
        </Grid>
        {hasChildren && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <Icon icon={showChildren ? 'indicatorUp' : 'indicatorDown'} />
          </Box>
        )}
      </Flex>
      {showChildren && (
        <>
          {investor.children?.map((i, idx) => (
            <InvestorItem
              key={idx}
              investor={{
                ...i,
                investor_type:
                  EnumInvestorSource[i.source as keyof typeof EnumInvestorSource] || i.source || '',
              }}
              sx={{ ml: 2, borderLeft: '1px solid #DDD' }}
            />
          ))}
        </>
      )}
    </Box>
  )
}

export const InvestorListView = ({ investors }: { investors: Investor[] }) => (
  <Box>
    <Grid columns={INVESTOR_GRIDS} sx={{ alignItems: 'center', px: 2 }}>
      <Label mb={3}>Investor</Label>
      <Label mb={3}>{strings.common.investorType}</Label>
    </Grid>
    {investors
      .filter(({ expand_status_id }) => expand_status_id !== EnumExpandStatusId.CHANGE_REQUEST)
      .map((investor: Investor, index: number) => (
        <React.Fragment key={index}>
          <InvestorItem
            investor={investor}
            disabled={investor.expand_status_id !== EnumExpandStatusId.FOLLOWING}
            sx={{ backgroundColor: index % 2 === 0 ? 'gray02' : 'transparent' }}
          />
        </React.Fragment>
      ))}
  </Box>
)
