import { useQuery } from '@apollo/client'
import React, { forwardRef, useContext, useImperativeHandle, useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { getCountry } from '../../pages/CompanyForm/graphql'
import {
  ColumnNames,
  editCRDisabled,
  findCQ,
  getNumPending,
  invalidUpdateData,
  LocationFields,
  LOCATION_LENGTH,
  SourceIndependentTables,
  TableNames,
} from '../../pages/CompanyForm/helpers'
import strings from '../../strings'
import { ChangeFieldEvent, FormOption, ViewInterface } from '../../types'
import Dropdown from '../Dropdown'
import TextField from '../TextField'
import ReasonPopover from '../ReasonPopover'
import { Button } from '..'
import { EnumExpandStatus, EnumExpandStatusId } from '../../types/enums'
import { FORM_CHANGE_DEBOUNCE_TIME, popoverZIndex } from '../../utils/consts'
import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import { HasPendingCQField } from '../../pages/CompanyForm/CompanyForm'
import { UserContext } from '../../context'
import { FCTStatusAction } from '../FCTStatusAction'
import { checkLength } from '../../utils'
import { debounce } from 'lodash'

export type LocationFormProps = ViewInterface<{
  companyId?: number
  location: LocationFields
  onRemoveLocation?(): void
  onChangeLocation(data: LocationFields): any
  reason: string
  setReason(value: string): void
  isAddPage: boolean
  oldData: LocationFields // Do not modify directly
  newData: LocationFields
  setOldData(): void
  handleUpdateField: (
    tableName: string,
    columnName: string,
    oldValue: string | number,
    newValue: string | number,
    id: string | number,
    source: string,
    isAppendCQ: boolean
  ) => Promise<void>
  setHistoryModal: any
  getHistory: any
  showViewHistory(tableName: string, columnName: string, rowId: string | number): boolean
  showPendingChangeRequest(tableName: string, columnName: string, rowId: string | number): boolean
  overviewPendingRequest?: HasPendingCQField[]
  disabled?: boolean
}>

type MapFormOption = Map<string, FormOption>

const LocationForm = forwardRef(
  (
    {
      location,
      onRemoveLocation,
      onChangeLocation,
      reason,
      setReason,
      isAddPage,
      oldData,
      newData,
      setOldData,
      handleUpdateField,
      setHistoryModal,
      getHistory,
      showViewHistory,
      overviewPendingRequest = [],
      disabled,
      sx,
      companyId,
    }: LocationFormProps,
    ref
  ) => {
    const {
      pages: { addCompanyForm: copy },
    } = strings

    const { user } = useContext(UserContext)

    const {
      handleClickShowPendingCR,
      isOverridesUser,
      handleUpdateStatus,
      handleAppendDataCQAction,
    } = useContext(CompanyContext)

    // const cityRef = useRef<any>()
    useImperativeHandle(ref, () => ({
      onSubmit() {
        if (location.region && !location.country) setErrorFields(['country'])
      },
    }))

    const [countriesMap, setCountriesMap] = useState<MapFormOption>(new Map())
    const [countries, setCountries] = useState<FormOption[]>([])
    const [errorFields, setErrorFields] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // GRAPHQL
    const { data, loading: getCountriesLoading } = useQuery(getCountry, {
      variables: {
        region: 'all',
      },
      onCompleted() {
        setCountries(data.getCountry)
        const map = new Map()
        data.getCountry?.forEach((item: FormOption) => {
          map.set(item.value, item)
        })
        setCountriesMap(map)
      },
    })

    const onChangeField = React.useCallback(
      debounce((value, name) => {
        setErrorFields([])
        let cloneState = { ...location, [name]: value }
        if (name === 'country') {
          cloneState.region = countriesMap.get(value)?.regionValue || ''
        }
        if (isAddPage && name !== 'city') {
          cloneState.city = ''
        }
        onChangeLocation(cloneState)
      }, FORM_CHANGE_DEBOUNCE_TIME),
      [location, countriesMap]
    )

    const isDisabled = (name: string) => {
      if ((name === 'city' && (!location.region || !location.country)) || getCountriesLoading)
        return true
      return false
    }

    const numCountryPending = getNumPending(
      overviewPendingRequest,
      { tableName: TableNames.LOCATIONS, columnName: 'country', rowId: location.id as string },
      true
    )

    const numCityPending = getNumPending(
      overviewPendingRequest,
      { tableName: TableNames.LOCATIONS, columnName: 'city', rowId: location.id as string },
      true
    )

    const isFollowing = location.expandStatus === EnumExpandStatus.FOLLOWING
    const isAppendCQ = location.expandStatus === EnumExpandStatus.CHANGE_REQUEST

    const viewHistoryFn = (item: LocationFields, columnName: string) => {
      if (item.expandStatus === EnumExpandStatus.CHANGE_REQUEST) return undefined
      return !showViewHistory(TableNames?.LOCATIONS, columnName, item.id || '')
        ? undefined
        : () => {
            setHistoryModal(true)
            getHistory({
              tableName: TableNames?.LOCATIONS,
              columnName: columnName,
            })
          }
    }

    const viewPendingCQFn = (item: LocationFields, columnName: string) => {
      if (item.expandStatus === EnumExpandStatus.CHANGE_REQUEST) return undefined
      return getNumPending(overviewPendingRequest, {
        columnName,
        tableName: TableNames.LOCATIONS,
        rowId: item.id as string,
        source: item.source as string,
      }) === 0
        ? undefined
        : () => {
            handleClickShowPendingCR({
              tableName: TableNames?.LOCATIONS,
              columnName,
              rowId: item.id as string,
              source: item.source,
              companyId: companyId || 0,
            })
          }
    }
    const reasonRequired = !isOverridesUser && !isAppendCQ
    const callCancelCBAfterAction = !isOverridesUser && !isAppendCQ

    const { users } = findCQ(
      overviewPendingRequest,
      {
        tableName: TableNames.LOCATIONS,
        columnName: ColumnNames.FCT_STATUS_ID,
        rowId: location.id as string,
      },
      SourceIndependentTables.includes(TableNames.LOCATIONS)
    ) || {
      users: [],
    }

    const disableLocation =
      disabled ||
      (!!location.id &&
        ![EnumExpandStatus.FOLLOWING, EnumExpandStatus.CHANGE_REQUEST].includes(
          location.expandStatus as EnumExpandStatus
        )) ||
      editCRDisabled(users, user, isAppendCQ)

    const validateFields = (value: string) => {
      return !(!!value && checkLength(value, LOCATION_LENGTH))
    }

    return (
      <Box
        sx={{
          px: 3,
          py: 4,
          mt: 4,
          border: '1px solid black',
          borderRadius: 12,
          position: 'relative',
          ...sx,
        }}
      >
        <Flex
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            alignItems: 'center',
            mx: '-4px',
            '& > *': { mx: '4px !important' },
          }}
        >
          {!location.id ? (
            onRemoveLocation &&
            !location.is_headquarters && (
              <Button
                onPress={() => onRemoveLocation()}
                icon="remove"
                size="tiny"
                variant="black"
              />
            )
          ) : companyId ? (
            <FCTStatusAction
              isHorizontal
              disabled={disabled}
              reasonRequired={reasonRequired}
              identity={{
                tableName: TableNames.LOCATIONS,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: location.id as string,
                source: location.source as string,
              }}
              fctStatusId={location.expandStatus as EnumExpandStatus}
              selfDeclared={!!location.selfDeclared}
              handleAppendDataCQAction={handleAppendDataCQAction}
              viewHistoryFn={({ tableName, columnName, rowId }) => {
                return viewHistoryFn(location, columnName)
              }}
              viewPendingCQFn={({ tableName, columnName, rowId }) => {
                return viewPendingCQFn(location, columnName)
              }}
              handleUpdateStatus={async (reason, identity) => {
                const input = {
                  id: location.id as string,
                  companyId: +companyId,
                  reason: reason,
                  tableName: identity.tableName,
                  columnName: identity.columnName,
                  source: identity.source,
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
          ) : null}
        </Flex>
        <Grid gap={2} columns={['1fr 1fr']} sx={{ mt: isAddPage ? 3 : 5 }}>
          <ReasonPopover
            reasonRequired={reasonRequired}
            zIndex={popoverZIndex}
            disabled={isAddPage || isDisabled('country') || !location.id || disableLocation}
            labelSx={{ opacity: isDisabled('country') || disableLocation ? 0.5 : 1 }}
            positions={['top', 'bottom']}
            oldValue={oldData.country}
            newValue={newData.country}
            buttons={[
              {
                label: !isAddPage ? 'Submit' : 'Update',
                action: async () => {
                  try {
                    setLoading(true)
                    await handleUpdateField(
                      TableNames?.LOCATIONS,
                      'country',
                      oldData.country,
                      newData.country,
                      location.id || '',
                      location.source,
                      isAppendCQ
                    )
                  } catch (error) {
                    setOldData()
                  } finally {
                    setLoading(false)
                    setReason('')
                  }
                },
                type: 'primary',
                disabled:
                  loading ||
                  invalidUpdateData(
                    oldData.country,
                    newData.country,
                    reason,
                    isOverridesUser,
                    true,
                    isAppendCQ
                  ),
                isCancel: true,
              },
            ]}
            reason={reason}
            setReason={setReason}
            label={copy.fields.country}
            name="country"
            viewHistory={viewHistoryFn(location, 'country')}
            viewPendingChangeRequest={viewPendingCQFn(location, 'country')}
            totalItemPendingCR={numCountryPending}
            // Note RevertChange After Submit
            callCancelCBAfterAction={callCancelCBAfterAction}
            onCancelCallBack={() => {
              setOldData()
            }}
            variant={countries.some(e => e.value === location.country) ? 'primary' : 'black'}
          >
            <Dropdown
              name="country"
              value={location.country || ''}
              options={countries}
              variant={errorFields.includes('country') ? 'error' : 'black'}
              disabled={isDisabled('country') || disableLocation}
              onChange={(event: ChangeFieldEvent) => {
                onChangeField(event.target.value, event.target.name)
              }}
            />
          </ReasonPopover>
          <ReasonPopover
            zIndex={popoverZIndex}
            reasonRequired={reasonRequired}
            disabled={isAddPage || isDisabled('city') || !location.id || disableLocation}
            labelSx={{ opacity: isDisabled('city') || disableLocation ? 0.5 : 1 }}
            positions={['top', 'bottom']}
            oldValue={oldData.city}
            newValue={newData.city}
            buttons={[
              {
                label: !isAddPage ? 'Submit' : 'Update',
                action: async () => {
                  try {
                    setLoading(true)
                    await handleUpdateField(
                      TableNames?.LOCATIONS,
                      'city',
                      oldData.city,
                      newData.city,
                      location.id || '',
                      location.source,
                      isAppendCQ
                    )
                  } catch (error) {
                    setOldData()
                  } finally {
                    setLoading(false)
                    setReason('')
                  }
                },
                type: 'primary',
                disabled:
                  loading ||
                  invalidUpdateData(
                    oldData.city,
                    newData.city,
                    reason,
                    isOverridesUser,
                    false,
                    isAppendCQ
                  ) ||
                  !validateFields(location.city),
                isCancel: true,
              },
            ]}
            reason={reason}
            setReason={setReason}
            label={copy.fields.city}
            name="city"
            viewHistory={viewHistoryFn(location, 'city')}
            viewPendingChangeRequest={viewPendingCQFn(location, 'city')}
            totalItemPendingCR={numCityPending}
            // Note RevertChange After Submit
            callCancelCBAfterAction={callCancelCBAfterAction}
            onCancelCallBack={() => {
              setOldData()
            }}
            variant={!location.city ? 'black' : validateFields(location.city) ? 'primary' : 'error'}
          >
            <TextField
              name="city"
              type="input"
              value={location.city || ''}
              disabled={isDisabled('city') || disableLocation}
              onChange={(event: ChangeFieldEvent) => {
                onChangeField(event.target.value, event.target.name)
              }}
              fieldState={
                !location.city ? 'default' : validateFields(location.city) ? 'validated' : 'error'
              }
            />
          </ReasonPopover>
        </Grid>
      </Box>
    )
  }
)

export default LocationForm
