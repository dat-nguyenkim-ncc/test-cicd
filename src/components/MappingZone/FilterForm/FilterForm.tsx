import { useQuery } from '@apollo/client'
import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import { Button, Icon, Updating } from '../..'
import { getGeography } from '../../../pages/MappingZone/graphql'
import strings from '../../../strings'
import { customScrollbar, Palette } from '../../../theme'
import { FormOption } from '../../../types'
import { Paragraph } from '../../primitives'
import { FundingAmount, Geography, Investor, InvestorType, LaunchYear } from './'
import { GeographyType, FundingAmountType, FilterType } from './helpers'

type Props = {
  filterState: FilterType
  isRange: boolean
  setIsRange(value: boolean): void
  setFilterState(state: FilterType): void
  onClose(): void
  resetFilter(): void
}

const FilterForm = ({
  filterState,
  isRange,
  setIsRange,
  setFilterState,
  onClose,
  resetFilter,
}: Props) => {
  const {
    mappingZone: { buttons: copy },
  } = strings

  // GRAPHQL
  const { data: geography, loading } = useQuery(getGeography)

  return (
    <>
      <Flex
        sx={{
          position: 'sticky',
          top: 0,
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${Palette.gray01}`,
          bg: 'white',
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <Icon sx={{ px: 3 }} icon="filter" />
          <Paragraph>Filter</Paragraph>
        </Flex>
        <Flex>
          <Button
            onPress={() => {
              resetFilter()
            }}
            sx={{ color: 'orange' }}
            icon="refresh"
            variant="invert"
            label={copy.reset}
            color="orange"
            iconLeft
          />
          <Button
            onPress={() => {
              onClose()
            }}
            icon="remove"
            variant="invert"
            color="gray04"
          />
        </Flex>
      </Flex>
      {loading ? (
        <Updating loading />
      ) : (
        <Box sx={{ p: 20, mb: 20 }}>
          <Geography
            geography={geography?.getGeography}
            state={filterState.geography}
            onChange={(geography: GeographyType) => setFilterState({ ...filterState, geography })}
          />
          <FundingAmount
            state={filterState.fundingAmount}
            onChange={(fundingAmount: FundingAmountType) =>
              setFilterState({ ...filterState, fundingAmount })
            }
          />
          <LaunchYear
            isRange={isRange}
            setIsRange={setIsRange}
            state={filterState.years}
            onChange={(years: any) => setFilterState({ ...filterState, years })}
          />
          <InvestorType
            state={filterState.investorType}
            onChange={(investorType: FormOption[]) =>
              setFilterState({ ...filterState, investorType })
            }
          />
          <Investor
            state={filterState.investors}
            onChange={(investors: FormOption[]) => setFilterState({ ...filterState, investors })}
          />
        </Box>
      )}

      <style>{customScrollbar}</style>
    </>
  )
}

export default FilterForm
