import { useLazyQuery } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Button, Dropdown, Modal, TextField } from '..'
import { RoundProps, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import { GET_COMPANY_OVERRIDES_HISTORY } from '../../pages/CompanyForm/graphql'
import {
  invalidUpdateData,
  OverridesCompanyDataInput,
  SourceIndependentTables,
  TableNames,
  TableNamesValues,
  transformPostDate,
  transformViewDate,
  validateDate,
  validateMoney,
} from '../../pages/CompanyForm/helpers'
import strings from '../../strings'
import {
  ChangeFieldEvent,
  FormOption,
  PopoverPositions,
  Variants,
  ViewInterface,
} from '../../types'
import { checkLength } from '../../utils'
import { OverridesHistory } from '../OverridesHistory'
import { Heading } from '../primitives'
import ReasonPopover from '../ReasonPopover'
import { FieldTypes } from '../TextField'
import { EnumExpandStatus, EnumReverseCompanySource } from '../../types/enums'
import InvestorForm, { Investor } from '../InvestorForm'
import { investor } from '../../pages/CompanyForm/mock'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export enum AcquisitionFieldNames {
  acquisition_date = 'acquisition_date',
  price = 'price',
  source = 'source',
  comment = 'comment',
  status = 'status',
}

const PREFERED_POSITIONS = {
  [AcquisitionFieldNames.acquisition_date]: ['right', 'left', 'bottom'],
  [AcquisitionFieldNames.price]: ['left', 'right', 'bottom'],
  [AcquisitionFieldNames.status]: ['left', 'right', 'bottom'],
}

export type AcquisitionFieldNameKeys = keyof typeof AcquisitionFieldNames

export type AcquisitionForm = {
  acquisition_id?: string
  price?: string
  status?: string
  acquisition_date?: string
  source?: string
  comment?: string
  investors: Investor[]
  api_append?: string
  /* No match with DB column */
  expandStatus?: EnumExpandStatus | null
  selfDeclared?: boolean
  priceCurrency?: String
  sourcePrice?: String
  company?: {
    company_id: number
    name: string
    logo_bucket_url: string
    fct_status_id?: number
    category?: string
  }
}

type Fields = {
  name: AcquisitionFieldNameKeys
  key: keyof typeof strings.pages.addCompanyForm.acquisitions.fields
  type: FieldTypes
  placeholder?: string
  required?: boolean
  format?(value: string | number): string
  formatError?: string
  maxlength?: number
  maxWord?: number
  option?: FormOption[]
  table?: TableNamesValues
  disabled?: boolean
}

const fields: Fields[] = [
  {
    name: AcquisitionFieldNames.acquisition_date,
    key: AcquisitionFieldNames.acquisition_date,
    type: 'input',
    placeholder: DEFAULT_VIEW_DATE_FORMAT,
    format: validateDate,
    formatError: 'Invalid date',
    table: TableNames?.ACQUISITIONS,
    required: true,
  },
  {
    name: AcquisitionFieldNames.price,
    key: AcquisitionFieldNames.price,
    type: 'input',
    format: validateMoney,
    formatError: 'Invalid money',
    table: TableNames?.ACQUISITIONS,
  },
  {
    name: AcquisitionFieldNames.source,
    key: AcquisitionFieldNames.source,
    format: (v: string) =>
      EnumReverseCompanySource[v as keyof typeof EnumReverseCompanySource]?.toLocaleUpperCase() ||
      v,
    type: 'input',
    placeholder: 'BCG',
    disabled: true,
    table: TableNames?.ACQUISITIONS,
  },
  {
    name: AcquisitionFieldNames.status,
    key: AcquisitionFieldNames.status,
    type: 'dropdown',
    option: [
      { label: 'Complete', value: 'complete' },
      { label: 'Pending', value: 'pending' },
    ],
    table: TableNames?.ACQUISITIONS,
  },
  {
    name: AcquisitionFieldNames.comment,
    key: AcquisitionFieldNames.comment,
    type: 'textarea',
    table: TableNames?.ACQUISITIONS,
  },
]
export type UpdateAcquisitionState = Record<AcquisitionFieldNameKeys, OverridesCompanyDataInput>

type Props = ViewInterface<{
  errorInvestor?: any
  info?: React.ReactElement
  acquisition: AcquisitionForm
  companyId: number
  onRemove?(): void
  onChangeRoundData(state: AcquisitionForm): void
  isEdit?: boolean
  errorForm?: number[]
  setErrorForm?(errorFields: AcquisitionFieldNameKeys[]): void
  oldData?: AcquisitionForm
  setOldData?(round: AcquisitionForm): void
  setPendingUpdateData?(v: UpdateAcquisitionState): void
  pendingUpdateData?: UpdateAcquisitionState
  onChangeOldState?(column: string, value: string, investor_id: string): void
  setPendingUpdateInvestor?(v: OverridesCompanyDataInput): void
  refetchAPI?(): void
  queryLoading?: boolean
}> &
  ViewHistoryProps &
  RoundProps
export default ({
  companyId,
  acquisition,
  showViewHistory,
  refetchViewHistoryCols,
  onRemove,
  onChangeRoundData,
  isEdit,
  errorForm = [],
  setErrorForm,
  oldData = {} as AcquisitionForm,
  setOldData,
  onChangeOldState,
  pendingUpdateData = {} as UpdateAcquisitionState,
  setPendingUpdateData = v => {},
  setPendingUpdateInvestor,
  refetchAPI,
  queryLoading = false,
  sx,
  overviewPendingRequest,
  handleClickShowPendingCR,
  ...props
}: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const isFollowing = acquisition?.expandStatus === EnumExpandStatus.FOLLOWING
  const isAppendCq = acquisition?.expandStatus === EnumExpandStatus.CHANGE_REQUEST
  const reasonRequired = !props.isOverride && !isAppendCq
  // STATE

  const [errorFields, setErrorFieldsState] = useState<AcquisitionFieldNameKeys[]>([])
  const [historyModal, setHistoryModal] = useState(false)
  const [reason, setReason] = useState<string>('')

  // GRAPHQL
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  // METHOD

  const addInvestor = (investor: Investor) => {
    onChangeRoundData({
      ...acquisition,
      investors: [...acquisition.investors, investor],
    })
  }

  const onChangeInvestor = (event: ChangeFieldEvent, index: number) => {
    const { name, value } = event.target
    const cloneInvestor = [...acquisition.investors]
    const objInvestor = cloneInvestor[index]
    cloneInvestor[index] = { ...objInvestor, [name]: value }
    onChangeRoundData({ ...acquisition, investors: [...cloneInvestor] })
  }

  const onRemoveInvestor = (index: number) => {
    let cloneInvestorState = [...acquisition.investors]
    cloneInvestorState.splice(index, 1)
    onChangeRoundData({ ...acquisition, investors: [...cloneInvestorState] })
    setOldData && setOldData({ ...oldData, investors: cloneInvestorState })
  }

  const getValue = (name: AcquisitionFieldNameKeys) => (acquisition ? acquisition[name] || '' : '')

  const onChangeField = (event: ChangeFieldEvent) => {
    const { name, value } = event.target

    if (errorFields?.includes(name as AcquisitionFieldNameKeys)) {
      const newErrorFields = errorFields?.filter(f => f !== name)
      setErrorFields(newErrorFields)
    }

    onChangeRoundData({ ...acquisition, [name]: value })
  }

  const onBlurField = (name: AcquisitionFieldNameKeys) => {
    const field = fields.find(f => f.name === name)
    if (!field) return
    const fieldState = getFieldState(field)
    if (
      (fieldState === 'error' || (field.required && !getValue(name))) &&
      !errorFields?.includes(field.name)
    ) {
      setErrorFields([...errorFields, field.name])
    }
  }

  const getFieldState = (item: Fields): Variants => {
    if (!getValue(item.name)) return 'black'
    if (checkLength(getValue(item.name), item.maxlength)) return 'error'
    if (!item.format || !item.formatError) return 'black'
    if (item.format(getValue(item.name)) === '') return 'black'
    return item.format(getValue(item.name)) === item.formatError ? 'error' : 'black'
  }

  const formatColumn = (input: string) => {
    switch (input) {
      case 'price':
        return 'price_usd'
      default:
        return input
    }
  }

  const normalizeOverridesInput = (input: OverridesCompanyDataInput) => {
    const isDate = [AcquisitionFieldNames.acquisition_date]?.includes(
      input.columnName as AcquisitionFieldNames
    )

    return {
      id: acquisition.acquisition_id,
      tableName: input.tableName,
      columnName: formatColumn(input.columnName),
      oldValue: isDate && input.oldValue ? transformPostDate(input.oldValue) : input.oldValue,
      newValue: isDate && input.newValue ? transformPostDate(input.newValue) : input.newValue,
      source: input.source,
      reason: input.reason,
    }
  }

  const handleUpdateAcquisitions = async (item: Fields) => {
    const { table: tableName, name: columnName } = item
    const oldValue = oldData[item.name],
      newValue = getValue(item.name)

    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [item.name]: normalizeOverridesInput({
        tableName: tableName || '',
        columnName,
        reason,
        oldValue: oldValue || '',
        newValue: newValue,
        id: acquisition.acquisition_id || '',
        source: acquisition.source || '',
        companyId,
      }),
    } as UpdateAcquisitionState)

    setReason('')
  }

  // EFFECTS

  const setErrorFields = (errorFields: AcquisitionFieldNameKeys[]) => {
    setErrorFieldsState(errorFields)
    setErrorForm && setErrorForm(errorFields)
  }

  const checkDuplicate = ({ investor_name, investor_type }: Investor) => {
    const checkInvestor = acquisition.investors.filter(investor => {
      return investor.investor_name === investor_name
    })
    if (checkInvestor.length > 1) {
      return true
    }
    return false
  }

  const revertChange = (item: Fields) => {
    const { [item.name]: reverting } = pendingUpdateData
    const previousValue = reverting?.newValue || oldData[item.name]

    onChangeField({
      target: {
        name: item.name,
        value:
          item.name === AcquisitionFieldNames.acquisition_date
            ? transformViewDate(previousValue)
            : previousValue,
      },
    } as ChangeFieldEvent)

    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [item.name]: normalizeOverridesInput({
        id: acquisition.acquisition_id || '',
        tableName: item.table || '',
        columnName: item.name,
        oldValue: oldData[item.name] || '',
        newValue: previousValue || '',
        source: oldData.source || '',
        reason: reverting?.reason || '',
        companyId,
      }),
    } as UpdateAcquisitionState)
  }

  const disabled = !!(acquisition.acquisition_id && !isFollowing && !isAppendCq)

  return (
    <Box sx={{ mt: 5, padding: 5, borderRadius: 12, background: 'white', ...sx }}>
      <Flex sx={{ mb: 4, justifyContent: 'flex-end' }}>
        {!isEdit && onRemove && (
          <Button
            onPress={() => onRemove && onRemove()}
            icon="remove"
            size="tiny"
            variant="black"
          />
        )}
      </Flex>
      <Grid gap={5} columns={[2, null, 2]}>
        {fields.map(item => {
          const fieldState: Variants = errorFields?.includes(item.name)
            ? 'error'
            : getFieldState(item)
          const fieldDisabled = item.disabled || disabled

          const fieldProps = {
            name: item.name,
            type: item.type,
            value: getValue(item.name),
            formattedValue: item.format ? item.format(getValue(item.name)) : undefined,
            variant: fieldState,
            placeholder: item.placeholder,
            onChange: onChangeField,
            onBlur: onBlurField,
            disabled: fieldDisabled,
            required: item.required,
          }
          const oldValue = oldData[item.name] || '',
            newValue = getValue(item.name)

          const numPending =
            overviewPendingRequest?.filter(
              (x: { tableName: string; columnName: any; rowId: string; source: string }) =>
                x.tableName === item.table &&
                x.columnName === formatColumn(item.name) &&
                x.rowId === acquisition.acquisition_id &&
                (SourceIndependentTables.includes(item.table)
                  ? true
                  : x.source === (oldData?.source || '') || x.source === 'NA')
            )[0]?.total || 0

          return (
            <ReasonPopover
              {...fieldProps}
              reasonRequired={reasonRequired}
              labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
              sx={
                item.name === AcquisitionFieldNames.comment
                  ? { gridColumnStart: 1, gridColumnEnd: 3 }
                  : {}
              }
              disabled={!isEdit || fieldDisabled}
              key={item.name}
              positions={
                PREFERED_POSITIONS[
                  item.name as keyof typeof PREFERED_POSITIONS
                ] as PopoverPositions[]
              }
              buttons={[
                {
                  label: isEdit ? 'Submit' : 'Update',
                  isCancel: true,
                  action: () => handleUpdateAcquisitions(item),
                  type: 'primary',
                  disabled:
                    fieldState === 'error' ||
                    invalidUpdateData(
                      oldValue,
                      newValue,
                      reason,
                      props.isOverride,
                      item.required,
                      isAppendCq
                    ),
                },
              ]}
              oldValue={oldValue}
              newValue={newValue}
              reason={reason}
              setReason={setReason}
              onClickOutSide={() => revertChange(item)}
              onCancelCallBack={() => revertChange(item)}
              label={copy.acquisitions.fields[item.key]}
              viewHistory={
                !showViewHistory(
                  item.table || '',
                  formatColumn(item.name),
                  acquisition.acquisition_id || '',
                  acquisition.source || ''
                )
                  ? undefined
                  : () => {
                      setHistoryModal(true)
                      getHistory({
                        variables: {
                          input: {
                            tableName: item.table,
                            columnName: formatColumn(item.name),
                            companyId: companyId ? +companyId : 0,
                            rowId: acquisition.acquisition_id,
                            source: oldData?.source || '',
                          },
                        },
                      })
                    }
              }
              viewPendingChangeRequest={
                !(numPending > 0)
                  ? undefined
                  : () => {
                      handleClickShowPendingCR({
                        tableName: item.table as string,
                        columnName: formatColumn(item.name),
                        companyId: companyId ? +companyId : 0,
                        rowId: acquisition.acquisition_id as string,
                        source: oldData?.source || '',
                      })
                    }
              }
              totalItemPendingCR={numPending}
            >
              {item.type === 'dropdown' ? (
                <Dropdown
                  name={item.name}
                  value={getValue(item.name)}
                  placeholder={item.placeholder}
                  options={item.option || []}
                  onChange={onChangeField}
                  variant={fieldState}
                  disabled={disabled}
                />
              ) : (
                <TextField
                  {...fieldProps}
                  fieldState={fieldState === 'error' ? 'error' : 'default'}
                />
              )}
            </ReasonPopover>
          )
        })}
      </Grid>
      <InvestorForm
        sx={{ mt: 4 }}
        name="Investor Name"
        nameType={strings.common.investorType}
        companyId={companyId}
        roundId={acquisition.acquisition_id}
        source={oldData.source}
        investorState={acquisition.investors}
        oldState={oldData.investors}
        investor={investor}
        checkDuplicate={checkDuplicate}
        onChange={onChangeInvestor}
        onRemoveItem={onRemoveInvestor}
        showViewHistory={showViewHistory}
        refetchViewHistoryCols={refetchViewHistoryCols}
        onChangeInvestor={(investor: Investor, index: number) => {
          const cloneInvestor = [...acquisition.investors]
          cloneInvestor[index] = { ...investor }
          onChangeRoundData({ ...acquisition, investors: [...cloneInvestor] })
        }}
        onChangeOldState={onChangeOldState}
        setOldState={newInvestor =>
          setOldData && setOldData({ ...oldData, investors: newInvestor })
        }
        disabled={disabled}
        hideSetLead={true}
        handleUpdateInvestor={setPendingUpdateInvestor}
        addInvestor={addInvestor}
        refetchAPI={refetchAPI}
        queryLoading={queryLoading}
        viewHistory={item => {
          setHistoryModal(true)
          getHistory({
            variables: {
              input: {
                ...item,
                source: item.source,
                companyId: companyId ? +companyId : 0,
              },
            },
          })
        }}
      />
      {historyModal && (
        <Modal
          sx={{ p: 4, maxWidth: '60vw', alignItems: 'flex-start', minWidth: '600px' }}
          buttons={[
            {
              label: 'OK',
              action: () => {
                setHistoryModal(false)
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
            {copy.modals.overrides.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <OverridesHistory
              loading={getHistoryLoading}
              data={getHistoryData?.getCompanyOverrideHistory}
            />
          </Box>
        </Modal>
      )}
    </Box>
  )
}
