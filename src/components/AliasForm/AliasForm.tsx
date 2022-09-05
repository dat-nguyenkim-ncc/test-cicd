import { useMutation } from '@apollo/client'
import React, { useContext, useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { Button, Modal, TextField } from '..'
import { ETLRunTimeContext, UserContext } from '../../context'
import {
  HasHistoryField,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from '../../pages/CompanyForm/CompanyForm'
import { editCompanyAlias, appendNewCompanyAliases } from '../../pages/CompanyForm/graphql'
import { EditCompanyAliasVariables } from '../../pages/CompanyForm/graphql/editCompanyAlias'
import {
  FieldNameKeys,
  TableNames,
  ColumnNames,
  getNumPending,
  findCQ,
  editCRDisabled,
} from '../../pages/CompanyForm/helpers'
import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import strings from '../../strings'
import { Alias, ChangeFieldEvent, ViewInterface } from '../../types'
import { EnumExpandStatusId } from '../../types/enums'
import { checkLength } from '../../utils'
import { popoverZIndex } from '../../utils/consts'
import { FCTStatusAction } from '../FCTStatusAction'
import { Heading } from '../primitives'
import ReasonPopover from '../ReasonPopover'

export type AliasFormProps = ViewInterface<{
  fieldKey: keyof typeof strings.pages.addCompanyForm.fields
  companyId: string
  name: FieldNameKeys
  oldAliases?: Alias[]
  editAliasState?: Alias[]
  aliasState: string[]
  maxlength?: number
  onChangeAlias(state: string[]): void
  onChangeAliasEdit(state: Alias[]): void
  setOldData(state: Alias[]): void
  disabled?: boolean
  setError(err: Error): void
  isEdit: boolean
  refetchAliases?(): Promise<void>
  viewHistory?(alias: Alias, columnName?: string): void
  viewPendingChangeRequest?(alias: Alias, columnName: string): void
}> &
  ViewHistoryProps &
  ViewPendingChangeRequest

const AliasForm = ({
  fieldKey,
  companyId,
  name,
  oldAliases = [],
  editAliasState,
  aliasState,
  maxlength = 0,
  onChangeAlias,
  onChangeAliasEdit,
  setOldData,
  showViewHistory,
  refetchViewHistoryCols,
  showPendingChangeRequest,
  disabled,
  setError,
  isEdit,
  refetchAliases,
  viewHistory = () => {},
  viewPendingChangeRequest = () => {},
  overviewPendingRequest,
}: AliasFormProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { user } = useContext(UserContext)

  //Context
  const {
    refreshNumPending,
    isOverridesUser,
    handleUpdateStatus,
    handleAppendDataCQAction,
  } = useContext(CompanyContext)
  const { checkTimeETL } = useContext(ETLRunTimeContext)

  const [errorFields, setErrorFieldsState] = useState<number[]>([])
  const [errorEditFields, setErrorEditFieldsState] = useState<number[]>([])
  const [reason, setReason] = useState<string>('')
  const [isDuplicateAlias, setDuplicateAlias] = useState(false)
  const [isAppending, setIsAppending] = useState(false)

  // GRAPHQL
  const [editAlias, { loading: editLoading }] = useMutation<any, EditCompanyAliasVariables>(
    editCompanyAlias
  )
  const [appendAliases] = useMutation(appendNewCompanyAliases, {
    onCompleted: () => {
      refetchAliases && refetchAliases()
      if (!isOverridesUser) refreshNumPending()
    },
  })

  const getOldValue = (index: number) => {
    return oldAliases[index]?.company_alias
  }
  const addOtherName = () => {
    onChangeAlias([...aliasState, ''])
  }

  const isDuplicate = (value: string) => {
    const arrAlias = (editAliasState
      ? [
          ...editAliasState.reduce(
            (acc, f) => {
              acc.push(f.company_alias)
              return acc
            },
            [...aliasState]
          ),
        ]
      : [...aliasState]
    ).filter(alias => alias && alias?.trim() === value?.trim())
    return arrAlias.length > 1 ? true : false
  }

  const checkDuplicate = (state: string[]) => {
    const arrAlias = (editAliasState
      ? [
          ...editAliasState.reduce(
            (acc, f) => {
              acc.push(f.company_alias)
              return acc
            },
            [...state]
          ),
        ]
      : [...state]
    )
      .filter(alias => !!alias)
      .map(str => str?.trim())
    setDuplicateAlias(false)

    let valuesAlreadySeen = []
    for (let alias of arrAlias) {
      let value = alias
      if (valuesAlreadySeen.indexOf(value) !== -1) {
        setDuplicateAlias(true)
        break
      }
      valuesAlreadySeen.push(value)
    }
  }

  const onchangeAliasField = (event: ChangeFieldEvent, index: number) => {
    const { value: raw } = event.target
    const value = raw?.trim()
    const cloneState = [...aliasState]
    cloneState[index] = value
    if (errorFields.includes(index)) {
      const newErrorFields = errorFields.filter(f => f !== index)
      setErrorFieldsState(newErrorFields)
    }
    if (!!value && checkLength(value, maxlength)) {
      const newErrorFields = [...errorFields]
      newErrorFields.push(index)
      setErrorFieldsState(newErrorFields)
    }
    onChangeAlias(cloneState)
    checkDuplicate(cloneState)
  }

  const onchangeAliasEditField = (event: ChangeFieldEvent, index: number) => {
    const { value: raw } = event.target
    const value = raw?.trim()
    const cloneState = [...(editAliasState || [])]
    cloneState[index] = { ...cloneState[index], company_alias: value }
    if (errorEditFields.includes(index)) {
      const newErrorFields = errorEditFields.filter(f => f !== index)
      setErrorEditFieldsState(newErrorFields)
    }
    if (!!value && checkLength(value, maxlength)) {
      const newErrorFields = [...errorEditFields]
      newErrorFields.push(index)
      setErrorEditFieldsState(newErrorFields)
    }
    onChangeAliasEdit(cloneState)
  }

  const updateCompanyAlias = async (oldValue: string, alias: Alias, isAppendData = false) => {
    if (!checkTimeETL()) return
    try {
      await editAlias({
        variables: {
          companyId: +companyId,
          isAppendData,
          edit_record: {
            alias_id: alias.alias_id,
            table_name: TableNames?.ALIAS,
            column_name: ColumnNames.ALIAS,
            old_value: oldValue?.trim(),
            new_value: alias.company_alias?.trim(),
            source: alias.source as string,
            comment: reason,
          },
        },
      })

      if (isOverridesUser || isAppendData) {
        if (editAliasState) setOldData(editAliasState)
      }

      if (!isAppendData) {
        refetchViewHistoryCols && refetchViewHistoryCols()
        refreshNumPending && refreshNumPending()
      }
      setReason('')
    } catch (error) {
      setError(error)
    }
  }

  const onRemoveAlias = (index: number) => {
    const cloneState = [...aliasState]
    cloneState.splice(index, 1)
    onChangeAlias(cloneState)
    checkDuplicate(cloneState)
    setErrorFieldsState(errorFields.filter(n => n !== index).map(n => (n < index ? n : n - 1)))
  }

  const AddMoreButton = () => (
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Button
        label={copy.buttons.addOtherName}
        sx={{
          borderRadius: 10,
          color: 'primary',
        }}
        variant="outline"
        onPress={addOtherName}
        disabled={disabled}
      />
    </Flex>
  )

  const hasDuplicate = () => {
    const mergeState = [
      ...(aliasState || []),
      ...(editAliasState || []).map(({ company_alias }) => company_alias),
    ]
    return mergeState.length !== Array.from(new Set(mergeState)).length
  }

  const viewPendingCQFn = (alias: Alias, columnName: string) => {
    const hasPendingRequest = showPendingChangeRequest(
      TableNames?.ALIAS,
      columnName,
      alias.alias_id,
      alias.source as string
    )
    return hasPendingRequest ? () => viewPendingChangeRequest(alias, columnName) : undefined
  }

  const viewHistoryFn = (alias: Alias, columnName: string) => {
    const hasHistory = showViewHistory(
      TableNames?.ALIAS,
      columnName,
      alias.alias_id,
      alias.source as string
    )
    return hasHistory ? () => viewHistory(alias, columnName) : undefined
  }

  return (
    <Box id={name} my={5}>
      <Label
        sx={{
          color:
            aliasState.filter(a => !!a.trim().length).length || editAliasState?.length
              ? errorEditFields.length || errorFields.length || isDuplicateAlias
                ? 'red'
                : 'primary'
              : 'black',
          flex: 1,
          opacity: disabled ? 0.5 : 1,
        }}
        htmlFor={name}
      >
        {copy.fields[fieldKey]}
      </Label>

      {(editAliasState || []).map((alias, index) => {
        const isFollowing = +(alias.expand_status_id || 0) === +EnumExpandStatusId.FOLLOWING
        const isAppendCQ = +(alias.expand_status_id || 0) === +EnumExpandStatusId.CHANGE_REQUEST

        const reasonRequired = !isOverridesUser && !isAppendCQ
        const oldValue = getOldValue(index)
        const newValue = alias.company_alias

        const identity: HasHistoryField = {
          columnName: ColumnNames.ALIAS,
          tableName: TableNames.ALIAS,
          rowId: alias.alias_id,
          source: alias.source as string,
        }

        const fieldState =
          isFollowing && alias && (errorEditFields.indexOf(index) > -1 || isDuplicate(newValue))
            ? 'error'
            : 'default'

        const hasHistory =
          !isAppendCQ &&
          showViewHistory(identity.tableName, identity.columnName, identity.rowId, identity.source)

        const { total: numPending } = findCQ(overviewPendingRequest, identity) || {
          total: 0,
        }

        const { users } = findCQ(overviewPendingRequest, {
          ...identity,
          columnName: ColumnNames.FCT_STATUS_ID,
        }) || {
          users: [],
        }
        const fieldDisabled =
          (!isFollowing && !isAppendCQ) || disabled || editCRDisabled(users, user, isAppendCQ)
        const hasPendingRequest = !isAppendCQ && numPending > 0

        return (
          <Flex
            key={index}
            sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}
          >
            <Box sx={{ flex: '1 1 auto' }}>
              <ReasonPopover
                reasonRequired={reasonRequired}
                zIndex={popoverZIndex}
                disabled={fieldDisabled}
                positions={['top', 'bottom']}
                buttons={[
                  {
                    label: 'Submit',
                    action: async () => {
                      await updateCompanyAlias(oldValue, alias, isAppendCQ)
                    },
                    type: 'primary',
                    isCancel: true,
                    disabled:
                      editLoading ||
                      fieldState === 'error' ||
                      newValue === oldValue ||
                      !newValue ||
                      (reasonRequired && !reason),
                  },
                ]}
                oldValue={oldValue}
                newValue={newValue}
                reason={reason}
                setReason={setReason}
                label={hasHistory || hasPendingRequest ? ' ' : undefined}
                viewHistory={isAppendCQ ? undefined : viewHistoryFn(alias, ColumnNames.ALIAS)}
                viewPendingChangeRequest={
                  isAppendCQ ? undefined : viewPendingCQFn(alias, ColumnNames.ALIAS)
                }
                /*
                 * Note:
                 * If change request: Revert change after submit
                 */
                callCancelCBAfterAction={!isOverridesUser && !isAppendCQ}
                onCancelCallBack={() => {
                  if (newValue !== oldValue) {
                    onchangeAliasEditField(
                      { target: { value: oldValue } } as ChangeFieldEvent,
                      index
                    )
                  }
                }}
                totalItemPendingCR={numPending}
              >
                <TextField
                  disabled={fieldDisabled}
                  name={name}
                  value={alias.company_alias}
                  fieldState={fieldState}
                  onChange={e => onchangeAliasEditField(e, index)}
                />
              </ReasonPopover>
            </Box>

            <FCTStatusAction
              disabled={disabled}
              reasonRequired={!isOverridesUser}
              identity={{ ...identity, columnName: ColumnNames.FCT_STATUS_ID }}
              fctStatusId={`${alias.expand_status_id}` as EnumExpandStatusId}
              selfDeclared={!!alias.selfDeclared}
              handleAppendDataCQAction={handleAppendDataCQAction}
              viewHistoryFn={({ tableName, columnName, rowId }) => {
                return viewHistoryFn(alias, columnName)
              }}
              viewPendingCQFn={({ tableName, columnName, rowId }) => {
                return viewPendingCQFn(alias, columnName)
              }}
              handleUpdateStatus={async (reason, identity) => {
                const input = {
                  id: alias.alias_id,
                  companyId: +companyId,
                  reason: reason,
                  tableName: TableNames.ALIAS,
                  columnName: ColumnNames.FCT_STATUS_ID,
                  source: alias.source as string,
                  newValue: isFollowing
                    ? EnumExpandStatusId.UNFOLLOWED
                    : EnumExpandStatusId.FOLLOWING,
                  oldValue: isFollowing
                    ? EnumExpandStatusId.FOLLOWING
                    : EnumExpandStatusId.UNFOLLOWED,
                }

                await handleUpdateStatus(input)
              }}
              getNumPending={identity => {
                return getNumPending(overviewPendingRequest, identity)
              }}
              users={users}
            />
          </Flex>
        )
      })}

      {!isEdit && (
        <AppendAliasFields
          isEdit={isEdit}
          aliasState={aliasState}
          errorFields={errorFields}
          disabled={disabled}
          onchangeAliasField={onchangeAliasField}
          editAliasState={editAliasState}
          onRemoveAlias={onRemoveAlias}
          name={name}
          isDuplicate={isDuplicate}
        />
      )}

      <AddMoreButton />

      {!!aliasState?.length && isEdit && (
        <Modal
          sx={{ maxHeight: '90vh', width: '50vw', maxWidth: '50vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4, pt: 0 }}
          buttons={[
            {
              label: 'Cancel',
              disabled: isAppending,
              type: 'secondary',
              action: () => {
                onChangeAlias([])
                setErrorFieldsState([])
                checkDuplicate([])
              },
            },
            {
              label: 'Add new other name',
              disabled: isAppending || !!errorFields?.length || hasDuplicate(),
              type: 'primary',
              action: async () => {
                if (!checkTimeETL()) return
                try {
                  setIsAppending(true)
                  const aliases = aliasState.filter(e => !!e?.trim().length)
                  if (!!aliases.length) {
                    await appendAliases({
                      variables: { companyId: +companyId, company_aliases: aliases },
                    })
                  }
                } catch (err) {
                  setError(err)
                } finally {
                  onChangeAlias([])
                  setIsAppending(false)
                }
              },
            },
          ]}
        >
          <Heading sx={{ fontWeight: 600, my: 4 }} as={'h4'}>
            {copy.modals.alias.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%', px: 5 }}>
            <AppendAliasFields
              isEdit={isEdit}
              aliasState={aliasState}
              errorFields={errorFields}
              disabled={disabled}
              onchangeAliasField={onchangeAliasField}
              editAliasState={editAliasState}
              onRemoveAlias={onRemoveAlias}
              name={name}
              isDuplicate={isDuplicate}
            />
            <AddMoreButton />
          </Box>
        </Modal>
      )}
    </Box>
  )
}

export default AliasForm

const AppendAliasFields = ({
  aliasState,
  errorFields,
  disabled,
  onchangeAliasField,
  editAliasState,
  onRemoveAlias,
  name,
  isDuplicate,
  isEdit,
}: Pick<AliasFormProps, 'isEdit' | 'aliasState' | 'disabled' | 'editAliasState' | 'name'> & {
  onchangeAliasField(event: ChangeFieldEvent, index: number): void
  errorFields: number[]
  onRemoveAlias(index: number): void
  isDuplicate(value: string): boolean
}) => {
  return (
    <>
      {aliasState.map((alias, index) => (
        <Flex key={index} sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            required
            disabled={disabled}
            name={`${name}-${index}`}
            value={alias}
            fieldState={
              errorFields.indexOf(index) > -1 || isDuplicate(alias)
                ? 'error'
                : !alias
                ? 'default'
                : 'validated'
            }
            onChange={e => onchangeAliasField(e, index)}
          />
          {(aliasState.length > 1 || (!isEdit && !!editAliasState?.length)) && (
            <Button
              sx={{ ml: errorFields.indexOf(index) > -1 || alias ? 0 : 3, mr: 3 }}
              onPress={() => {
                onRemoveAlias(index)
              }}
              icon="remove"
              size="tiny"
              variant="black"
              disabled={disabled}
            />
          )}
        </Flex>
      ))}
    </>
  )
}
