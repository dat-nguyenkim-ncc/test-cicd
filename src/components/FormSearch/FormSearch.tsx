import React, { CSSProperties, FormEvent, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { debounce } from 'lodash'
import { Search } from '..'
import { Size } from '../../types'
import { Routes } from '../../types/enums'
import { clearCoverageState, isURL } from '../../utils'
import { getUrlDomain } from '../../utils/helper'
import { useLazyQuery } from '@apollo/client'
import {
  CompanySuggestion,
  GET_SUGGEST_COMPANY_RESULTS,
  SearchReferenceField,
  SuggestCompanyResponse,
} from '../../graphql/query/getSuggestCompanyResults'
import { Box, Button, Grid, Text } from 'theme-ui'
import Icon from '../Icon'
import Tooltip from '../Tooltip'
import { Popover, Updating } from '..'
import { popoverZIndex } from '../../utils/consts'
import { Palette } from '../../theme'
import { ReverseSource } from '../../utils/getSource'
import { StateCurrent } from '../../pages/Company/Company'
import { ColumnNames } from '../../pages/CompanyForm/helpers'

type State = {
  search?: string
}

type FormSearchProps = {
  placeholder?: string
  defaultValue?: string
  size?: Size
  inputId: string
  baseUrl: Routes
  backgroundColor?: string
  refetch?: () => void
  pageCurrent?: StateCurrent
}

const TEXT_TRUNCATE_CSS: CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const FormSearch = ({
  defaultValue,
  placeholder,
  size = 'big',
  inputId,
  baseUrl,
  refetch,
  backgroundColor,
  pageCurrent,
}: FormSearchProps) => {
  const [state, setState] = useState<State>({ search: defaultValue || '' })
  const [openSuggest, setOpenSuggest] = useState(false)
  const [suggestedCompanies, setSuggestedCompanies] = useState<CompanySuggestion[]>([])
  const history = useHistory()
  const firstRender = React.useRef(true)

  const [suggestCompanies, { data: suggestData, loading: suggestLoading }] = useLazyQuery<
    SuggestCompanyResponse
  >(GET_SUGGEST_COMPANY_RESULTS, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setSuggestedCompanies(suggestData?.getSuggestCompanyResults.data || [])
    },
  })

  React.useEffect(() => {
    if (defaultValue && firstRender.current) {
      suggestCompanies({ variables: { query: defaultValue, limit: 100 } })
      firstRender.current = false
    }
  }, [defaultValue, suggestCompanies])

  const debounceSuggest = React.useCallback(
    debounce(query => suggestCompanies({ variables: { query, limit: 100 } }), 400),
    []
  )
  const onChangeSearch = (search: string) => {
    setState({ ...state, search: search.trim() })
    debounceSuggest(getUrlDomain(search.trim()))
  }

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    if (!state.search || state.search.length < 2) return
    clearCoverageState()
    let searchString = state.search
    if (isURL(searchString)) {
      searchString = getUrlDomain(searchString)
      setState({ ...state, search: searchString })
    }
    history.push(baseUrl.replace(':query', encodeURIComponent(searchString)))
    refetch && refetch()
  }

  const onSelectSearchedItem = (company: CompanySuggestion) => {
    clearCoverageState()
    let searchString = company.value
    if (isURL(searchString)) {
      searchString = getUrlDomain(searchString)
    }
    setState({ ...state, search: searchString })
    setOpenSuggest(false)
    setSuggestedCompanies(suggestedCompanies.filter(c => c.company_id === company.company_id))
    history.push(baseUrl.replace(':query', encodeURIComponent(searchString)))
  }

  const getInputWidth = (id: string = '') => {
    const defaultWidth = 650
    try {
      const ele = document.getElementById(id)
      return ele?.clientWidth || defaultWidth
    } catch (error) {
      return defaultWidth
    }
  }

  const handleExpressLinkButtonOnClick = (companyId: number) => {
    setOpenSuggest(false)
    history.push(Routes.COMPANY.replace(':id', companyId.toString()))
  }

  const isActive = pageCurrent?.active === ColumnNames.PRODUCTS

  return (
    <form onSubmit={onSearch}>
      <Popover
        open={openSuggest}
        setOpen={setOpenSuggest}
        positions={['bottom', 'top']}
        align="start"
        noArrow
        sx={{ mb: 5 }}
        divSx={{ flex: '1', position: 'relative' }}
        content={
          <Box
            sx={{
              mx: baseUrl === Routes.MERGE_COMPANY ? 5 : 6,
              mt: size === 'big' ? '-70px' : '-9px',
            }}
          >
            <Box
              sx={{
                bg: Palette.bgGray,
                borderRadius: 6,
                my: 0,
                width: getInputWidth(inputId),
                overflow: 'hidden',
              }}
            >
              {!!state?.search &&
                (suggestLoading ? (
                  <Updating loading sx={{ py: 3, px: 4 }} />
                ) : suggestedCompanies.length ? (
                  <Box sx={{ px: 4, maxHeight: '35vh', overflow: 'auto' }}>
                    {suggestedCompanies.map((comp, searchIndex) => {
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
                          columns={[4, `1.75fr 1fr 1fr auto`]}
                          key={comp.company_id + comp.source + comp.field + searchIndex}
                          sx={{
                            ...sx,
                            py: 3,
                            alignItems: 'center',
                            borderBottom:
                              searchIndex + 1 === suggestedCompanies.length
                                ? 0
                                : `1px solid ${Palette.gray01}`,
                          }}
                          onClick={() => onSelectSearchedItem(comp)}
                        >
                          <Text as="p" sx={{ ...TEXT_TRUNCATE_CSS, fontWeight: 600 }}>
                            {comp.value}
                          </Text>

                          <Text as="p" sx={{ ...TEXT_TRUNCATE_CSS, pl: 2 }}>
                            {SearchReferenceField[comp.field]}
                          </Text>

                          <Text as="p" sx={{ ...TEXT_TRUNCATE_CSS, pl: 2 }}>
                            {ReverseSource[comp.source] || ''}
                          </Text>

                          <div>
                            {/* wrap tooltip */}
                            <Tooltip content="Go to the company page" isShow>
                              <Button
                                sx={{ pt: 2, pl: 2, pb: 1, pr: 1 }}
                                onClick={event => {
                                  event.stopPropagation()
                                  handleExpressLinkButtonOnClick(comp.company_id)
                                }}
                              >
                                <Icon icon="link" color="white" />
                              </Button>
                            </Tooltip>
                          </div>
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
                      py: 3,
                      px: 4,
                    }}
                  >
                    No Data
                  </Box>
                ))}
            </Box>
          </Box>
        }
        zIndex={popoverZIndex}
      >
        <Search
          inputId={inputId}
          onSearch={onSearch}
          onChange={onChangeSearch}
          sx={{
            mt: size === 'big' ? 5 : 0,
            mb: 5,
            px: baseUrl === Routes.MERGE_COMPANY ? 5 : 6,
            width: isActive ? '95vw' : '100%',
            marginLeft: isActive ? 'calc((-95vw + 1024px)/2)' : '',
            marginRight: isActive ? 'calc((-95vw + 1024px)/2)' : '',
            maxWidth: isActive ? '95vw' : '100%',
          }}
          size={size}
          value={state.search}
          placeholder={placeholder}
          bindValue
          backgroundColor={backgroundColor}
        />
      </Popover>
    </form>
  )
}

export default FormSearch
