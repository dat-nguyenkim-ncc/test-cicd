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
  validateNumber,
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
import { EnumExpandStatus } from '../../types/enums'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export enum IpoFieldNames {
  amount = 'amount',
  share_price = 'share_price',
  shares_outstanding = 'shares_outstanding',
  shares_sold = 'shares_sold',
  stock_exchange = 'stock_exchange',
  stock_symbol = 'stock_symbol',
  valuation = 'valuation',
  went_public_on = 'went_public_on',
}

const PREFERED_POSITIONS = {
  [IpoFieldNames.amount]: ['right', 'left', 'bottom'],
  [IpoFieldNames.share_price]: ['left', 'right', 'bottom'],
  [IpoFieldNames.shares_outstanding]: ['right', 'left', 'bottom'],
  [IpoFieldNames.shares_sold]: ['left', 'right', 'bottom'],
  [IpoFieldNames.stock_exchange]: ['right', 'left', 'bottom'],
  [IpoFieldNames.stock_symbol]: ['left', 'right', 'bottom'],
  [IpoFieldNames.valuation]: ['right', 'left', 'bottom'],
  [IpoFieldNames.went_public_on]: ['left', 'right', 'bottom'],
}

export type IpoFieldNameKeys = keyof typeof IpoFieldNames

export type IpoForm = {
  ipo_id?: string
  amount?: string
  share_price?: string
  shares_outstanding?: string
  shares_sold?: string
  stock_exchange?: string
  stock_symbol?: string
  valuation?: string
  went_public_on?: string
  source?: string
  api_append?: string
  /* No match with DB column */
  expandStatus?: EnumExpandStatus | null
  selfDeclared?: boolean
  sourceAmount?: string
  amountCurrency?: string
}

type Fields = {
  name: IpoFieldNameKeys
  key: keyof typeof strings.pages.addCompanyForm.ipos.fields
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
    name: IpoFieldNames.amount,
    key: IpoFieldNames.amount,
    type: 'input',
    format: validateMoney,
    formatError: 'Invalid money',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.share_price,
    key: IpoFieldNames.share_price,
    type: 'input',
    format: validateMoney,
    formatError: 'Invalid money',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.shares_outstanding,
    key: IpoFieldNames.shares_outstanding,
    type: 'input',
    format: validateNumber,
    formatError: 'Invalid number',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.shares_sold,
    key: IpoFieldNames.shares_sold,
    type: 'input',
    format: validateNumber,
    formatError: 'Invalid number',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.stock_exchange,
    key: IpoFieldNames.stock_exchange,
    type: 'input',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.stock_symbol,
    key: IpoFieldNames.stock_symbol,
    type: 'input',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.valuation,
    key: IpoFieldNames.valuation,
    type: 'input',
    format: validateMoney,
    formatError: 'Invalid money',
    table: TableNames?.IPO,
  },
  {
    name: IpoFieldNames.went_public_on,
    key: IpoFieldNames.went_public_on,
    type: 'input',
    placeholder: DEFAULT_VIEW_DATE_FORMAT,
    format: validateDate,
    formatError: 'Invalid date',
    table: TableNames?.IPO,
  },
]
export type UpdateIpoState = Record<IpoFieldNameKeys, OverridesCompanyDataInput>

type Props = ViewInterface<{
  info?: React.ReactElement
  ipo: IpoForm
  companyId: number
  onRemove?(): void
  onChangeRoundData(state: IpoForm): void
  isEdit?: boolean
  errorForm?: number[]
  setErrorForm?(errorFields: IpoFieldNameKeys[]): void
  oldData?: IpoForm
  setOldData?(round: IpoForm): void
  setPendingUpdateData?(v: UpdateIpoState): void
  pendingUpdateData?: UpdateIpoState
  setPendingUpdateInvestor?(v: OverridesCompanyDataInput): void
}> &
  ViewHistoryProps &
  RoundProps
export default ({
  companyId,
  ipo,
  showViewHistory,
  onRemove,
  onChangeRoundData,
  isEdit,
  setErrorForm,
  oldData = {} as IpoForm,
  pendingUpdateData = {} as UpdateIpoState,
  setPendingUpdateData = () => {},
  sx,
  overviewPendingRequest,
  handleClickShowPendingCR,
  ...props
}: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  // STATE

  const [errorFields, setErrorFieldsState] = useState<IpoFieldNameKeys[]>([])
  const [historyModal, setHistoryModal] = useState(false)
  const [reason, setReason] = useState<string>('')

  // GRAPHQL
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  // METHOD
  const getValue = (name: IpoFieldNameKeys) => (ipo ? ipo[name] || '' : '')

  const onChangeField = (event: ChangeFieldEvent) => {
    const { name, value } = event.target

    if (errorFields?.includes(name as IpoFieldNameKeys)) {
      const newErrorFields = errorFields?.filter(f => f !== name)
      setErrorFields(newErrorFields)
    }

    onChangeRoundData({ ...ipo, [name]: value })
  }

  const onBlurField = (name: IpoFieldNameKeys) => {
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
      case 'share_price':
        return 'share_price_usd'
      case 'amount':
        return 'amount_usd'
      case 'valuation':
        return 'valuation_usd'
      default:
        return input
    }
  }

  const normalizeOverridesInput = (input: OverridesCompanyDataInput) => {
    const isDate = [IpoFieldNames.went_public_on]?.includes(input.columnName as IpoFieldNames)
    return {
      id: ipo.ipo_id,
      tableName: input.tableName,
      columnName: formatColumn(input.columnName),
      oldValue: isDate && input.oldValue ? transformPostDate(input.oldValue) : input.oldValue,
      newValue: isDate && input.newValue ? transformPostDate(input.newValue) : input.newValue,
      source: input.source,
      reason: input.reason,
    }
  }

  const handleUpdateIpo = async (item: Fields) => {
    const { table: tableName, name: columnName } = item
    const oldValue = oldData[item.name],
      newValue = getValue(item.name)

    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [item.name]: normalizeOverridesInput({
        tableName: tableName || '',
        columnName,
        reason,
        oldValue: oldValue?.toString() || '',
        newValue: newValue,
        id: ipo.ipo_id || '',
        source: ipo.source || '',
        companyId,
      }),
    } as UpdateIpoState)

    setReason('')
  }

  // EFFECTS

  const setErrorFields = (errorFields: IpoFieldNameKeys[]) => {
    setErrorFieldsState(errorFields)
    setErrorForm && setErrorForm(errorFields)
  }

  const revertChange = (item: Fields) => {
    const { [item.name]: reverting } = pendingUpdateData
    const previousValue = reverting?.newValue || oldData[item.name]

    onChangeField({
      target: {
        name: item.name,
        value:
          item.name === IpoFieldNames.went_public_on
            ? previousValue
              ? transformViewDate(previousValue)
              : null
            : previousValue,
      },
    } as ChangeFieldEvent)

    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [item.name]: normalizeOverridesInput({
        id: ipo.ipo_id || '',
        tableName: item.table || '',
        columnName: item.name,
        oldValue: oldData[item.name] || '',
        newValue: previousValue || '',
        source: oldData.source || '',
        reason: reverting?.reason || '',
        companyId,
      }),
    } as UpdateIpoState)
  }

  const isFollowing = ipo?.expandStatus === EnumExpandStatus.FOLLOWING
  const isAppendCq = ipo?.expandStatus === EnumExpandStatus.CHANGE_REQUEST
  const reasonRequired = !props.isOverride && !isAppendCq
  const disabled = !!(ipo.ipo_id && !isFollowing && !isAppendCq)

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
            reasonRequired: reasonRequired,
          }
          const oldValue = oldData[item.name] || '',
            newValue = getValue(item.name)

          const numPending =
            overviewPendingRequest?.filter(
              (x: { tableName: string; columnName: any; rowId: string; source: string }) =>
                x.tableName === item.table &&
                x.columnName === formatColumn(item.name) &&
                x.rowId === ipo.ipo_id &&
                (SourceIndependentTables.includes(item.table)
                  ? true
                  : x.source === (oldData?.source || '') || x.source === 'NA')
            )[0]?.total || 0
          return (
            <ReasonPopover
              {...fieldProps}
              labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
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
                  action: () => {
                    handleUpdateIpo(item)
                  },
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
                    ) ||
                    (item.key === 'went_public_on' && !newValue),
                },
              ]}
              oldValue={oldValue.toString()}
              newValue={newValue.toString()}
              reason={reason}
              setReason={setReason}
              onClickOutSide={() => revertChange(item)}
              onCancelCallBack={() => revertChange(item)}
              label={copy.ipos.fields[item.key]}
              viewHistory={
                !showViewHistory(
                  item.table || '',
                  formatColumn(item.name),
                  ipo.ipo_id || '',
                  ipo.source || ''
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
                            rowId: ipo.ipo_id,
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
                        rowId: ipo.ipo_id as string,
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
