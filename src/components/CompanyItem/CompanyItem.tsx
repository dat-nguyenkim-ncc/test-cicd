import React from 'react'
import { Flex, Grid } from 'theme-ui'
import { SearchResultItem, Source, ViewInterface } from '../../types'
import { Button, Checkbox, Link, Pill } from '../'
import { Paragraph } from '../primitives'
import { GRID } from './helpers'
import { SearchBlockType } from '../SearchResults/SearchResults'
import strings from '../../strings'
import { EnumExpandStatus, EnumExpandStatusId, Routes } from '../../types/enums'

export type CompanyItemProps = SearchResultItem &
  ViewInterface<{
    invertBg?: boolean
    checked?: boolean
    toBeRemoved?: boolean
    aggregated?: boolean
    onCheck?(id: string): void
    onRemove?(id: string): void
    type?: keyof typeof SearchBlockType
    isInDefaultSelected?: boolean
    isInReAggregate?: boolean
    columns?: string
    disabled?: boolean
  }>

const CompanyItem = ({
  companyDetails,
  source,
  checked,
  onCheck,
  onRemove,
  invertBg,
  aggregated,
  type = 'internal',
  toBeRemoved = false,
  sx,
  isInDefaultSelected,
  isInReAggregate,
  columns,
  disabled,
}: CompanyItemProps) => {
  const { companyList: copy } = strings

  const onCheckTick = () => {
    onCheck &&
      onCheck(
        isInReAggregate && isInDefaultSelected
          ? companyDetails.external_id || ''
          : companyDetails.companyId
      )
  }

  const onRemoveClick = () => {
    onRemove && onRemove(companyDetails.companyId)
  }

  const getConditionOfCheck = () => {
    if (isInReAggregate || isInDefaultSelected) {
      return checked
    }
    return !!(source && (source as Source).default)
  }

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
        columns={columns || GRID}
        sx={{
          alignItems: 'center',
          borderRadius: 10,
          backgroundColor: !aggregated ? (invertBg ? 'white' : 'gray03') : 'transparent',
          py: 2,
        }}
      >
        {onCheck && (
          <Checkbox
            disabled={disabled}
            onPress={onCheckTick}
            sx={{ gridColumn: 'checkbox' }}
            checked={checked}
          />
        )}

        <Link
          variant="company"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            gridColumn: 'company / company-end',
          }}
          to={to}
        >
          {companyDetails.companyName}
        </Link>

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

        {source && (
          <Paragraph sx={{ gridColumn: 'source /source-end' }}>
            {typeof source === 'string' ? source : (source as Source).label}
          </Paragraph>
        )}
        <Flex sx={{ mr: 2, justifyContent: 'flex-end', gridColumn: 'icons / icons-end' }}>
          {getConditionOfCheck() && (
            <Pill sx={{ mr: 2 }} label={copy.defaultSource} variant="muted" />
          )}
          {companyDetails.expandStatusId === EnumExpandStatusId.DUPLICATED ? (
            <Pill sx={{ mr: 2 }} icon={EnumExpandStatus.DUPLICATED as any} variant="out" />
          ) : (
            companyDetails.primaryCategories?.map((t, index) => (
              <Pill key={index} sx={{ mr: 2 }} icon={t as any} />
            ))
          )}
          {companyDetails.countryCode && (
            <Pill alt={companyDetails.countryName} flag={companyDetails.countryCode} />
          )}
        </Flex>
      </Grid>
      {onRemove && (
        <Button sx={{ ml: 4 }} size="small" variant="black" icon="remove" onPress={onRemoveClick} />
      )}
    </Flex>
  )
}

export default CompanyItem
