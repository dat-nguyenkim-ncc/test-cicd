import React, { useEffect, useState } from 'react'
import {
  CompanyTractionsFilterType,
  initialTractionsFilter,
} from '../../../../pages/FindFintechs/helpers'
import { Button, Drawer, Dropdown, FilterTemplate, TextField } from '../../../../components'
import { tractionTopicOptions } from '../../../../pages/CompanyManagement/CompanyFilter/helpers'
import { Flex, Label, SxStyleProp } from 'theme-ui'
import TractionDate from './TractionDate'

type CompanyTractionsFilterProps = {
  setFilterState(filter: CompanyTractionsFilterType): void
  filter: CompanyTractionsFilterType
}

const useStyle = () => ({
  filterButtonBox: { justifyContent: 'flex-end', mb: 5, alignItems: 'center' } as SxStyleProp,
})

const CompanyTractionsFilter = ({ filter, setFilterState }: CompanyTractionsFilterProps) => {
  const styles = useStyle()
  const [currentFilter, setCurrentFilter] = useState<CompanyTractionsFilterType>(filter)
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [errorForm, setErrorForm] = useState<string[]>([])

  useEffect(() => {
    setCurrentFilter(filter)
  }, [filter])

  return (
    <>
      <Flex sx={styles.filterButtonBox}>
        <Button
          onPress={() => {
            setFilterVisible(true)
          }}
          sx={{ color: 'primary', ml: 3, px: 18 }}
          icon="filter"
          variant="outline"
          label="Filter"
          color="black50"
          iconLeft
        />
      </Flex>
      <Drawer visible={filterVisible}>
        <FilterTemplate
          onClose={() => {
            setCurrentFilter(filter)
            setFilterVisible(false)
          }}
          resetFilter={() => {
            setFilterState({ ...initialTractionsFilter })
            setFilterVisible(false)
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                setFilterState({ ...currentFilter, skip: 1 })
                setFilterVisible(false)
              },
              disabled: !!errorForm.length,
              sx: { px: 16, py: 2, borderRadius: 8 },
            },
          ]}
        >
          <TractionDate
            title="Traction Date"
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            errorForm={errorForm}
            setErrorForm={setErrorForm}
          />

          <Label mb="12px" mt={4}>
            Topic
          </Label>
          <Dropdown
            name="source"
            value={currentFilter?.topic}
            options={tractionTopicOptions}
            onChange={({ target }) => {
              setCurrentFilter({ ...currentFilter, topic: target.value })
            }}
            labelSx={{ pt: 4, mb: 3 }}
            clearable
            onClear={() => {
              setCurrentFilter({ ...currentFilter, topic: '' })
            }}
          />

          <Label mb="12px" mt={4}>
            Sentence
          </Label>
          <TextField
            name={'Sentence'}
            onChange={e => {
              setCurrentFilter({ ...currentFilter, textSentence: e.target.value })
            }}
            value={currentFilter.textSentence}
          ></TextField>
        </FilterTemplate>
      </Drawer>
    </>
  )
}

export default CompanyTractionsFilter
