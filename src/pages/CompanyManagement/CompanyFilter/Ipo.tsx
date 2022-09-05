import React from 'react'
import { CollapseHeader, SearchBox, YearRange } from '.'
import { Box, Divider } from '@theme-ui/components'
import { Checkbox, Collapse, InputRange } from '../../../components'
import { IpoFilterType } from './helpers'

type IpoProps = {
  state: IpoFilterType
  onChange(state: IpoFilterType): void
}

const Ipo = ({ state, onChange }: IpoProps) => {
  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Ipo" />}>
        <Box sx={{ mx: 2, my: 3 }}>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Ipo Public Year"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isIpoPublicYearBlank}
                onPress={() => {
                  onChange({
                    ...state,
                    isIpoPublicYearBlank: !state.isIpoPublicYearBlank,
                  })
                }}
              />
              <YearRange
                isRange={state.ipoPublicYear.isRange}
                setIsRange={isRange => {
                  onChange({ ...state, ipoPublicYear: { ...state.ipoPublicYear, isRange } })
                }}
                state={state.ipoPublicYear}
                onChange={(ipoPublicYear: any) => onChange({ ...state, ipoPublicYear })}
                disabled={state.isIpoPublicYearBlank}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Ipo Amount"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <InputRange
                state={state.ipoAmount}
                onChange={ipoAmount => {
                  onChange({ ...state, ipoAmount })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Valuation Amount"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <InputRange
                state={state.ipoValuation}
                onChange={ipoValuation => {
                  onChange({ ...state, ipoValuation })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Stock Exchange"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isIpoStockExchangeBlank}
                onPress={() => {
                  onChange({
                    ...state,
                    isIpoStockExchangeBlank: !state.isIpoStockExchangeBlank,
                  })
                }}
              />
              <SearchBox
                state={state.ipoStockExchange}
                onPress={value => {
                  onChange({ ...state, ipoStockExchange: [value] })
                }}
                onChange={() => {}}
                placeholder="search..."
                onClose={() => onChange({ ...state, ipoStockExchange: [] })}
                disabled={state.isIpoStockExchangeBlank}
              />
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default Ipo
