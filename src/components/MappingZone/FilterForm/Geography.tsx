import { Box, Flex } from '@theme-ui/components'
import React, { useEffect, useRef, useState } from 'react'
import { Checkbox, Icon, TextField } from '../..'
import strings from '../../../strings'
import { ChangeFieldEvent, ViewInterface } from '../../../types'
import { Paragraph } from '../../primitives'
import { GeographyType, ItemGeographyType } from './helpers'
import { debounce } from 'lodash'
import { FORM_CHANGE_DEBOUNCE_TIME } from '../../../utils/consts'

type ExpandBoxProps = ViewInterface<{
  label: string
  listCheck: ItemGeographyType[]
  list: ItemGeographyType[]
  onCheck(state: ItemGeographyType[]): void
  isExpand: boolean
}>

const ExpandBox = ({
  sx,
  label,
  listCheck,
  list,
  onCheck,
  isExpand: initialExpand,
}: ExpandBoxProps) => {
  const [isExpand, setIsExpand] = useState<boolean>(false)

  useEffect(() => {
    setIsExpand(initialExpand)
  }, [initialExpand, list])

  return (
    <>
      <Flex sx={{ cursor: 'pointer', ...sx }} onClick={() => setIsExpand(!isExpand)}>
        <Icon icon={isExpand ? 'indicatorDown' : 'indicatorUp'} />
        <Paragraph bold>{label}</Paragraph>
      </Flex>

      {isExpand && (
        <Box sx={{ py: 1 }}>
          {list
            .slice()
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
                    onCheck(cloneState)
                  }}
                  square
                  checked={isChecked}
                />
              )
            })}
        </Box>
      )}
    </>
  )
}

type GeographyProps = {
  geography: GeographyType
  state: GeographyType
  onChange(state: any): void
}
const Geography = ({ geography, state, onChange }: GeographyProps) => {
  const {
    mappingZone: { filter: copy },
  } = strings

  const [textSearch, setTextSearch] = React.useState<string>('')

  const isFirstCleanUpSearchBar = useRef<boolean>(true)

  const onChangeField = (event: ChangeFieldEvent) => {
    const { value } = event.target
    if (!value && isFirstCleanUpSearchBar) isFirstCleanUpSearchBar.current = false
    onChangeFieldDebounce(value)
  }

  const onChangeFieldDebounce = React.useCallback(
    debounce((value: string) => {
      setTextSearch(value)
    }, FORM_CHANGE_DEBOUNCE_TIME),
    []
  )

  const filterData = React.useCallback(
    (list: ItemGeographyType[]) => {
      return !!textSearch.length
        ? list.filter(({ name }) => name.toUpperCase().includes(textSearch.toUpperCase()))
        : list
    },
    [textSearch]
  )

  const regions = filterData(geography.region)
  const subRegion2s = filterData(
    geography.region2.filter(item => {
      if (state.region1.length) {
        return state.region1.some(({ name }) => name === item.parent)
      }
      if (state.region.length) {
        return state.region.some(({ name }) => name === item.parent1)
      }
      return true
    })
  )
  const subRegion1s = filterData(
    geography.region1.filter(item =>
      !state.region.length ? true : state.region.find(({ name }) => name === item.parent)
    )
  )

  const countries = filterData(
    geography.countries.filter(country => {
      if (state.region2.length) {
        return state.region2.some(({ name }) => name === country.parent)
      }
      if (state.region1.length) {
        return state.region1.some(({ name }) => name === country.parent1)
      }
      if (state.region.length) {
        return state.region.some(({ name }) => name === country.parent2)
      }
      return true
    })
  )
  const isExpand = (geographyList: ItemGeographyType[]) =>
    (!!geographyList.length && !!textSearch) || (!textSearch && !isFirstCleanUpSearchBar.current)

  return (
    <>
      <Paragraph sx={{ pb: 3 }} bold>
        Geography
      </Paragraph>

      <TextField
        sx={{ mb: 3 }}
        name="search"
        placeholder="Search..."
        onChange={onChangeField}
        value={textSearch}
      />
      {geography && (
        <Box sx={{ maxHeight: 567, overflowY: 'auto' }}>
          <ExpandBox
            label={copy.region}
            onCheck={item => {
              onChange({
                ...state,
                region: item,
                region1: [],
                region2: [],
                countries: [],
              })
            }}
            listCheck={state.region}
            list={regions}
            isExpand={isExpand(regions)}
            sx={{ pb: 1 }}
          />

          <ExpandBox
            label={copy.sub1}
            onCheck={item => {
              onChange({
                ...state,
                region1: item,
                region2: [],
                countries: [],
              })
            }}
            listCheck={state.region1}
            list={subRegion1s}
            isExpand={isExpand(subRegion1s)}
            sx={{ pb: 1 }}
          />

          <ExpandBox
            label={copy.sub2}
            onCheck={item => {
              onChange({
                ...state,
                region2: item,
                countries: [],
              })
            }}
            listCheck={state.region2}
            list={subRegion2s}
            isExpand={isExpand(subRegion2s)}
            sx={{ pb: 1 }}
          />

          <ExpandBox
            label={copy.country}
            onCheck={item => {
              onChange({ ...state, countries: item })
            }}
            listCheck={state.countries}
            list={countries}
            isExpand={isExpand(countries)}
            sx={{ pb: 1 }}
          />
        </Box>
      )}
    </>
  )
}

export default Geography
