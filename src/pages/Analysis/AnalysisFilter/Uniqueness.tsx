import React from 'react'
import { Divider, Label, Slider, Text } from 'theme-ui'
import { AnalysisFilterType } from '../helpers'

type UniquenessProps = {
  currentFilter: AnalysisFilterType
  setCurrentFilter(filter: AnalysisFilterType): void
}

const Uniqueness = ({ currentFilter, setCurrentFilter }: UniquenessProps) => {
  return (
    <>
      <Divider opacity={0.3} my={4} />
      <Label mb="12px" mt={4}>
        Uniqueness
      </Label>
      <Text sx={{ mb: 4 }}> {`${Math.round(currentFilter.uniquenessPercent)}%`} </Text>
      <Slider
        value={currentFilter.uniquenessPercent}
        onChange={e => {
          setCurrentFilter({ ...currentFilter, uniquenessPercent: Math.round(+e.target.value) })
        }}
        min={0}
        max={100}
        step={0.1}
        width={20}
        sx={{ color: 'primary' }}
      />
    </>
  )
}
export default Uniqueness
