import { useApolloClient } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import { GET_COMPANY_OVERRIDES_HISTORY } from '../../pages/CompanyForm/graphql'
import { ColumnNames, invalidUpdateData, TableNames } from '../../pages/CompanyForm/helpers'
import {
  CurrencyConversionType,
  fields,
  UpdateCurrencyConversionState,
  ECurrencyConversion,
} from '../../pages/SourceMappingManagement'
import strings from '../../strings'
import { OverridesData } from '../../types'
import { EnumCompanySource } from '../../types/enums'
import { idNANumber } from '../../utils/consts'
import Modal from '../Modal'
import { OverridesHistory } from '../OverridesHistory'
import { Heading } from '../primitives'
import ReasonPopover from '../ReasonPopover'
import TextField from '../TextField'
import Updating from '../Updating'

type Props = {
  loading: boolean
  data: CurrencyConversionType
  oldData?: CurrencyConversionType
  pendingUpdate?: UpdateCurrencyConversionState
  setPendingUpdate(state: UpdateCurrencyConversionState): void
  onChange(state: CurrencyConversionType): void
}
type DataOverrideState = Record<keyof CurrencyConversionType, OverridesData[]>

const CurrencyConversionForm = ({
  loading,
  data,
  oldData,
  pendingUpdate,
  setPendingUpdate,
  onChange,
}: Props) => {
  const client = useApolloClient()

  const [reason, setReason] = useState<string>('')
  const [dataOverrides, setDataOverrides] = useState<DataOverrideState>({} as DataOverrideState)
  const [viewHistoryData, setViewHistoryData] = useState<OverridesData[]>([])
  const [loadingOverride, setLoadingOverride] = useState<boolean>(false)

  // Effect
  useEffect(() => {
    const fetchData = async () => {
      const input = {
        tableName: TableNames.CURRENCY_CONVERSION,
        columnName: ColumnNames.RATE,
        companyId: idNANumber,
        rowId: `${data.id}`,
        source: EnumCompanySource.BCG,
      }
      const rateQuery = client.query({
        query: GET_COMPANY_OVERRIDES_HISTORY,
        variables: { input },
        fetchPolicy: 'no-cache',
      })
      setLoadingOverride(true)
      await Promise.all([rateQuery])
        .then(([rate]) => {
          setDataOverrides({ rate: rate.data.getCompanyOverrideHistory } as DataOverrideState)
        })
        .catch(() => {})
      setLoadingOverride(false)
    }

    // call the function
    fetchData().catch(console.error)
  }, [client, data.id, setDataOverrides])

  const revertChange = (key: keyof CurrencyConversionType, oldValue: string | number) => {
    const cloneState = { ...(pendingUpdate || {}) }
    onChange({ ...data, [key]: cloneState[key]?.newValue || oldValue } as CurrencyConversionType)
    delete cloneState[key]
    setPendingUpdate(cloneState as UpdateCurrencyConversionState)
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Heading as="h4" sx={{ fontWeight: 'bold', mb: 5 }}>
          Edit Currency Conversion
        </Heading>
        {loadingOverride ? (
          <Updating loading sx={{ py: 7 }} />
        ) : (
          fields.map(item => {
            const disabled = item.key !== ECurrencyConversion.RATE
            const value = data[item.key]
            const oldValue = (oldData || {})[item.key] || ''
            const invalid = item?.validate && item.validate(value)
            return (
              <ReasonPopover
                key={item.key}
                reasonRequired={false}
                disabled={disabled}
                sx={{ mt: 4 }}
                labelSx={{ opacity: disabled ? 0.5 : 1, mb: 3 }}
                variant={invalid ? 'error' : 'black'}
                buttons={[
                  {
                    label: 'Save',
                    action: () => {
                      setPendingUpdate({
                        ...(pendingUpdate || {}),
                        [item.key]: {
                          id: data.id,
                          tableName: TableNames.CURRENCY_CONVERSION,
                          columnName: item.key,
                          oldValue: oldValue,
                          newValue: value,
                          source: EnumCompanySource.BCG,
                          reason,
                          companyId: idNANumber,
                        },
                      } as UpdateCurrencyConversionState)
                    },
                    type: 'primary',
                    disabled:
                      invalid ||
                      loading ||
                      invalidUpdateData(oldValue, value, reason, true, true, false),
                    isCancel: true,
                  },
                ]}
                oldValue={oldValue}
                newValue={`${value}`?.trim()}
                reason={reason}
                setReason={setReason}
                label={item.label}
                viewHistory={
                  dataOverrides[item.key]?.length
                    ? () => {
                        setViewHistoryData(dataOverrides[item.key])
                      }
                    : undefined
                }
                onClickOutSide={() => revertChange(item.key, oldValue)}
                onCancelCallBack={() => revertChange(item.key, oldValue)}
              >
                <TextField
                  name={item.key}
                  onChange={e => {
                    onChange({ ...data, [item.key]: e.target.value })
                  }}
                  onBlur={(name, e) => {
                    onChange({ ...data, [item.key]: e?.target?.value?.trim() })
                  }}
                  value={data[item.key]}
                  disabled={disabled || loading}
                  fieldState={invalid ? 'error' : 'default'}
                ></TextField>
              </ReasonPopover>
            )
          })
        )}
      </Box>

      {!!viewHistoryData.length && (
        <Modal
          sx={{ p: 4, maxWidth: '70vw', alignItems: 'flex-start', minWidth: '730px' }}
          buttons={[
            {
              label: 'OK',
              action: () => {
                setViewHistoryData([])
              },
              type: 'primary',
              sx: {
                p: '10px 60px',
              },
            },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
            {strings.pages.addCompanyForm.modals.overrides.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <OverridesHistory data={viewHistoryData} />
          </Box>
        </Modal>
      )}
    </>
  )
}

export default CurrencyConversionForm
