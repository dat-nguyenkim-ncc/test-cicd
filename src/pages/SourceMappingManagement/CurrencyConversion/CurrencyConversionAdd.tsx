import { useMutation, useQuery } from '@apollo/client'
import { debounce } from 'lodash'
import React, { useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { Button, Modal, TextField, Updating } from '../../../components'
import { ErrorModal } from '../../../components/ErrorModal'
import { Heading, Paragraph } from '../../../components/primitives'
import { ETLRunTimeContext } from '../../../context'
import { onError } from '../../../sentry'
import strings from '../../../strings'
import { Palette } from '../../../theme'
import { ChangeFieldEvent } from '../../../types'
import { FORM_CHANGE_DEBOUNCE_TIME } from '../../../utils/consts'
import { ADD_CURRENCY_CONVERSION, GET_UNCONVERTED_CURRENCIES } from '../graphql'
import { CurrencyConversionType, fields } from '../helpers'

const fieldsShow = fields.slice(0, 2)

const CurrencyConversionAdd = () => {
  const { common: copy } = strings

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const [addItem, setAddItem] = useState<CurrencyConversionType | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  // GRAPHQL
  const { data, loading, refetch } = useQuery(GET_UNCONVERTED_CURRENCIES, {
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  })
  const [addCurrencyConversion, { loading: adding }] = useMutation(ADD_CURRENCY_CONVERSION)

  const onChangeField = React.useCallback(
    debounce((name, value) => {
      setAddItem({ ...addItem, [name]: value } as CurrencyConversionType)
    }, FORM_CHANGE_DEBOUNCE_TIME),
    [addItem]
  )

  const invalidInput = React.useMemo(
    () =>
      addItem &&
      fields.some(
        item => !addItem[item.key] || (item?.validate && item.validate(addItem[item.key]))
      ),
    [addItem]
  )

  const onCancel = () => {
    setAddItem(undefined)
  }

  const onAdd = async () => {
    if (!addItem || invalidInput || !checkTimeETL()) return
    try {
      const { year, currency, rate } = addItem
      await addCurrencyConversion({
        variables: {
          input: { year, currency, rate },
        },
      })
      refetch()
    } catch (error) {
      setErrorMessage(error.message)
      onError(error)
    } finally {
      onCancel()
    }
  }

  return (
    <>
      {loading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <Box sx={{ mt: 5 }}>
          {data?.getUnconvertedCurrencies?.length ? (
            <>
              <Box>
                <Flex sx={{ p: 2, mr: 40 }}>
                  {fieldsShow.map(({ label, key }) => (
                    <Label key={key} sx={{ flex: 1 }}>
                      {label}
                    </Label>
                  ))}
                </Flex>
                {data.getUnconvertedCurrencies.map(
                  (item: CurrencyConversionType, index: number) => {
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
                        {fieldsShow.map(({ key, format }) => (
                          <Paragraph key={key} sx={{ flex: 1 }}>
                            {item[key] ? (format ? format(item[key]) : item[key]) : 'NULL'}
                          </Paragraph>
                        ))}
                        <Button
                          sx={{ height: 'auto' }}
                          color="primary"
                          variant="invert"
                          icon="plus"
                          onPress={() => {
                            if (!checkTimeETL()) return
                            setAddItem({ ...item, rate: '' })
                          }}
                        />
                      </Flex>
                    )
                  }
                )}
              </Box>
            </>
          ) : (
            <Paragraph sx={{ textAlign: 'center', p: 6 }}>NO DATA AVAILABLE</Paragraph>
          )}
        </Box>
      )}
      {addItem && (
        <Modal
          sx={{ padding: 6, minWidth: 500 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%' }}
          buttons={[
            {
              label: copy.cancel,
              action: onCancel,
              type: 'secondary',
              disabled: adding,
            },
            {
              label: copy.save,
              action: onAdd,
              type: 'primary',
              disabled: adding || invalidInput,
            },
          ]}
        >
          <Box sx={{ width: '100%' }}>
            <Heading as="h4" sx={{ fontWeight: 'bold', mb: 5 }}>
              Add Currency Conversion
            </Heading>
            {fields.map((item, index) => {
              const disabled = !item.canEdit
              const value = addItem[item.key]
              const invalid = item?.validate && item.validate(value)
              return (
                <TextField
                  key={index}
                  sx={{ mt: 4 }}
                  name={item.key}
                  label={item.label}
                  value={value}
                  disabled={disabled || loading}
                  fieldState={invalid ? 'error' : 'default'}
                  onChange={(e: ChangeFieldEvent) => {
                    onChangeField(e.target.name, e.target.value)
                  }}
                ></TextField>
              )
            })}
          </Box>
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

export default CurrencyConversionAdd
