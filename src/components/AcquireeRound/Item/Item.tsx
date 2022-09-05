import React, { PropsWithChildren } from 'react'
import { Box, Grid, Label } from 'theme-ui'
import { transformPostDate } from '../../../pages/CompanyForm/helpers'
import strings from '../../../strings'
import { Acquiree, ViewInterface } from '../../../types'
import { Paragraph } from '../../primitives'

const ROUND_INFO_GRID = ['1fr 1fr 1fr 1fr 1fr 1fr']

export type Props = ViewInterface<{
  acquiree: Acquiree
  viewDetail?: boolean
}>

export default ({ sx, ...props }: Props) => {
  return (
    <ItemInfoContainer sx={sx}>
      <Box>
        <RoundInfo {...props} />
      </Box>
    </ItemInfoContainer>
  )
}

const ItemInfoContainer = ({ children, sx }: ViewInterface<PropsWithChildren<{}>>) => (
  <Grid
    sx={{
      bg: 'gray03',
      px: 4,
      py: 5,
      borderRadius: '10px',
      width: '100%',
      border: '1px solid',
      borderColor: 'gray01',
      ...(sx || {}),
    }}
  >
    {children}
  </Grid>
)

const RoundInfo = ({ acquiree, viewDetail }: Props) => {
  const {
    pages: {
      addCompanyForm: {
        acquirees: { fields: copy },
      },
    },
  } = strings

  const formatValue = (key: string, value: string | number) => {
    if (!value) return ''
    switch (key) {
      case 'closedDate':
        return transformPostDate(value)
      default:
        return value
    }
  }

  const getColumnCSS = (column: string) => {
    switch (column) {
      case copy.url:
      case copy.linkedinUrl:
        return { gridColumnStart: 1, gridColumnEnd: 4 }
      case copy.facebookUrl:
      case copy.twitterUrl:
        return { gridColumnStart: 4, gridColumnEnd: 7 }
      case copy.description:
        return { gridColumnStart: 1, gridColumnEnd: 7 }
      default:
        return {}
    }
  }

  const notDetailFields = ['apiAppend', 'source']

  return (
    <Grid columns={ROUND_INFO_GRID}>
      {Object.keys(copy)
        .filter(item => !viewDetail || !notDetailFields.includes(item))
        .map(item => {
          return {
            name: copy[item as keyof typeof copy],
            value: formatValue(item, acquiree[item as keyof Acquiree]),
          }
        })
        .map((item, index) => (
          <Box
            key={index}
            mb={4}
            sx={{
              ...getColumnCSS(item.name),
              wordBreak: 'break-word',
            }}
          >
            <Label mb={1}>{item.name}</Label>
            <Paragraph>{item.value?.toString() || ''}</Paragraph>
          </Box>
        ))}
    </Grid>
  )
}
