import React, { useCallback, useState } from 'react'
import { CollapseHeader, SearchBox } from '.'
import { Box, Divider } from '@theme-ui/components'
import { Checkbox, Collapse } from '../../../components'
import { ItemGeographyType } from '../../../components/MappingZone/FilterForm/helpers'
import { blankText, GeographyFilterType, GeographyType, getUniqueValue } from './helpers'

type GeographyProps = {
  data: GeographyType
  state: GeographyFilterType
  onChange(state: GeographyFilterType): void
}

const blankOption: ItemGeographyType = {
  name: 'blank',
}

const ListView = ({
  blank,
  disabled,
  list,
  listCheck,
  onChange,
}: {
  blank?: boolean
  disabled?: boolean
  list: ItemGeographyType[]
  listCheck: ItemGeographyType[]
  onChange(state: ItemGeographyType[]): void
}) => {
  return (
    <Box sx={{ py: 1, maxHeight: 222, overflowY: 'auto' }}>
      {blank && (
        <Checkbox
          label="Blank"
          sx={{ py: 1 }}
          square
          checked={listCheck.some(r => r.name === blankOption.name)}
          onPress={() => {
            let cloneState = [...listCheck]
            if (listCheck.some(r => r.name === blankOption.name)) {
              cloneState = cloneState.filter(({ name }) => blankOption.name !== name)
            } else cloneState.push(blankOption)
            onChange(cloneState)
          }}
          disabled={disabled}
        />
      )}
      {list
        ?.slice()
        .sort(function (a, b) {
          let nameA = a.name.toUpperCase()
          let nameB = b.name.toUpperCase()

          return nameA.localeCompare(nameB)
        })
        .map((item, index) => {
          const isChecked = listCheck.some(r => r.name === item.name)
          return (
            <Checkbox
              key={index}
              sx={{ py: 1 }}
              label={item.name}
              onPress={() => {
                let cloneState = [...listCheck]
                if (isChecked) {
                  cloneState = cloneState.filter(({ name }) => item.name !== name)
                } else cloneState.push(item)
                onChange(cloneState)
              }}
              square
              checked={isChecked}
              disabled={disabled}
            />
          )
        })}
    </Box>
  )
}

const Geography = ({ state, data, onChange }: GeographyProps) => {
  const [text, setText] = useState<string>('')

  const checkSelectBlank = useCallback((arr1: ItemGeographyType[], arr2: ItemGeographyType[]) => {
    return getUniqueValue(
      arr1.map(e => `${e.name}`),
      arr2.map(e => `${e.name}`)
    ).includes(blankText.value)
  }, [])

  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Geography" />}>
        <Box sx={{ my: 3, mx: 2 }}>
          <SearchBox onChange={setText} placeholder="search..." />
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="HQ Region"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <ListView
                blank
                list={data?.region.filter(r => r.name.toLowerCase().includes(text.toLowerCase()))}
                listCheck={state.region}
                onChange={region => {
                  onChange({
                    ...state,
                    region,
                    region1: checkSelectBlank(state.region, region) ? state.region1 : [],
                    region2: checkSelectBlank(state.region, region) ? state.region2 : [],
                    countries: checkSelectBlank(state.region, region) ? state.countries : [],
                  })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="HQ Sub Region 1"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <ListView
                blank
                list={data?.region1
                  .filter(item =>
                    !state.region.filter(r => r.name !== blankText.value).length
                      ? true
                      : state.region.find(({ name }) => name === item.parent)
                  )
                  .filter(r => r.name.toLowerCase().includes(text.toLowerCase()))}
                listCheck={state.region1}
                onChange={region1 => {
                  onChange({
                    ...state,
                    region1,
                    region2: checkSelectBlank(state.region1, region1) ? state.region2 : [],
                    countries: checkSelectBlank(state.region1, region1) ? state.countries : [],
                  })
                }}
                disabled={
                  state.region.length === 1 && state.region.some(e => e.name === blankText.value)
                }
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="HQ Sub Region 2"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <ListView
                blank
                list={data?.region2
                  .filter(item => {
                    if (state.region1.filter(r => r.name !== blankText.value).length) {
                      return state.region1.some(({ name }) => name === item.parent)
                    }
                    if (state.region.filter(r => r.name !== blankText.value).length) {
                      return state.region.some(({ name }) => name === item.parent1)
                    }
                    return true
                  })
                  .filter(r => r.name.toLowerCase().includes(text.toLowerCase()))}
                listCheck={state.region2}
                onChange={region2 => {
                  onChange({
                    ...state,
                    region2,
                    countries: checkSelectBlank(state.region2, region2) ? state.countries : [],
                  })
                }}
                disabled={
                  (state.region.length === 1 &&
                    state.region.some(e => e.name === blankText.value)) ||
                  (state.region1.length === 1 &&
                    state.region1.some(e => e.name === blankText.value))
                }
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="HQ Country"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <ListView
                blank
                list={data?.countries
                  .filter(country => {
                    if (state.region2.filter(r => r.name !== blankText.value).length) {
                      return state.region2.some(({ name }) => name === country.parent)
                    }
                    if (state.region1.filter(r => r.name !== blankText.value).length) {
                      return state.region1.some(({ name }) => name === country.parent1)
                    }
                    if (state.region.filter(r => r.name !== blankText.value).length) {
                      return state.region.some(({ name }) => name === country.parent2)
                    }
                    return true
                  })
                  .filter(r => r.name.toLowerCase().includes(text.toLowerCase()))}
                listCheck={state.countries}
                onChange={countries => {
                  onChange({ ...state, countries })
                }}
                disabled={
                  (state.region.length === 1 &&
                    state.region.some(e => e.name === blankText.value)) ||
                  (state.region1.length === 1 &&
                    state.region1.some(e => e.name === blankText.value)) ||
                  (state.region2.length === 1 &&
                    state.region2.some(e => e.name === blankText.value))
                }
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="HQ City"
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
                checked={state.isBlankCity}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankCity: !state.isBlankCity,
                  })
                }}
                disabled={
                  (state.region.length === 1 &&
                    state.region.some(e => e.name === blankText.value)) ||
                  (state.region1.length === 1 &&
                    state.region1.some(e => e.name === blankText.value)) ||
                  (state.region2.length === 1 &&
                    state.region2.some(e => e.name === blankText.value)) ||
                  (state.countries.length === 1 &&
                    state.countries.some(e => e.name === blankText.value))
                }
              />
              <SearchBox
                state={state.city}
                onPress={value => {
                  onChange({ ...state, city: [value] })
                }}
                onChange={() => {}}
                placeholder="search..."
                onClose={() => onChange({ ...state, city: [] })}
                disabled={
                  (state.region.length === 1 &&
                    state.region.some(e => e.name === blankText.value)) ||
                  (state.region1.length === 1 &&
                    state.region1.some(e => e.name === blankText.value)) ||
                  (state.region2.length === 1 &&
                    state.region2.some(e => e.name === blankText.value)) ||
                  (state.countries.length === 1 &&
                    state.countries.some(e => e.name === blankText.value)) ||
                  state.isBlankCity
                }
              />
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default Geography
