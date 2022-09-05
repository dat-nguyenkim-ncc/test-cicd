import React from 'react'
import { Flex } from '@theme-ui/components'
import { Button, Drawer, FilterTemplate, MultiSelect, TextField } from '../../../components'
import { FundingDate } from '../../../components/MappingZone/FilterForm'
import { BUSINESS_EVENTS, SENTIMENT_LABEL } from '../../../utils/consts'
import { capitalize } from '../../../utils'
import { NewsFilterType } from './helpers'
import { ChangeFieldEvent } from '../../../types'

type NewsFilterProps = {
  resetFilter(): void
  filter: NewsFilterType
  changeFilter(filter: NewsFilterType): void
}

const NewsFilter = ({ filter, resetFilter, changeFilter }: NewsFilterProps) => {
  const filterRefContainer = React.useRef<HTMLDivElement>(null)
  const [filterVisible, setFilterVisible] = React.useState<boolean>(false)
  const [currentFilter, setCurrentFilter] = React.useState<NewsFilterType>(filter)
  const [errorForm, setErrorForm] = React.useState<string[]>([])

  React.useEffect(() => {
    setCurrentFilter(filter)
  }, [filter])

  return (
    <>
      <Flex sx={{ justifyContent: 'flex-end', m: 3, alignItems: 'center' }}>
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
        {filterVisible && (
          <FilterTemplate
            onClose={() => {
              setFilterVisible(false)
            }}
            resetFilter={() => {
              setFilterVisible(false)
              resetFilter()
              setErrorForm([])
            }}
            buttons={[
              {
                label: 'Apply',
                action: () => {
                  setFilterVisible(false)
                  changeFilter(currentFilter)
                },
                sx: { px: 16, py: 2, borderRadius: 8 },
              },
            ]}
          >
            <MultiSelect
              popoverProps={{ containerParent: filterRefContainer.current || undefined }}
              id="Sentiment label"
              label="Sentiment label"
              labelSx={{
                pt: 4,
                mb: 3,
              }}
              divSx={{
                mb: 3,
              }}
              bg={'gray03'}
              state={currentFilter.sentimentLabels}
              positions={['bottom', 'top']}
              options={Object.values(SENTIMENT_LABEL).map(value => ({
                value,
                label: capitalize(value),
              }))}
              onChange={values => {
                setCurrentFilter({
                  ...currentFilter,
                  sentimentLabels: values as string[],
                })
              }}
            />
            <MultiSelect
              popoverProps={{ containerParent: filterRefContainer.current || undefined }}
              id="Business event"
              label="Business event"
              labelSx={{
                pt: 4,
                mb: 3,
              }}
              divSx={{
                mb: 3,
              }}
              bg={'gray03'}
              state={currentFilter.businessEvents}
              positions={['bottom', 'top']}
              options={BUSINESS_EVENTS.map(value => ({
                value,
                label: capitalize(value),
              }))}
              onChange={values => {
                setCurrentFilter({
                  ...currentFilter,
                  businessEvents: values as string[],
                })
              }}
            />
            <FundingDate
              title={'Published date'}
              name="publishedDate"
              isRange={currentFilter.isRange}
              setIsRange={state => {
                setCurrentFilter({ ...currentFilter, isRange: state })
              }}
              state={currentFilter.publishedDate}
              onChange={dates => {
                setCurrentFilter({
                  ...currentFilter,
                  publishedDate: dates,
                })
              }}
              errorForm={errorForm}
              setErrorForm={setErrorForm}
            />
            <TextField
              name="title"
              label="Title"
              labelSx={{ padding: '24px 0 12px', margin: 0 }}
              value={currentFilter.title}
              onChange={(e: ChangeFieldEvent) => {
                setCurrentFilter({ ...currentFilter, title: e.target.value })
              }}
            />
          </FilterTemplate>
        )}
      </Drawer>
    </>
  )
}
export default NewsFilter
