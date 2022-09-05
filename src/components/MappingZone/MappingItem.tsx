import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { SearchResultItem, Source, ViewInterface } from '../../types'
import { Button, Link, Pill } from '../'
import { Paragraph } from '../primitives'
import { MAPPING_GRID } from './helpers'
import { SearchBlockType } from '../SearchResults/SearchResults'
import { Routes } from '../../types/enums'
import { convertToInternationalCurrencySystem } from '../../utils'

export type MappingItemProps = SearchResultItem &
  ViewInterface<{
    showFlag?: boolean
    invertBg?: boolean
    checked?: boolean
    toBeRemoved?: boolean
    aggregated?: boolean
    onRemove?(id: string): void
    onMap?(): void
    type?: keyof typeof SearchBlockType
    isInDefaultSelected?: boolean
    isInReAggregate?: boolean
  }>

const MappingItem = ({
  companyDetails,
  showFlag = true,
  amount,
  source,
  checked,
  onMap,
  invertBg,
  aggregated,
  type = 'internal',
  toBeRemoved = false,
  sx,
}: MappingItemProps) => {
  const to =
    type === 'internal'
      ? Routes.COMPANY.replace(':id', companyDetails.companyId)
      : Routes.COMPANY_NEW.replace(':id', companyDetails.companyId).replace(
          ':source',
          source.toString()
        )

  return (
    <Flex sx={{ opacity: toBeRemoved ? 0.4 : 1, ...sx }}>
      <Grid
        gap={'1px'}
        columns={MAPPING_GRID}
        sx={{
          alignItems: 'center',
          borderRadius: 10,
          backgroundColor: !aggregated ? (invertBg ? 'white' : 'gray03') : 'transparent',
          py: 2,
        }}
      >
        <Flex sx={{ gridColumn: 'company / company-end', alignItems: 'center' }}>
          <Box sx={{ minWidth: 50 }}>
            {showFlag && companyDetails.countryCode && (
              <Pill
                sx={{ height: 28, width: 28, m: 'auto' }}
                alt={companyDetails.countryName}
                flag={companyDetails.countryCode}
              />
            )}
          </Box>
          <Link
            variant="company"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            to={to}
          >
            {companyDetails.companyName}
          </Link>
        </Flex>

        {companyDetails.url && (
          <Paragraph
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              gridColumn: 'url /url-end',
              '& > a': { color: 'black50' },
            }}
          >
            {companyDetails.url}
          </Paragraph>
        )}

        <Paragraph sx={{ justifySelf: 'center', gridColumn: 'amount /amount-end' }}>
          {amount ? convertToInternationalCurrencySystem(amount) : '0'}
        </Paragraph>

        {source && (
          <Paragraph sx={{ gridColumn: 'source /source-end' }}>
            {typeof source === 'string' ? source : (source as Source).label}
          </Paragraph>
        )}

        <Flex sx={{ mr: 2, justifyContent: 'flex-end', gridColumn: 'button' }}>
          {!aggregated && (
            <Button
              onPress={onMap}
              sx={{ color: 'primary', px: 4, py: 2, bg: 'white' }}
              variant="outline"
              label={'Map'}
              color="black50"
            />
          )}
        </Flex>
      </Grid>
    </Flex>
  )
}

export default MappingItem
