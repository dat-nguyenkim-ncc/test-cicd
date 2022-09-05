import React, { useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import {
  ChangeFieldEvent,
  FormOption,
  PopoverPositions,
  ViewInterface,
  RoundTypesOption,
} from '../../types'
import {
  FieldNameKeys,
  FormFieldsState,
  RoundFieldsKeys,
  FormRoundFieldsState,
  RoundFieldNames,
  TableNamesValues,
  OverridesCompanyDataInput,
  UpdateFundingState,
  FieldNames,
  Fields,
  getFieldVariants,
  invalidUpdateData,
  getRoundTypeLabel,
  ColumnNames,
  transformPostDate,
  transformViewDate,
} from '../../pages/CompanyForm/helpers'
import { investor } from '../../pages/CompanyForm/mock'
import TextField, { FieldTypes } from '../TextField'
import Dropdown from '../Dropdown'
import Button from '../Button'
import strings from '../../strings'
import InvestorForm, { Investor } from '../InvestorForm/InvestorForm'
import { useLazyQuery, useMutation } from '@apollo/client'
import { editFundingRound, GET_COMPANY_OVERRIDES_HISTORY } from '../../pages/CompanyForm/graphql'
import { Heading, Paragraph } from '../primitives'
import Modal from '../Modal'
import ReasonPopover from '../ReasonPopover'
import { OverridesHistory } from '../OverridesHistory'
import {
  RoundProps,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from '../../pages/CompanyForm/CompanyForm'
import { EnumExpandStatus, EnumCompanySource } from '../../types/enums'
import Icon from '../Icon'

export type FundingForm = {
  id?: string
  expandStatus?: string
  selfDeclared?: boolean
  round: FormRoundFieldsState
  // lead_investors: Investor[]
  investors: Investor[]
  sourceRoundType?: string
  company?: {
    company_id: number
    name: string
    logo_bucket_url: string
    fct_status_id: number
    category: string
  }
}

export type FundingFields = {
  name: RoundFieldsKeys
  key: keyof FormRoundFieldsState
  type: FieldTypes
  placeholder?: string
  customOptions?(data?: FormRoundFieldsState): FormOption[]
  table?: TableNamesValues
  disableOverride?: boolean
} & Fields

type FundingFieldType = FormRoundFieldsState & {
  investmentCurrency?: string
  sourceInvestment?: string
}

export type FundingRoundProps = ViewInterface<{
  isEdit?: boolean
  companyId: number
  // errorInvestor?: any
  financials: FundingForm
  fields: FundingFields[]
  errorForm: number[]
  oldRound?: FundingForm
  setOldRound?(round: FundingForm): void
  setErrorForm(form: number[]): void
  onChangeFinancials(state: FundingForm): void
  onRemove?(): void
  onChangeOldState?(column: string, value: string, investor_id: string): void

  // Edit Required
  setPendingUpdateFunding?(v: UpdateFundingState): void
  pendingUpdateFunding?: UpdateFundingState
  setPendingUpdateInvestor?(v: OverridesCompanyDataInput): void
  refetchAPI?(): void
  queryLoading?: boolean
  setUpdatedCR?(state: boolean): void
  roundTypes: RoundTypesOption
}> &
  ViewHistoryProps &
  ViewPendingChangeRequest &
  RoundProps

const PREFERED_POSITIONS = {
  [FieldNames?.investment]: ['right', 'left', 'bottom'],
  [FieldNames?.roundType1]: ['right', 'left', 'bottom'],
  [FieldNames?.roundType2]: ['left', 'right', 'bottom'],
  [FieldNames?.date]: ['left', 'right', 'bottom'],
}

const FundingRound = ({
  isEdit,
  companyId,
  financials,
  oldRound = { round: {} } as FundingForm,
  setOldRound,
  fields,
  errorForm,
  setErrorForm,
  onChangeFinancials,
  onRemove,
  showViewHistory,
  refetchViewHistoryCols,
  onChangeOldState,
  setPendingUpdateFunding = v => {},
  pendingUpdateFunding = {} as UpdateFundingState,
  setPendingUpdateInvestor = v => {},
  refetchAPI = () => {},
  queryLoading = false,
  sx,
  handleClickShowPendingCR,
  overviewPendingRequest,
  showPendingChangeRequest,
  setUpdatedCR,
  roundTypes,
  ...props
}: FundingRoundProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const [errorFields, setErrorFieldsState] = useState<FieldNameKeys[]>([])
  const isFollowing = financials?.expandStatus === EnumExpandStatus.FOLLOWING
  const isAppendCq = financials?.expandStatus === EnumExpandStatus.CHANGE_REQUEST
  const reasonRequired = !props.isOverride && !isAppendCq

  const [reason, setReason] = useState('')
  const [historyModal, setHistoryModal] = useState(false)
  const [itemConfirm, setItemConfirm] = useState<FundingFields>()

  // GRAPHQL

  const [, { loading: editLoading }] = useMutation(editFundingRound)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const updateErrorForm = (error: any) => {
    let cloneError = [...error]
    if (!!error.length && !errorForm.includes(financials.id as any)) {
      cloneError.push(financials.id)
    } else if (!error.length && cloneError.indexOf(financials.id) > -1)
      cloneError.splice(cloneError.indexOf(financials.id), 1)
    setErrorForm(cloneError)
  }

  const getValue = (name: RoundFieldsKeys) => {
    if (name === 'source' && !isEdit) return EnumCompanySource.BCG
    return financials ? financials.round[name] || '' : ''
  }

  const onChangeField = async (event: ChangeFieldEvent) => {
    const { name, value } = event.target
    let parsedValue: number | string = value

    const lastStateFields = financials ? { ...financials.round } : ({} as FormFieldsState)

    if (name === 'roundType1') {
      const isRoundType1Unchanged = String(value) === String(oldRound.round['roundType1'])
      if (isRoundType1Unchanged) {
        lastStateFields.roundType2 = financials.round.roundType2
      } else {
        lastStateFields.roundType2 = ''
        setErrorFieldsState([...errorFields, 'roundType2'])
        updateErrorForm([...errorFields, 'roundType2'])
      }
    }

    if (name === 'roundType2') {
      parsedValue = Number(parsedValue)
      const findRoundType1 = roundTypes.roundType1.find(({ value: round1Value }) => {
        const matchedType2 = roundTypes.roundType2[round1Value].find(
          ({ value: round2Value }) => round2Value === parsedValue
        )
        return !!matchedType2
      })
      if (findRoundType1) {
        lastStateFields.roundType1 = findRoundType1.value
      }
    }

    if (errorFields.includes(name as FieldNameKeys)) {
      const newErrorFields = errorFields.filter(f => f !== name)
      setErrorFieldsState(newErrorFields)
      updateErrorForm(newErrorFields)
    }

    await onChangeFinancials({ ...financials, round: { ...lastStateFields, [name]: parsedValue } })
  }

  const onRemoveFundingRound = () => {
    onRemove && onRemove()
  }

  const addInvestor = (investor: Investor) => {
    onChangeFinancials({
      ...financials,
      investors: [...financials.investors, investor],
    })
  }

  const onChangeInvestor = (event: ChangeFieldEvent, index: number) => {
    const { name, value } = event.target
    const cloneInvestor = [...financials.investors]
    const objInvestor = cloneInvestor[index]
    cloneInvestor[index] = { ...objInvestor, [name]: value }
    onChangeFinancials({ ...financials, investors: [...cloneInvestor] })
  }

  const onRemoveInvestor = (index: number) => {
    let cloneInvestorState = [...financials.investors]
    cloneInvestorState.splice(index, 1)
    onChangeFinancials({ ...financials, investors: [...cloneInvestorState] })
    setOldRound && setOldRound({ ...oldRound, investors: cloneInvestorState })
  }

  const getListOptions = (item: FundingFields) => {
    if (item.customOptions) {
      return item.customOptions(financials.round)
    }
    return item.option || []
  }

  const getFieldState = (item: FundingFields) => {
    return getFieldVariants(item, getValue(item.name))
  }

  const onBlurField = (name: RoundFieldsKeys) => {
    const field = fields.find(f => f.name === name)
    if (!field) return
    const fieldState = getFieldState(field)
    if (
      (fieldState === 'error' || (field.required && !getValue(name))) &&
      !errorFields?.includes(field.name)
    ) {
      const newErrorFields = [...errorFields, field.name]
      setErrorFieldsState(newErrorFields)
      updateErrorForm(newErrorFields)
    }
    if (name === 'roundType1') {
      onBlurField('roundType2')
    }
  }

  const formatColumn = (value: string) => {
    switch (value) {
      case 'roundType1':
        return 'round1_type'
      case 'roundType2':
        return 'round_2_id'
      case 'date':
        return 'funding_date'
      case 'investment':
        return 'amount_usd'
      case 'valuation':
        return 'valuation_usd'
      default:
        return value
    }
  }

  const normalizeOverridesInput = (input: OverridesCompanyDataInput) => ({
    id: financials.id,
    tableName: input.tableName,
    columnName: formatColumn(input.columnName),
    oldValue:
      input.columnName === 'date' && input.oldValue
        ? transformPostDate(input.oldValue)
        : input.oldValue,
    newValue:
      input.columnName === 'date' && input.newValue
        ? transformPostDate(input.newValue)
        : input.newValue,
    source: input.source,
    reason: input.reason,
  })

  const onUpdateFunding = async (item: FundingFields) => {
    const newValue = getValue(item.name),
      oldValue = oldRound.round[item.name]

    if (!item.table) {
      throw Error('Table not found on this field')
    }
    if (!financials.id) {
      throw Error('id not found on this field')
    }

    setPendingUpdateFunding({
      ...(pendingUpdateFunding || {}),
      [item.name]: normalizeOverridesInput({
        id: financials.id,
        tableName: item.table,
        columnName: item.name,
        oldValue: !!oldValue ? `${oldValue}` : oldValue,
        newValue: !!newValue ? `${newValue}` : newValue,
        source: oldRound.round.source,
        reason,
        companyId: +companyId,
      }),
    } as UpdateFundingState)
    setReason('')
  }

  const checkDuplicate = ({ investor_name }: Investor) => {
    const checkInvestor = financials.investors.filter(
      investor => investor.investor_name === investor_name
    )
    if (checkInvestor.length > 1) {
      return true
    }
    return false
  }

  const revertChange = (item: FundingFields) => {
    const { [item.name]: reverting } = pendingUpdateFunding
    const previousValue = reverting?.newValue || oldRound.round[item.name]
    onChangeField({
      target: {
        name: item.name,
        value:
          item.name === FieldNames.date && !!previousValue
            ? transformViewDate(previousValue)
            : previousValue,
      },
    } as ChangeFieldEvent)

    setPendingUpdateFunding({
      ...(pendingUpdateFunding || {}),
      [item.name]: normalizeOverridesInput({
        id: financials.id || '',
        tableName: item.table || '',
        columnName: item.name,
        oldValue: oldRound.round[item.name],
        newValue: previousValue,
        source: oldRound.round.source,
        reason: reverting?.reason || '',
        companyId: +companyId,
      }),
    } as UpdateFundingState)
  }

  const disabled = !!(financials?.id && !isFollowing && !isAppendCq)

  return (
    <Box sx={{ mt: 5, padding: 5, borderRadius: 12, background: 'white', ...sx }}>
      <Flex sx={{ mb: 4, justifyContent: 'flex-end' }}>
        {!isEdit && onRemove && (
          <Button
            onPress={() => onRemoveFundingRound()}
            icon="remove"
            size="tiny"
            variant="black"
          />
        )}
      </Flex>
      <Grid gap={5} columns={[2, null, 2]}>
        {fields.map(item => {
          const fieldState = errorFields?.includes(item.name) ? 'error' : getFieldState(item)
          const fieldDisabled = disabled || item.disabled
          const oldValue = oldRound.round[item.name]
          const newValue = getValue(item.name)

          let oldValueLabel = oldValue
          let newValueLabel = newValue

          if (item.name === 'roundType1') {
            oldValueLabel = getRoundTypeLabel(oldValue, roundTypes.roundType1) || oldValueLabel
            newValueLabel = getRoundTypeLabel(newValue, roundTypes.roundType1) || newValueLabel
          }

          if (item.name === 'roundType2') {
            const oldRoundType1Value = oldRound.round['roundType1']
            const newRoundType1Value = getValue('roundType1')
            oldValueLabel =
              getRoundTypeLabel(oldValue, roundTypes.roundType2[oldRoundType1Value]) || ''
            newValueLabel =
              getRoundTypeLabel(newValue, roundTypes.roundType2[newRoundType1Value]) || ''
          }

          const numPending =
            overviewPendingRequest?.filter(
              s =>
                s.tableName === item.table &&
                s.columnName === formatColumn(item.name) &&
                s.rowId === financials.id &&
                s.source === oldRound.round.source
            )[0]?.total || 0

          const viewHistory = showViewHistory(
            item.table || '',
            formatColumn(item.name),
            financials.id || '',
            financials.round.source as string
          )

          return (
            <ReasonPopover
              reasonRequired={reasonRequired}
              disabled={!isEdit || fieldDisabled || item.disableOverride}
              labelSx={{ opacity: fieldDisabled ? 0.5 : 1 }}
              positions={
                PREFERED_POSITIONS[
                  item.name as keyof typeof PREFERED_POSITIONS
                ] as PopoverPositions[]
              }
              sx={
                item.name === RoundFieldNames.comment
                  ? { gridColumnStart: 1, gridColumnEnd: 3 }
                  : {}
              }
              variant={fieldState}
              key={item.name}
              buttons={[
                {
                  label: isEdit ? 'Submit' : 'Update',
                  action: () => {
                    const checkWarning = (funding: FundingFieldType) => {
                      const { [item.name]: reverting } = pendingUpdateFunding
                      const previousValue = reverting?.newValue || oldRound.round[item.name]
                      return (
                        !previousValue &&
                        !!funding.date &&
                        !!funding.investment &&
                        !!funding.investmentCurrency &&
                        !!funding.sourceInvestment
                      )
                    }
                    if (
                      item.name === ColumnNames.INVESTMENT &&
                      checkWarning(financials.round as FundingFieldType) &&
                      !viewHistory
                    ) {
                      setItemConfirm(item)
                    } else onUpdateFunding(item)
                  },
                  type: 'primary',
                  disabled:
                    editLoading ||
                    fieldState === 'error' ||
                    invalidUpdateData(
                      oldValue,
                      newValue,
                      reason,
                      props.isOverride,
                      item.required,
                      isAppendCq
                    ) ||
                    (item.key === 'date' && !newValue),
                  isCancel: true,
                },
              ]}
              oldValue={oldValueLabel}
              newValue={newValueLabel}
              reason={reason}
              setReason={setReason}
              label={`${copy.financials.fields[item.key]} ${item.required ? '*' : ''}`}
              viewHistory={
                !viewHistory
                  ? undefined
                  : () => {
                      setHistoryModal(true)
                      getHistory({
                        variables: {
                          input: {
                            tableName: item.table,
                            columnName: formatColumn(item.name),
                            companyId: companyId ? +companyId : 0,
                            rowId: financials.id,
                            source: oldRound.round.source,
                          },
                        },
                      })
                    }
              }
              viewPendingChangeRequest={
                !showPendingChangeRequest(
                  item.table || '',
                  formatColumn(item.name),
                  financials.id || '',
                  financials.round.source as string
                )
                  ? undefined
                  : () => {
                      handleClickShowPendingCR({
                        tableName: item.table as string,
                        columnName: formatColumn(item.name),
                        companyId: companyId ? +companyId : 0,
                        rowId: financials.id as string,
                        source: oldRound.round.source as string,
                      })
                    }
              }
              totalItemPendingCR={numPending}
              onClickOutSide={() => revertChange(item)}
              onCancelCallBack={() => revertChange(item)}
            >
              {item.type === 'dropdown' ? (
                <Dropdown
                  name={item.name}
                  value={newValue}
                  required={item.required}
                  placeholder={item.placeholder}
                  options={getListOptions(item) || []}
                  onChange={onChangeField}
                  onBlur={onBlurField}
                  disabled={fieldDisabled}
                />
              ) : (
                <TextField
                  name={item.name}
                  type={item.type}
                  value={newValue}
                  required={item.required}
                  formattedValue={item.format ? item.format(newValue) : undefined}
                  variant={fieldState}
                  placeholder={item.placeholder}
                  disabled={item.disabled || fieldDisabled}
                  onChange={onChangeField}
                  onBlur={onBlurField}
                  fieldState={fieldState === 'error' ? 'error' : 'default'}
                />
              )}
            </ReasonPopover>
          )
        })}
      </Grid>
      <InvestorForm
        sx={{ mt: 5 }}
        isFunding={true}
        isEdit={isEdit}
        companyId={companyId}
        roundId={financials.id}
        source={financials.round.source}
        name="Investor Name"
        nameType={strings.common.investorType}
        investorState={financials.investors}
        oldState={oldRound.investors}
        investor={investor}
        checkDuplicate={checkDuplicate}
        onChange={onChangeInvestor}
        onRemoveItem={onRemoveInvestor}
        onChangeInvestor={(investor: Investor, index: number) => {
          const cloneInvestor = [...financials.investors]
          cloneInvestor[index] = { ...investor }
          onChangeFinancials({ ...financials, investors: [...cloneInvestor] })
          setOldRound && setOldRound({ ...oldRound, investors: cloneInvestor })
        }}
        showViewHistory={showViewHistory}
        refetchViewHistoryCols={refetchViewHistoryCols}
        onChangeOldState={onChangeOldState}
        setOldState={newInvestor =>
          setOldRound && setOldRound({ ...oldRound, investors: newInvestor })
        }
        disabled={disabled}
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
      {itemConfirm && (
        <Modal
          buttons={[
            {
              label: copy.modals.leave.buttons.no,
              type: 'outline',
              action: () => {
                revertChange(itemConfirm)
                setItemConfirm(undefined)
              },
            },
            {
              label: copy.modals.leave.buttons.yes,
              type: 'primary',
              action: () => {
                onUpdateFunding(itemConfirm)
                setItemConfirm(undefined)
              },
            },
          ]}
        >
          <Flex sx={{ width: '100%', justifyContent: 'center' }}>
            <Icon icon="alert" size="small" background="red" color="white" />
            <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
              Warning
            </Heading>
          </Flex>
          <Paragraph sx={{ mt: 3, textAlign: 'center', lineHeight: 1.5 }}>
            {strings.common.warningOverrideAmountUsd}
          </Paragraph>
        </Modal>
      )}
    </Box>
  )
}
export default FundingRound
