import { useLazyQuery } from '@apollo/client'
import { Box, Grid, Label } from '@theme-ui/components'
import React, { useState } from 'react'
import { SxStyleProp } from 'theme-ui'
import { Button, Popover, TextField, Updating } from '..'
import { SEARCH_TECHNOLOGY_PROVIDER } from '../../pages/CompanyForm/graphql'
import {
  SearchTechnologyProviderResponse,
  TechnologyProvider,
  TechnologyProviderSearchItem,
} from '../../pages/CompanyForm/TechnologyProvider'
import { Palette } from '../../theme'
import { ChangeFieldEvent } from '../../types'
import { reasonPopverZIndex } from '../../utils/consts'
import { Paragraph } from '../primitives'

type TechnologyProviderSearchProps = {
  open: boolean
  setOpen(i: boolean): void
  selectedData: TechnologyProvider[]
  setSelectedData(i: TechnologyProvider[]): void
  editState: TechnologyProvider[]
}

const fields = [
  { name: 'Name', value: 'name' },
  { name: 'Description', value: 'description' },
  { name: '', value: '' },
]

let timer: any

const ROUND_INFO_GRID = ['3fr 3fr 1fr']

const cssProps = {
  width: 700,
  height: '300px',
  bg: Palette.gray03,
  borderRadius: 10,
  borderColor: Palette.gray01,
  border: 'solid 1px #E2E2E2',
} as SxStyleProp

const TechnologyProviderSearchForm = ({
  open,
  setOpen,
  selectedData,
  setSelectedData,
  editState,
}: TechnologyProviderSearchProps) => {
  const [searchPhrase, setSearchPhrase] = useState<string>('')
  const [dataSearchItems, setDataSearchItems] = useState<TechnologyProviderSearchItem[]>([])

  const [searchTechnologyProvider, { data: dataSearch, loading: queryingSearch }] = useLazyQuery<
    SearchTechnologyProviderResponse
  >(SEARCH_TECHNOLOGY_PROVIDER, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setDataSearchItems([...(dataSearch?.technologyProviderSearch || [])])
    },
  })

  const onChangeField = (value: string) => {
    if (value?.trim() !== searchPhrase?.trim()) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        searchTechnologyProvider({ variables: { searchPhrase: value } })
      }, 500)
    }
    setSearchPhrase(value)
  }

  return (
    <Popover
      open={open}
      setOpen={setOpen}
      disabled={!searchPhrase.length}
      positions={['bottom', 'top']}
      align="start"
      noArrow
      sx={{ mb: 5 }}
      content={
        <>
          {queryingSearch ? (
            <Box sx={{ minWidth: 700 }}>
              <Updating
                loading
                noPadding
                sx={{ p: 6, bg: Palette.mint, borderRadius: 12, my: 0 }}
              />
            </Box>
          ) : !searchPhrase?.trim() || !dataSearch ? null : dataSearchItems.length &&
            searchPhrase?.trim() ? (
            <Box sx={{ ...cssProps, px: 2, py: 2, overflow: 'auto' }}>
              <Grid>
                <Grid columns={ROUND_INFO_GRID} sx={{ width: '100%' }}>
                  {fields.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        wordBreak: 'break-word',
                      }}
                    >
                      <Label mb={1}>{item.name}</Label>
                    </Box>
                  ))}
                </Grid>
                {dataSearchItems.map((item, index) => {
                  const isCheck = [...selectedData, ...editState].some(
                    ({ technology_provider_id }) =>
                      technology_provider_id === item.technology_provider_id
                  )
                  return (
                    <Grid key={`Grid-${index}`} columns={ROUND_INFO_GRID}>
                      {fields.map((field, i) => (
                        <Box
                          key={`Grid-${index}-${i}`}
                          sx={{
                            wordBreak: 'break-word',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {field.value ? (
                            <Paragraph>
                              {item[field.value as keyof TechnologyProviderSearchItem] || ''}
                            </Paragraph>
                          ) : (
                            <Button
                              onPress={() => {
                                const { technology_provider_id, name, description } = item
                                setSelectedData([
                                  ...selectedData,
                                  {
                                    name,
                                    technology_provider_id,
                                    description,
                                  } as TechnologyProvider,
                                ])
                              }}
                              label={isCheck ? 'Added' : 'Add'}
                              size={'tiny'}
                              disabled={isCheck}
                            ></Button>
                          )}
                        </Box>
                      ))}
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          ) : (
            <Box
              sx={{ ...cssProps, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              No Data
            </Box>
          )}
        </>
      }
      zIndex={reasonPopverZIndex}
    >
      <TextField
        value={searchPhrase}
        onChange={(event: ChangeFieldEvent) => onChangeField(event.target.value)}
        name={''}
        placeholder={'Search'}
        onBlur={() => {}}
        label={'Search Technology Provider'}
        labelSx={{ mb: 3 }}
        sx={{ width: '700px' }}
      />
    </Popover>
  )
}

export default TechnologyProviderSearchForm
