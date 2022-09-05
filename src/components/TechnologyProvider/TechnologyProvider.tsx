import { useLazyQuery, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Button, Icon, Popover, Tooltip, Updating } from '..'
import {
  GET_COMPANY_OVERRIDES_HISTORY,
  OVERRIDE_COMPANY_DATA,
  SEARCH_TECHNOLOGY_PROVIDER,
} from '../../pages/CompanyForm/graphql'
import { ChangeFieldEvent } from '../../types'
import ReasonPopover from '../ReasonPopover'
import { EnumCompanySource, EnumExpandStatusId } from '../../types/enums'
import Modal from '../Modal'
import { Heading, Paragraph } from '../primitives'
import strings from '../../strings'
import { OverridesHistory } from '../OverridesHistory'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  SourceIndependentTables,
  TableNames,
} from '../../pages/CompanyForm/helpers'
import { HasPendingCQField, ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import { Palette } from '../../theme'
import { popoverZIndex, reasonPopverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import {
  IHandleAppendDataCQAction,
  IHandleClickShowPendingCR,
  IHandleUpdateStatus,
} from '../../pages/CompanyForm/provider/CompanyContext'
import { IShowPendingChangeRequest } from '../../hooks/useChangeRequest'
import { ETLRunTimeContext, UserContext } from '../../context'
import {
  SearchTechnologyProviderResponse,
  TechnologyProvider,
  TechnologyProviderSearchItem,
} from '../../pages/CompanyForm/TechnologyProvider'
import TextField, { FieldTypes } from '../TextField'
import { debounce } from 'lodash'

type TechnologyProviderFormProps = {
  getUser?(): string
  isEdit?: boolean
  state?: TechnologyProvider[]
  editState?: TechnologyProvider[]
  companyId: number
  buttonLabel: string
  placeholder?: string
  onChange?(arr: TechnologyProvider[]): void
  onChangeEdit?(arr: TechnologyProvider[]): void
  onAddField?(): void
  oldState?: TechnologyProvider[]
  setOldState?(v: TechnologyProvider[]): void
  disabled?: boolean
  open: boolean
  setOpen(i: boolean): void

  // Change request
  overviewPendingRequest?: HasPendingCQField[]
  refetchViewPendingChangeRequestCols?: () => Promise<any>
  handleClickShowPendingCR?: IHandleClickShowPendingCR
  showPendingChangeRequest?: IShowPendingChangeRequest
  handleAppendDataCQAction?: IHandleAppendDataCQAction
  isOverridesUser?: boolean
  handleUpdateStatus?: IHandleUpdateStatus
  validate(e: TechnologyProvider, field?: TechnolodyProviderField): string | undefined
  setError(err: Error): void
} & ViewHistoryProps

export type TechnolodyProviderField = {
  field: keyof TechnologyProvider
  type: FieldTypes
  label: string
  required: boolean
  disableEdit: boolean
}

export const fields: TechnolodyProviderField[] = [
  {
    field: ColumnNames?.NAME as keyof TechnologyProvider,
    type: 'input',
    label: 'Name',
    required: true,
    disableEdit: true,
  },
  {
    field: ColumnNames?.DESCRIPTION as keyof TechnologyProvider,
    type: 'textarea',
    label: 'Description',
    required: false,
    disableEdit: true,
  },
]

const TechnologyProviderEditForm = ({
  isEdit,
  state = [],
  editState = [],
  companyId,
  buttonLabel,
  placeholder,
  onChange,
  onChangeEdit = e => {},
  showViewHistory,
  refetchViewHistoryCols,
  onAddField,
  oldState = [],
  setOldState = () => {},
  disabled,
  open,
  setOpen: _setOpen,

  overviewPendingRequest = [],
  refetchViewPendingChangeRequestCols = async () => {},
  handleClickShowPendingCR = () => {},
  showPendingChangeRequest = () => false,
  handleAppendDataCQAction = () => {},
  isOverridesUser = false,
  handleUpdateStatus = async () => {},
  validate,
  setError,
}: TechnologyProviderFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = React.useContext(UserContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const [dataSearchItems, setDataSearchItems] = useState<TechnologyProviderSearchItem[]>([])

  // GRAPHQL
  const [onEditCertification, { loading }] = useMutation(OVERRIDE_COMPANY_DATA)
  const [
    getHistory,
    { loading: getHistoryLoading, data: getHistoryData },
  ] = useLazyQuery(GET_COMPANY_OVERRIDES_HISTORY, { fetchPolicy: 'network-only' })

  const [searchTechnologyProvider, { data: dataSearch, loading: queryingSearch }] = useLazyQuery<
    SearchTechnologyProviderResponse
  >(SEARCH_TECHNOLOGY_PROVIDER, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setDataSearchItems([...(dataSearch?.technologyProviderSearch || [])])
    },
  })
  const debounceSearch = React.useCallback(
    debounce(searchPhrase => searchTechnologyProvider({ variables: { searchPhrase } }), 500),
    []
  )

  const [comment, setComment] = useState('')
  const [currentInput, setCurrentInput] = useState('')
  const [historyModal, setHistoryModal] = useState(false)

  const setOpen = (open: boolean, inputId?: string) => {
    _setOpen(open)
    open && setCurrentInput(inputId || '')
  }

  const onChangeField = (
    value: any,
    certification: TechnologyProvider,
    index: number,
    field: keyof TechnologyProvider
  ) => {
    const cloneState = [...state]
    cloneState[index] = { ...certification, [field]: value }
    onChange && onChange(cloneState)
    if (field === 'name') {
      debounceSearch(value)
    }
  }

  const onSelectSearchedItem = (
    technologyProvider: TechnologyProviderSearchItem,
    index: number,
    isDisable: boolean
  ) => {
    if (isDisable) return
    setOpen(false)
    const cloneState = [...state]
    cloneState[index] = { ...technologyProvider } as TechnologyProvider
    onChange && onChange(cloneState)
  }

  const onChangeEditField = (value: string | number, id: number, field: string) => {
    onChangeEdit &&
      onChangeEdit(
        editState.map(item => {
          return item.technology_provider_id === id ? { ...item, [field]: value } : item
        })
      )
  }

  const onUpdateCertification = async (
    item: TechnologyProvider,
    field: keyof TechnologyProvider
  ) => {
    if (!checkTimeETL()) return
    const isAppendData = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST
    const oldValue = oldState.find(
      (e: TechnologyProvider) => e.technology_provider_id === item.technology_provider_id
    )?.[field]
    const input = [
      {
        companyId: +companyId,
        reason: comment,
        id: item.technology_provider_id.toString(),
        oldValue,
        newValue: item[field],
        tableName: TableNames.TECHNOLOGY_PROVIDER,
        columnName: field,
        source: EnumCompanySource.BCG,
      },
    ]

    try {
      await onEditCertification({
        variables: {
          input,
          isAppendData,
        },
      })
      if (isOverridesUser || isAppendData) {
        setOldState(editState || [])
      } else {
        refetchViewPendingChangeRequestCols()
      }
      refetchViewHistoryCols && (await refetchViewHistoryCols())
    } catch (error) {
      setError(error)
      onChangeEditField(oldValue as string, item.technology_provider_id, field)
    } finally {
      setComment('')
    }
  }

  const onRemove = (index: number) => {
    const cloneState = [...state]
    cloneState.splice(index, 1)
    onChange && onChange(cloneState)
  }

  const getInputWidth = (id: string) => {
    const defaultWidth = 300
    try {
      const ele = document.getElementById(id)
      return ele?.clientWidth || defaultWidth
    } catch (error) {
      console.log('getInputWidth', error)
      return defaultWidth
    }
  }

  return (
    <Box sx={{ mt: 4, width: '100%' }}>
      {isEdit &&
        editState?.map((item, index: number) => {
          const isFollowing = item.fct_status_id === +EnumExpandStatusId.FOLLOWING
          const isAppendCQ = item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST

          const users =
            findCQ(
              overviewPendingRequest,
              {
                tableName: TableNames.COMPANY_TECHNOLOGY_PROVIDER,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: item.company_technology_provider_id?.toString(),
                source: EnumCompanySource.BCG,
              },
              SourceIndependentTables.includes(TableNames.COMPANY_TECHNOLOGY_PROVIDER)
            )?.users || []

          const fieldDisabled =
            (!isFollowing && !isAppendCQ) || editCRDisabled(users, user, isAppendCQ)
          const reasonRequired = !isOverridesUser && !isAppendCQ
          const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

          return (
            <Flex
              id={`provider_${item.technology_provider_id}`}
              key={`technology-provider` + item.technology_provider_id}
              sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
            >
              <Box sx={{ width: '85%' }}>
                <Flex sx={{ justifyContent: 'start', gap: 3, alignItems: 'start' }}>
                  {fields.map(({ field: fieldName, disableEdit, label, required, type }, fIdx) => {
                    const isShowViewHistory = showViewHistory(
                      TableNames?.TECHNOLOGY_PROVIDER,
                      fieldName,
                      item.technology_provider_id?.toString(),
                      EnumCompanySource.BCG
                    )
                    const oldValue = oldState[index]?.[fieldName]
                    const cannotUpdate =
                      invalidUpdateData(
                        oldValue as string,
                        item[fieldName] as string,
                        comment,
                        isOverridesUser,
                        false,
                        isAppendCQ
                      ) || !item[fieldName]

                    const { total: numPending } = findCQ(
                      overviewPendingRequest,
                      {
                        tableName: TableNames.TECHNOLOGY_PROVIDER,
                        columnName: fieldName,
                        rowId: item.technology_provider_id?.toString(),
                        source: EnumCompanySource.BCG,
                      },
                      SourceIndependentTables.includes(TableNames.TECHNOLOGY_PROVIDER)
                    ) || {
                      total: 0,
                    }

                    const isShowPendingCQ = numPending > 0
                    const validateErrorMessage = validate(item, fields[fIdx])
                    const fieldState = required && validateErrorMessage ? 'error' : undefined
                    return (
                      <ReasonPopover
                        sx={{ flex: 1 }}
                        key={`${fieldName}-${index}`}
                        reasonRequired={reasonRequired}
                        zIndex={popoverZIndex}
                        disabled={!isEdit || fieldDisabled}
                        positions={['top', 'bottom']}
                        buttons={[
                          {
                            label: isEdit ? 'Submit' : 'Update',
                            action: () => onUpdateCertification(item, fieldName),
                            type: 'primary',
                            isCancel: true,
                            disabled: loading || cannotUpdate,
                          },
                        ]}
                        oldValue={oldValue as string}
                        newValue={item[fieldName] as string}
                        reason={comment}
                        setReason={setComment}
                        label={label}
                        labelSx={{ mb: 3 }}
                        // Note RevertChange After Submit
                        callCancelCBAfterAction={callCancelCBAfterAction}
                        onCancelCallBack={() =>
                          onChangeEditField(
                            oldValue?.toString() || '',
                            item.technology_provider_id,
                            fieldName
                          )
                        }
                        onClickOutSide={() =>
                          onChangeEditField(
                            oldValue?.toString() || '',
                            item.technology_provider_id,
                            fieldName
                          )
                        }
                        viewHistory={
                          !isShowViewHistory
                            ? undefined
                            : () => {
                                setHistoryModal(true)
                                getHistory({
                                  variables: {
                                    input: {
                                      tableName: TableNames?.TECHNOLOGY_PROVIDER,
                                      columnName: fieldName,
                                      companyId: companyId ? +companyId : 0,
                                      rowId: item.technology_provider_id.toString(),
                                      source: EnumCompanySource.BCG,
                                    },
                                  },
                                })
                              }
                        }
                        viewPendingChangeRequest={
                          !isShowPendingCQ
                            ? undefined
                            : () => {
                                handleClickShowPendingCR({
                                  tableName: TableNames?.TECHNOLOGY_PROVIDER,
                                  columnName: fieldName,
                                  companyId: companyId ? +companyId : 0,
                                  rowId: item.technology_provider_id.toString(),
                                  source: EnumCompanySource.BCG,
                                })
                              }
                        }
                        totalItemPendingCR={numPending}
                        disablePopover={disableEdit}
                      >
                        <TextField
                          id={`companyprovider_${item.company_technology_provider_id}`}
                          name={`edit-${item.company_technology_provider_id}-${fieldName}`}
                          disabled={
                            fieldDisabled ||
                            disableEdit ||
                            (!isOverridesUser &&
                              item.fct_status_id === +EnumExpandStatusId.CHANGE_REQUEST)
                          }
                          fieldState={fieldState}
                          value={item[fieldName]}
                          onChange={(event: ChangeFieldEvent) =>
                            onChangeEditField(
                              event.target.value,
                              item.technology_provider_id,
                              fieldName
                            )
                          }
                          placeholder={placeholder}
                          onBlur={() => {}}
                          type={type}
                          tooltipError={fieldState === 'error' ? validateErrorMessage : undefined}
                        />
                      </ReasonPopover>
                    )
                  })}
                </Flex>
              </Box>
              <FCTStatusAction
                disabled={disabled}
                reasonRequired={reasonRequired}
                identity={{
                  tableName: TableNames.COMPANY_TECHNOLOGY_PROVIDER,
                  columnName: ColumnNames.FCT_STATUS_ID,
                  rowId: item.company_technology_provider_id.toString(),
                  source: EnumCompanySource.BCG,
                }}
                fctStatusId={item.fct_status_id.toString() as EnumExpandStatusId}
                selfDeclared={!!item.self_declared}
                handleAppendDataCQAction={handleAppendDataCQAction}
                viewHistoryFn={({ tableName, columnName, rowId }) => {
                  return showViewHistory(tableName, columnName, rowId, EnumCompanySource.BCG)
                    ? () => {
                        setHistoryModal(true)
                        getHistory({
                          variables: {
                            input: {
                              tableName,
                              columnName,
                              rowId,
                              companyId: companyId ? +companyId : 0,
                              source: EnumCompanySource.BCG,
                            },
                          },
                        })
                      }
                    : undefined
                }}
                viewPendingCQFn={({ tableName, columnName, rowId }) => {
                  return showPendingChangeRequest(
                    tableName,
                    columnName,
                    rowId,
                    EnumCompanySource.BCG
                  )
                    ? () => {
                        handleClickShowPendingCR({
                          tableName,
                          columnName,
                          rowId,
                          companyId: companyId ? +companyId : 0,
                          source: EnumCompanySource.BCG,
                        })
                      }
                    : undefined
                }}
                handleUpdateStatus={async (reason, identity) => {
                  const newValue = isFollowing
                    ? EnumExpandStatusId.UNFOLLOWED
                    : EnumExpandStatusId.FOLLOWING
                  const input = {
                    id: identity.rowId?.toString(),
                    tableName: identity.tableName,
                    columnName: identity.columnName,
                    source: identity.source as string,
                    companyId: +companyId,
                    reason: reason,
                    newValue,
                    oldValue: isFollowing
                      ? EnumExpandStatusId.FOLLOWING
                      : EnumExpandStatusId.UNFOLLOWED,
                  }

                  await handleUpdateStatus(input)
                  isOverridesUser &&
                    onChangeEditField(
                      +newValue,
                      item.technology_provider_id,
                      ColumnNames.FCT_STATUS_ID
                    )
                }}
                getNumPending={identity => {
                  return getNumPending(overviewPendingRequest, identity)
                }}
                users={users}
              />
            </Flex>
          )
        })}

      {!isEdit &&
        state.map((item: TechnologyProvider, index: number) => {
          const errorValidateItem = validate(item)
          return (
            <Flex
              key={`${index}-${item.technology_provider_id}`}
              sx={{
                mb: 4,
                justifyContent: 'space-between',
                alignItems: 'start',
                width: '100%',
                position: 'relative',
                gap: 3,
              }}
            >
              {fields.map(({ required, type, field: fieldName, label }, fieldIndex) => {
                const disable = !!item.technology_provider_id && item.technology_provider_id > 0
                const validateErrorMessage = validate(item, fields[fieldIndex])
                const fieldState =
                  !disable && validateErrorMessage && !errorValidateItem ? 'error' : undefined
                const inputId = `inputId-${fieldName}-${index}`
                const inputWidth = getInputWidth(inputId)
                const isShowDropdown =
                  (!item.technology_provider_id ||
                    (item.technology_provider_id && item.technology_provider_id < 0)) &&
                  fieldName === 'name' &&
                  currentInput === inputId
                return (
                  <Popover
                    key={`${fieldName}-${fieldIndex}`}
                    open={open}
                    setOpen={e => setOpen(e, inputId)}
                    disabled={currentInput !== inputId}
                    positions={['bottom', 'top']}
                    align="start"
                    noArrow
                    sx={{ mb: 5 }}
                    divSx={{ flex: '1', position: 'relative' }}
                    content={
                      <>
                        <Box sx={{ height: 4, bg: 'transparent', width: inputWidth }} />
                        {isShowDropdown && (
                          <Box
                            sx={{
                              bg: Palette.bgGray,
                              borderRadius: 6,
                              my: 0,
                              width: inputWidth,
                              overflow: 'hidden',
                            }}
                          >
                            {queryingSearch ? (
                              <Updating loading sx={{ py: 3 }} />
                            ) : dataSearchItems.length ? (
                              <Box sx={{ px: 4, maxHeight: '35vh', overflow: 'auto' }}>
                                {dataSearchItems.map((searchItem, searchIndex) => {
                                  const isDisable = !!state.find(
                                    item =>
                                      item.technology_provider_id ===
                                      searchItem.technology_provider_id
                                  )
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
                                    <Flex
                                      sx={{
                                        ...sx,
                                        py: 3,
                                        borderBottom:
                                          searchIndex + 1 === dataSearchItems.length
                                            ? 0
                                            : `1px solid ${Palette.gray01}`,
                                      }}
                                      onClick={() =>
                                        onSelectSearchedItem(searchItem, index, isDisable)
                                      }
                                    >
                                      <Paragraph
                                        bold
                                        sx={{
                                          maxWidth: 100,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {searchItem.name}
                                      </Paragraph>
                                      :
                                      <Paragraph
                                        sx={{
                                          pl: 2,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: inputWidth - 100,
                                        }}
                                      >
                                        {searchItem.description}
                                      </Paragraph>
                                    </Flex>
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
                                }}
                              >
                                No Data
                              </Box>
                            )}
                          </Box>
                        )}
                      </>
                    }
                    zIndex={reasonPopverZIndex}
                  >
                    <TextField
                      name={`add-${fieldName}-${index}`}
                      inputId={inputId}
                      key={`${index}-${fieldName}`}
                      fieldState={fieldState}
                      value={item[fieldName]}
                      onChange={(event: ChangeFieldEvent) =>
                        onChangeField(event.target.value, item, index, fieldName)
                      }
                      placeholder={placeholder}
                      onBlur={() => {}}
                      type={type}
                      required={required}
                      label={label}
                      labelSx={{ mb: 3 }}
                      sx={{ flex: 1 }}
                      disabled={disable}
                      tooltipError={fieldState === 'error' ? validateErrorMessage : undefined}
                    />
                  </Popover>
                )
              })}
              <Flex sx={{ ml: 3, alignItems: 'center', alignSelf: 'center' }}>
                {errorValidateItem && (
                  <Box>
                    <Tooltip content={errorValidateItem} isShow={true}>
                      <Icon icon={'alert'} size="small" background="red" color="white" />
                    </Tooltip>
                  </Box>
                )}
                <Button
                  sx={{ ml: 2 }}
                  onPress={() => onRemove(index)}
                  icon="remove"
                  size="tiny"
                  variant="black"
                />
              </Flex>
            </Flex>
          )
        })}

      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          my: 5,
          width: '100%',
        }}
      >
        <Button
          label={buttonLabel || 'Add +'}
          sx={{
            borderRadius: 10,
            flex: 1,
            color: Palette.primary,
          }}
          variant="outline"
          onPress={() => {
            onAddField && onAddField()
            setDataSearchItems([])
          }}
        />
      </Flex>

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

export default TechnologyProviderEditForm
