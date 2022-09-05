import { useMutation, useLazyQuery } from '@apollo/client'
import React, { useContext, useRef, useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import {
  Button,
  CurrencyConversionForm,
  Drawer,
  Dropdown,
  FilterTemplate,
  Modal,
  Pagination,
  Updating,
} from '../../../components'
import { ErrorModal } from '../../../components/ErrorModal'
import { Paragraph } from '../../../components/primitives'
import { ETLRunTimeContext } from '../../../context'
import { onError } from '../../../sentry'
import strings from '../../../strings'
import { Palette } from '../../../theme'
import { IPagination } from '../../../types'
import { localstorage, LocalstorageFields } from '../../../utils'
import { OVERRIDE_COMPANY_DATA } from '../../CompanyForm/graphql'
import { OverridesCompanyDataInput } from '../../CompanyForm/helpers'
import { GET_CURRENCY_CONVERSION } from '../graphql'
import {
  allOption,
  CurrencyConversionType,
  currencyOptions,
  fields,
  FilterType,
  UpdateCurrencyConversionState,
  yearOptions,
} from '../helpers'

const defaultFilter: FilterType = {
  year: allOption.value,
  currency: allOption.value,
}
const defaultPagination: IPagination = {
  page: 1,
  pageSize: 10,
}
const CurrencyConversionEdit = () => {
  const { common: copy } = strings
  const isFirstRun = useRef(true)
  const { checkTimeETL } = useContext(ETLRunTimeContext)

  const [key, setKey] = useState<number>(0)
  const [pagination, setPagination] = useState<IPagination>({ ...defaultPagination })
  const [data, setData] = useState<CurrencyConversionType[]>([])
  const [total, setTotal] = useState<number>(0)
  const [editItem, setEditItem] = useState<CurrencyConversionType | undefined>()
  const [pendingUpdate, setPendingUpdate] = useState<UpdateCurrencyConversionState>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [filterState, setFilterState] = useState<FilterType>({ ...defaultFilter })

  // GRAPHQL
  const [getCurrency, { loading }] = useLazyQuery(GET_CURRENCY_CONVERSION, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    onCompleted(data) {
      setData(data.getCurrencyConversion.data)
      if (data.getCurrencyConversion?.total !== total) {
        setTotal(data.getCurrencyConversion.total)
      }
    },
    onError(error) {
      setErrorMessage(error.message)
    },
  })
  const [update, { loading: updating }] = useMutation<
    any,
    { input: OverridesCompanyDataInput[]; isAppendData?: boolean }
  >(OVERRIDE_COMPANY_DATA)

  const getLocalFilter = React.useCallback(() => {
    const localState = localstorage.get(LocalstorageFields.CURRENCY_CONVERSION_FILTER)
    return localState ? JSON.parse(localState) : localState
  }, [])

  const onChangeFilter = React.useCallback(
    (newFilter: FilterType) => {
      setFilterState(newFilter)
    },
    [setFilterState]
  )

  const gotoPage = React.useCallback(
    (pagination: IPagination, filter: FilterType) => {
      localstorage.set(LocalstorageFields.CURRENCY_CONVERSION_FILTER, JSON.stringify(filter))
      const page = pagination.page < 1 ? 1 : pagination.page
      setPagination({ page, pageSize: pagination.pageSize })
      getCurrency({
        variables: {
          input: { pagination: { page, size: pagination.pageSize }, ...filter },
        },
      })
    },
    [getCurrency]
  )

  const onCancel = () => {
    setPendingUpdate({} as UpdateCurrencyConversionState)
    setEditItem(undefined)
  }

  const onSave = async () => {
    try {
      if (!checkTimeETL()) return
      if (pendingUpdate && !!Object.keys(pendingUpdate).length) {
        const input = [...Object.values(pendingUpdate).map(item => ({ ...item, id: `${item.id}` }))]
        await update({ variables: { input, isAppendData: false } })
        if (editItem) {
          const index = data.findIndex(({ id }) => editItem?.id === id)
          const cloneData = data.map((item, idx) => (idx === index ? editItem : item))
          setData(cloneData)
        }
      }
    } catch (error) {
      setErrorMessage(error.message)
      onError(error)
    } finally {
      onCancel()
    }
  }

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      const filter = getLocalFilter()
      if (filter) {
        onChangeFilter(filter)
      }
      gotoPage(defaultPagination, filter || defaultFilter)
    }
  }, [getLocalFilter, gotoPage, onChangeFilter])

  return (
    <>
      <Flex sx={{ justifyContent: 'flex-end', mb: 5, alignItems: 'center' }}>
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
          key={key}
          onClose={() => {
            setFilterVisible(false)
            setFilterState(getLocalFilter() || defaultFilter)
          }}
          resetFilter={() => {
            setFilterVisible(false)
            setFilterState({ ...defaultFilter })
            gotoPage({ ...pagination, page: 1 }, defaultFilter)
            setKey(key + 1) // re-render UI when reset filter
          }}
          buttons={[
            {
              label: 'Apply',
              action: () => {
                gotoPage({ ...pagination, page: 1 }, filterState)
                setFilterVisible(false)
              },
              sx: { px: 16, py: 2, borderRadius: 8 },
            },
          ]}
        >
          <Dropdown
            label="Year"
            name="year"
            sx={{ mb: 4 }}
            options={[allOption, ...yearOptions]}
            value={filterState.year}
            onChange={e => {
              onChangeFilter({ ...filterState, year: e.target.value })
            }}
          />
          <Dropdown
            label="Currency"
            name="currency"
            options={[allOption, ...currencyOptions]}
            value={filterState.currency}
            onChange={e => {
              onChangeFilter({ ...filterState, currency: e.target.value })
            }}
          />
        </FilterTemplate>
      </Drawer>
      {loading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <>
          {data.length ? (
            <>
              <Box>
                <Flex sx={{ p: 2, mr: 40 }}>
                  {fields.map(({ label, key }) => (
                    <Label key={key} sx={{ flex: 1 }}>
                      {label}
                    </Label>
                  ))}
                </Flex>
                {data.map((item: CurrencyConversionType, index) => {
                  return (
                    <Flex
                      key={index}
                      sx={{
                        bg: index % 2 === 0 ? Palette.gray03 : Palette.white,
                        alignItems: 'center',
                        minHeight: '40px',
                        borderRadius: 10,
                        p: 2,
                      }}
                    >
                      {fields.map(({ key, format }) => (
                        <Paragraph key={key} sx={{ flex: 1 }}>
                          {format ? format(item[key]) : item[key]}
                        </Paragraph>
                      ))}
                      <Button
                        sx={{ height: 'auto' }}
                        color="primary"
                        variant="invert"
                        icon="pencil"
                        onPress={() => {
                          setEditItem(item)
                        }}
                      />
                    </Flex>
                  )
                })}
              </Box>

              <Pagination
                sx={{ justifyContent: 'center' }}
                currentPage={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={Math.ceil(total / pagination.pageSize)}
                changePage={page => {
                  gotoPage({ ...pagination, page }, filterState)
                }}
                changePageSize={pageSize => {
                  gotoPage({ ...defaultPagination, pageSize }, filterState)
                }}
              />
            </>
          ) : (
            <Paragraph sx={{ textAlign: 'center', p: 6 }}>NO DATA AVAILABLE</Paragraph>
          )}
        </>
      )}
      {editItem && (
        <Modal
          sx={{ padding: 6, minWidth: 500 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%' }}
          buttons={[
            {
              label: copy.cancel,
              action: onCancel,
              type: 'secondary',
              disabled: updating,
            },
            {
              label: copy.save,
              action: onSave,
              type: 'primary',
              disabled: updating,
            },
          ]}
        >
          <CurrencyConversionForm
            loading={updating}
            data={editItem}
            oldData={data.find(({ id }) => id === editItem.id)}
            pendingUpdate={pendingUpdate}
            setPendingUpdate={setPendingUpdate}
            onChange={setEditItem}
          />
        </Modal>
      )}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onOK={() => {
            setErrorMessage(undefined)
          }}
        />
      )}
    </>
  )
}

export default CurrencyConversionEdit
