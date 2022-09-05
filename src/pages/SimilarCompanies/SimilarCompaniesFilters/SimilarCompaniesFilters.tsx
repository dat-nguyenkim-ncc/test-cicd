import { useLazyQuery } from '@apollo/client'
import { debounce } from 'lodash'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { Box, Flex, Grid, Label, Text } from 'theme-ui'
import { Button, Dropdown, Popover, TextField, Updating } from '../../../components'
import {
  GET_SUGGEST_COMPANY_RESULTS,
  SearchReferenceField,
  SuggestCompanyResponse,
} from '../../../graphql/query/getSuggestCompanyResults'
import { Palette } from '../../../theme'
import { FormOption } from '../../../types'
import { isCompanyId } from '../../../utils'
import { popoverZIndex } from '../../../utils/consts'
import { ReverseSource } from '../../../utils/getSource'
import { SimilarCompaniesSearch, totalOptions } from '../helpers'

type SimilarCompaniesFiltersProps = {
  placeholder?: string
  option: FormOption[]
  state: SimilarCompaniesSearch
  setState: React.Dispatch<React.SetStateAction<SimilarCompaniesSearch>>
  onSearch(event?: FormEvent<HTMLFormElement>): void
  getData(search: SimilarCompaniesSearch, resetDownload?: boolean): void
}

const SimilarCompaniesFilters = ({
  placeholder,
  option,
  state,
  setState,
  onSearch,
  getData,
}: SimilarCompaniesFiltersProps) => {
  const [isValid, setIsValid] = useState<boolean>(true)
  const [openSuggest, setOpenSuggest] = useState<boolean>(false)

  const [suggestCompanies, { data: suggestData, loading: suggestLoading }] = useLazyQuery<
    SuggestCompanyResponse
  >(GET_SUGGEST_COMPANY_RESULTS, {
    notifyOnNetworkStatusChange: true,
    onCompleted() {},
  })

  const debounceSuggest = React.useCallback(
    debounce(query => suggestCompanies({ variables: { query: query.trim(), limit: 100 } }), 400),
    []
  )
  const onChangeCompanyId = React.useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setIsValid(true)
      setState({
        ...state,
        companyId: value,
      })
      if (value.trim().length > 1) {
        debounceSuggest(value)
      }
    },
    [setState, debounceSuggest, state]
  )

  const onChangeSearchBy = (event: ChangeEvent<HTMLSelectElement>) => {
    getData({
      ...state,
      searchBy: event.currentTarget.value,
    })
  }

  const onChangeTotal = (event: ChangeEvent<HTMLSelectElement>) => {
    getData(
      {
        ...state,
        total: Number(event.currentTarget.value),
      },
      false
    )
  }

  const onSubmit = React.useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      setIsValid(isCompanyId(state.companyId))
      onSearch(event)
      if (isCompanyId(state.companyId)) {
        setOpenSuggest(false)
      }
    },
    [setIsValid, onSearch, setOpenSuggest, state.companyId]
  )

  const onSelectSearchedItem = React.useCallback(
    company => {
      setIsValid(true)
      const newState = {
        ...state,
        companyId: company.company_id,
      }
      getData(newState, true)
      setOpenSuggest(false)
    },
    [getData, setOpenSuggest, state]
  )

  return (
    <Flex sx={{ justifyContent: 'space-between', mb: 5 }}>
      <form onSubmit={onSubmit}>
        <Popover
          open={openSuggest}
          setOpen={setOpenSuggest}
          positions={['bottom']}
          align="start"
          noArrow
          sx={{ mb: 5 }}
          divSx={{ flex: '1', position: 'relative' }}
          content={
            <Box
              sx={{
                bg: Palette.bgGray,
                borderRadius: 6,
                mt: 1,
                width: 600,
                overflow: 'hidden',
              }}
            >
              {!!state.searchBy &&
                (suggestLoading ? (
                  <Updating loading sx={{ py: 5, px: 4 }} />
                ) : suggestData?.getSuggestCompanyResults?.data?.length ? (
                  <Box sx={{ px: 4, maxHeight: '35vh', overflow: 'auto' }}>
                    {suggestData?.getSuggestCompanyResults.data.map((comp, searchIndex) => {
                      const isDisable = false
                      const sx = isDisable
                        ? {
                            cursor: 'not-allow',
                            opacity: 0.7,
                          }
                        : {
                            cursor: 'pointer',
                            '&:hover': { color: 'primary' },
                            opacity: 1,
                          }
                      return (
                        <Grid
                          gap={2}
                          columns={[3, `1.75fr 1fr .8fr .8fr`]}
                          key={comp.company_id + comp.source + comp.field + searchIndex}
                          sx={{
                            ...sx,
                            py: 3,
                          }}
                          onClick={() => onSelectSearchedItem(comp)}
                        >
                          <Text
                            as="p"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: 600,
                            }}
                          >
                            {comp.value}
                          </Text>
                          <Text
                            as="p"
                            sx={{
                              pl: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {SearchReferenceField[comp.field]}
                          </Text>
                          <Text
                            as="p"
                            sx={{
                              pl: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ReverseSource[comp.source] || ''}
                          </Text>
                          <Text
                            as="p"
                            sx={{
                              pl: 2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {comp.company_id}
                          </Text>
                        </Grid>
                      )
                    })}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 5,
                      px: 4,
                    }}
                  >
                    No Data
                  </Box>
                ))}
            </Box>
          }
          zIndex={popoverZIndex}
        >
          <Flex
            sx={{
              backgroundColor: 'background',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingY: 3,
              paddingX: 6,
              py: 0,
              px: 3,
              bg: 'gray03',
              minWidth: 600,
              height: '100%',
            }}
          >
            <TextField
              sx={{ mr: 5 }}
              onChange={onChangeCompanyId}
              value={state.companyId as string}
              name="companyId"
              size="small"
              placeholder={placeholder}
              fieldState={!isValid ? 'error' : 'default'}
              tooltipError="Please enter a valid company ID"
            />
            <Button
              icon="search"
              size="normal"
              onPress={() => {
                onSubmit()
              }}
              disabled={!isValid}
            />
          </Flex>
        </Popover>
      </form>

      <Flex sx={{ alignItems: 'center' }}>
        <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Search by</Label>
        <Dropdown
          sx={{ minWidth: 220, mr: 3 }}
          name="searchBy"
          value={state.searchBy as string}
          onChange={onChangeSearchBy}
          options={option}
        />

        <Label sx={{ width: 'auto', m: 0, mr: 3 }}>Total</Label>
        <Dropdown
          sx={{ mr: 3 }}
          name="searchBy"
          value={state.total}
          onChange={onChangeTotal}
          options={totalOptions}
        />
      </Flex>
    </Flex>
  )
}

export default SimilarCompaniesFilters
