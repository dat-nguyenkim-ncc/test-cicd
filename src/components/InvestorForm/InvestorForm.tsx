import React, { useContext, useState } from 'react'
import { Grid, Box, Flex, Text, Label } from 'theme-ui'
import { ChangeFieldEvent, FormOption, ViewInterface } from '../../types'
import TextField from '../TextField'
import Button from '../Button'
import { Checkbox, Icon, InvestorListSearch, InvestorManagement, Modal, Updating } from '..'
import strings from '../../strings'
import { Heading, Paragraph } from '../primitives'
import {
  EnumBoolean,
  EnumCompanySource,
  EnumExpandStatus,
  EnumExpandStatusId,
  EnumInvestorSource,
  PERMISSIONS,
  Routes,
} from '../../types/enums'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
  ColumnNames,
  findCQ,
  getNumPending,
  OverridesCompanyDataInput,
  TableNames,
} from '../../pages/CompanyForm/helpers'
import {
  searchInvestorByName,
  updateStatusInvestor,
  UPDATE_COMPANY_INVESTOR,
} from '../../pages/CompanyForm/graphql'
import { ViewHistoryProps } from '../../pages/CompanyForm/CompanyForm'
import Popover from '../Popover'
import { Palette } from '../../theme'
import { reasonPopverZIndex } from '../../utils/consts'
import { useMemo } from 'react'
import { ETLRunTimeContext, UserContext } from '../../context'
import { ErrorModal } from '../ErrorModal'
import { isGrantedPermissions } from '../../utils'
import { FCTStatusAction } from '../FCTStatusAction'
import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import useChangeRequest from '../../hooks/useChangeRequest'
import CheckboxAction from '../CheckboxAction'
import useInvestorCR from '../InvestorListSearch/useInvestorCR'
import { ChangeRequestResultType } from '../../pages/ChangeRequestManagement/ChangeRequestManagement'
import { onError } from '../../sentry'
import { PendingChangeRequestModal } from '../../pages/CompanyForm/pendingCRModal'
import { IPengdingCQData } from '../PendingChangeRequest/PendingChangeRequest'

export type InvestorFormProps = ViewInterface<{
  isFunding?: boolean
  isEdit?: boolean
  companyId?: number
  roundId?: string
  source?: string | number
  name: string
  nameType: string
  investorState: Investor[]
  oldState?: Investor[]
  investor: FormOption[]
  checkDuplicate?(investor: Investor): boolean
  onChange(event: ChangeFieldEvent, index: number): void
  onRemoveItem(index: number): void
  onChangeInvestor(investor: Investor, index: number): void
  onChangeOldState?(column: string, value: string, investor_id: string): void
  setOldState?(investor: Investor[]): void
  disabled?: boolean
  hideSetLead?: boolean
  handleUpdateInvestor?(input: OverridesCompanyDataInput): void
  addInvestor?(investor: Investor): void
  refetchAPI?(): void
  queryLoading?: boolean
  viewHistory?(item: { tableName: string; columnName: string; rowId: string; source: string }): void
}> &
  ViewHistoryProps

export type InvestorItem = {
  investor_id?: string
  external_investor_id?: string
  associated_company_id?: string
  company_status_id?: number
  company_name?: string
  merged_company_id?: string
  investor_name: string
  investor_type: string
  source?: string
  component_company_status?: EnumExpandStatusId
}

export type Investor = {
  isEdit?: boolean
  expand_status_id?: string
  isLead?: boolean
  children?: InvestorItem[]
  funding_investor_id?: string
} & InvestorItem

const LEAD_GRID = ['1fr .8fr .7fr .7fr']
const GRID = ['1fr .8fr .7fr']

type ListItemProps = {
  hideSetLead?: boolean
  investor: Investor
  onCheck(): void
  onDelete(value?: EnumExpandStatusId): void
  viewHistory?(item: { tableName: string; columnName: string; rowId: string; source: string }): void
  companyId?: number
  onRemove(): void
  onChangeInvestor(investor: Investor, refetchHistory?: boolean): void
} & ViewHistoryProps
const ListItem = ({
  hideSetLead,
  investor,
  onDelete,
  onCheck,
  showViewHistory,
  viewHistory,
  companyId = 0,
  onRemove,
  onChangeInvestor,
}: ListItemProps) => {
  //Context
  const { isOverridesUser, handleUpdateStatus } = useContext(CompanyContext)

  const [isExpand, setIsExpand] = useState<boolean>(false)
  const hasChildren = !!investor.children?.length
  const isFollowing = investor.expand_status_id === EnumExpandStatusId.FOLLOWING
  const disabled = !isFollowing && investor.isEdit

  const memoTableName = React.useMemo(
    () => (hideSetLead ? TableNames.ACQUISITIONS_INVESTORS : TableNames.FUNDINGS_INVESTORS),
    [hideSetLead]
  )

  const viewHistoryFn = (tableName: string, columnName: string, id: string, source: string) => {
    return !showViewHistory(tableName, columnName, id, source)
      ? undefined
      : () => {
          viewHistory && viewHistory({ tableName: tableName, columnName, rowId: id, source })
        }
  }

  const {
    PendingCRModal,
    overviewPendingRequest,
    showPendingChangeRequest,
    handleClickShowPendingCR,
    handleAppendDataCQAction,
  } = useChangeRequest({
    handleAfterReject: async (data, isAppendData) => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID && isAppendData) {
        await onRemove()
      }
    },
    handleApproveUpdateNewData: async data => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        const newValue = isFollowing ? EnumExpandStatusId.UNFOLLOWED : EnumExpandStatusId.FOLLOWING
        onChangeInvestor({ ...investor, expand_status_id: newValue }, true)
      }
      if (data.columnName === ColumnNames.LEAD_INVESTOR) {
        onChangeInvestor({ ...investor, isLead: !investor.isLead }, true)
      }
    },
    defaultSource: EnumCompanySource.BCG,
    companyId: +companyId,
  })

  const viewPendingCQFn = (tableName: string, columnName: string, id: string, source: string) => {
    return !showPendingChangeRequest(tableName, columnName, id, source)
      ? undefined
      : () => {
          handleClickShowPendingCR({
            tableName,
            columnName,
            rowId: id,
            companyId: companyId,
            source,
          })
        }
  }

  const { users } = findCQ(overviewPendingRequest, {
    tableName: memoTableName,
    columnName: ColumnNames.FCT_STATUS_ID,
    rowId: investor.funding_investor_id || '',
    // source: EnumSourceNA.NA,
  }) || {
    users: [],
  }

  return (
    <>
      <Grid sx={{ py: 2, alignItems: 'end' }} columns={!hideSetLead ? LEAD_GRID : GRID}>
        <Box
          sx={{
            cursor: disabled ? '' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={() => hasChildren && setIsExpand(!isExpand)}
        >
          <Paragraph>{investor.investor_name || ''}</Paragraph>
        </Box>
        <Box
          sx={{
            cursor: disabled ? '' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={() => hasChildren && setIsExpand(!isExpand)}
        >
          <Paragraph>{investor.investor_type || ''}</Paragraph>
        </Box>

        {!hideSetLead ? (
          investor.isEdit ? (
            <CheckboxAction
              disabled={disabled}
              reasonRequired={
                !isOverridesUser && investor.expand_status_id !== EnumExpandStatusId.CHANGE_REQUEST
              }
              identity={{
                tableName: TableNames.FUNDINGS_INVESTORS,
                columnName: ColumnNames.LEAD_INVESTOR,
                rowId: investor.funding_investor_id || '',
                source: investor.source || EnumCompanySource.BCG,
              }}
              isCheck={!!investor.isLead}
              viewHistoryFn={({ tableName, columnName, rowId, source }) => {
                return viewHistoryFn(tableName, columnName, rowId, source)
              }}
              viewPendingCQFn={({ tableName, columnName, rowId, source }) => {
                return viewPendingCQFn(tableName, columnName, rowId, source)
              }}
              handleUpdateStatus={async (reason, identity) => {
                if (!companyId || !investor.funding_investor_id) {
                  return
                }
                const input = {
                  id: identity.rowId,
                  companyId: +companyId,
                  reason: reason,
                  tableName: identity.tableName,
                  columnName: identity.columnName,
                  source: identity.source,
                  newValue: investor.isLead ? `${EnumBoolean.FALSE}` : `${EnumBoolean.TRUE}`,
                  oldValue: investor.isLead ? `${EnumBoolean.TRUE}` : `${EnumBoolean.FALSE}`,
                }
                await handleUpdateStatus(input)
                if (isOverridesUser) onChangeInvestor({ ...investor, isLead: !investor.isLead })
              }}
              getNumPending={identity => {
                return getNumPending(overviewPendingRequest, identity, true)
              }}
              users={users}
            />
          ) : (
            <Checkbox
              disabled={disabled}
              size="small"
              square
              checked={investor.isLead}
              onPress={onCheck}
            />
          )
        ) : undefined}
        <Flex sx={{ justifyContent: 'space-between' }}>
          {investor.isEdit ? (
            <FCTStatusAction
              reasonRequired={
                !isOverridesUser && investor.expand_status_id !== EnumExpandStatusId.CHANGE_REQUEST
              }
              identity={{
                tableName: memoTableName,
                columnName: ColumnNames.FCT_STATUS_ID,
                rowId: investor.funding_investor_id || '',
                source: investor.source || EnumCompanySource.BCG,
              }}
              fctStatusId={
                (investor.expand_status_id as EnumExpandStatusId) || EnumExpandStatusId.FOLLOWING
              }
              viewHistoryFn={({ tableName, columnName, rowId, source }) => {
                return viewHistoryFn(tableName, columnName, rowId, source)
              }}
              viewPendingCQFn={({ tableName, columnName, rowId, source }) => {
                return viewPendingCQFn(tableName, columnName, rowId, source)
              }}
              handleUpdateStatus={async (reason, identity) => {
                if (!companyId || !investor.funding_investor_id) {
                  return
                }
                const newValue = isFollowing
                  ? EnumExpandStatusId.UNFOLLOWED
                  : EnumExpandStatusId.FOLLOWING
                const input = {
                  id: identity.rowId,
                  companyId: +companyId,
                  reason: reason,
                  tableName: identity.tableName,
                  columnName: identity.columnName,
                  source: identity.source,
                  newValue,
                  oldValue: isFollowing
                    ? EnumExpandStatusId.FOLLOWING
                    : EnumExpandStatusId.UNFOLLOWED,
                }
                console.log(input)
                await handleUpdateStatus(input)
                if (isOverridesUser) onChangeInvestor({ ...investor, expand_status_id: newValue })
              }}
              handleAppendDataCQAction={handleAppendDataCQAction}
              getNumPending={identity => {
                return getNumPending(overviewPendingRequest, identity, true)
              }}
              users={users}
            />
          ) : (
            <Button
              onPress={() => {
                onDelete()
              }}
              icon="remove"
              size="tiny"
              variant="black"
            />
          )}
          {hasChildren && (
            <Flex sx={{ cursor: 'pointer' }} onClick={() => hasChildren && setIsExpand(!isExpand)}>
              <Icon
                sx={{
                  transform: isExpand ? 'rotate(180deg)' : null,
                  mt: isExpand ? '-5px' : '5px',
                }}
                size="tiny"
                icon="arrow"
              />
            </Flex>
          )}
        </Flex>
      </Grid>
      {isExpand && (
        <Box sx={{ mb: 2, borderLeft: '1px solid #DDD' }}>
          {investor.children?.map((item, index) => (
            <Grid key={index} columns={GRID} sx={{ p: 3, pb: 0 }}>
              <Paragraph>{item.investor_name || ''}</Paragraph>
              <Paragraph>
                {EnumInvestorSource[item.source as keyof typeof EnumInvestorSource] ||
                  item.source ||
                  ''}
              </Paragraph>
            </Grid>
          ))}
        </Box>
      )}
      <PendingCRModal />
    </>
  )
}

let timer: any

const InvestorForm = ({
  sx,
  isFunding = false,
  companyId,
  // source,
  roundId,
  name,
  nameType,
  investorState,
  oldState = [],
  investor,
  checkDuplicate,
  onChange,
  onRemoveItem,
  onChangeInvestor,
  showViewHistory,
  refetchViewHistoryCols,
  onChangeOldState,
  setOldState,
  disabled,
  hideSetLead = false,
  handleUpdateInvestor,
  addInvestor,
  refetchAPI = () => {},
  queryLoading,
  viewHistory,
}: InvestorFormProps) => {
  const {
    pages: {
      addCompanyForm: { investor: copy },
    },
  } = strings

  // Context
  const { user } = useContext(UserContext)
  const { checkTimeETL } = useContext(ETLRunTimeContext)

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [deleteItem, setDeleteItem] = useState<{ item: Investor; index: number } | undefined>()
  const [editItem, setEditItem] = useState<{ item: Investor; index: number } | undefined>()
  const [investorModal, setInvestorModal] = useState(false)
  const [options, setOptions] = useState<Investor[]>([])

  const [searchState, setSearchState] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const [isEdited, setIsEdited] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  // GRAPHQL
  const [deleteInvestor, { loading: deleteLoading }] = useMutation(updateStatusInvestor)
  const [editInvestor, { loading: editing }] = useMutation(UPDATE_COMPANY_INVESTOR)
  const [searchInvestor, { data, loading }] = useLazyQuery(searchInvestorByName, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setOptions(data.searchInvestorByName.data)
    },
  })

  const onChangeField = (e: ChangeFieldEvent) => {
    const { value } = e.target
    if (searchState !== value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        searchInvestor({ variables: { name: value } })
      }, 500)
    }
    setSearchState(value)
  }

  const onDeleteInvestor = (item: Investor, index: number) => {
    onChangeInvestor(item, index)
    // setDeleteItem({ item, index })
    // setMessage(
    //   copy.confirm.unfollow.replace(
    //     '$status',
    //     `${item?.expand_status_id !== EnumExpandStatusId.FOLLOWING ? 'follow' : 'unfollow'}`
    //   )
    // )
    // setModalVisible(true)
  }

  const onEditInvestor = (item: Investor, index: number) => {
    setEditItem({ item, index })
    setMessage(
      copy.confirm.setLead
        .replace('$name', item.investor_name)
        .replace('$type', item.isLead ? 'support' : 'lead')
    )
    setModalVisible(true)
  }

  const onModalCancel = () => {
    setDeleteItem(undefined)
    setEditItem(undefined)
    setModalVisible(false)
  }

  const onModalConfirm = async () => {
    if (!checkTimeETL()) return
    try {
      if (deleteItem) {
        await deleteInvestor({
          variables: {
            isFunding,
            funding_id: roundId,
            id: deleteItem.item.external_investor_id,
            status:
              deleteItem.item.expand_status_id === EnumExpandStatusId.FOLLOWING
                ? EnumExpandStatus.UNFOLLOWED
                : EnumExpandStatus.FOLLOWING,
          },
        })
        const newStatus =
          deleteItem.item.expand_status_id === EnumExpandStatusId.FOLLOWING
            ? EnumExpandStatusId.UNFOLLOWED
            : EnumExpandStatusId.FOLLOWING
        let cloneState = [...oldState]
        cloneState[deleteItem.index] = {
          ...cloneState[deleteItem.index],
          expand_status_id: newStatus,
        }
        onChange(
          { target: { name: 'expand_status_id', value: newStatus } } as ChangeFieldEvent,
          deleteItem.index
        )
        setDeleteItem(undefined)
        setOldState && setOldState(cloneState)
        setModalVisible(false)
      }
      if (editItem) {
        const newValue = !editItem.item.isLead
        await editInvestor({
          variables: {
            funding_id: roundId,
            id: editItem.item.external_investor_id,
            lead_investor: +newValue,
          },
        })
        let cloneState = [...oldState]
        cloneState[editItem.index] = {
          ...cloneState[editItem.index],
          isLead: newValue,
        }
        onChangeInvestor({ ...editItem.item, isLead: newValue } as Investor, editItem.index)
        setEditItem(undefined)
        setOldState && setOldState(cloneState)
        setModalVisible(false)
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const hasPermission = useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.INVESTOR_MANAGEMENT] }, user),
    [user]
  )

  // Handle investor change request
  const [pendingCRModal, setPendingCRModal] = React.useState<boolean>(false)

  const {
    dataCR,
    setDataCR,
    CRloading,
    setLoading,
    approvedCR,
    setApprovedCR,
    rejectCR,
    setRejectCR,
    handleActionPendingCR,
  } = useInvestorCR({
    refetch: () => {
      searchInvestor({ variables: { name: searchState } })
    },
  })

  const onHandleChangeRequest = React.useCallback(
    async (approved: boolean, id?: string) => {
      if (!id) return
      setOpen(false)
      try {
        setLoading(true)
        const changRequest =
          data?.searchInvestorByName.pendingCR?.find((cr: ChangeRequestResultType) =>
            cr.dataOverride.some(({ rowId }) => rowId === id)
          )?.dataOverride || []
        if (approved) {
          setApprovedCR(changRequest[0])
        } else {
          setRejectCR(changRequest)
        }
      } catch (error) {
        onError(error)
        setErrorMessage(error.message)
      } finally {
        setPendingCRModal(true)
        setLoading(false)
      }
    },
    [setOpen, setLoading, setPendingCRModal, setApprovedCR, setRejectCR, data]
  )

  const memoListSearch = useMemo(
    () => (
      <InvestorListSearch
        sx={{
          maxHeight: '35vh',
          overflow: 'auto',
          mt: 2,
        }}
        investors={options || []}
        selected={investorState}
        setSelected={() => {}}
        onCheck={investor => {
          if (hasPermission && investor.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST) {
            setOpen(false)
            setErrorMessage(copy.error.addCRToFunding)
            return
          }
          addInvestor &&
            addInvestor({
              investor_id: investor.investor_id,
              external_investor_id: investor.external_investor_id,
              investor_name: investor.investor_name,
              investor_type: investor.investor_type,
              source: investor.source,
              isEdit: investor.isEdit,
              isLead: investor.isLead,
              children: investor.children,
            })
        }}
        hasPermission={hasPermission}
        refetch={() => {
          searchInvestor({ variables: { name: searchState } })
        }}
        pendingCR={data?.searchInvestorByName.pendingCR}
        showPending={false}
        onHandleChangeRequest={onHandleChangeRequest}
        onHandleReject={(cr: IPengdingCQData[]) => {
          setDataCR(cr)
          setPendingCRModal(true)
        }}
      />
    ),
    [
      options,
      addInvestor,
      investorState,
      hasPermission,
      copy,
      searchInvestor,
      searchState,
      data,
      onHandleChangeRequest,
      setDataCR,
    ]
  )

  return (
    <Box sx={sx}>
      <Flex sx={{ mb: 16, justifyContent: 'space-between' }}>
        <Paragraph sx={{ flex: 1 }} bold>
          {copy.labels.investors}
        </Paragraph>
        <Label
          sx={{ width: 'fit-content', justifyContent: 'flex-end', cursor: 'pointer' }}
          color="primary"
          onClick={() => {
            setInvestorModal(true)
          }}
        >
          {copy.investorManagement}
        </Label>
      </Flex>

      <Box
        sx={{
          bg: 'gray03',
          mb: 4,
          borderRadius: 10,
          p: 4,
          position: 'relative',
        }}
      >
        <Paragraph sx={{ mb: 3 }}>Investor Name</Paragraph>
        <Popover
          open={open}
          setOpen={setOpen}
          positions={['bottom', 'top']}
          align="start"
          noArrow
          content={
            <>
              {!data && !loading ? null : (
                <Box
                  sx={{
                    mt: 2,
                    bg: 'white',
                    border: `solid 1px ${Palette.gray01}`,
                    borderRadius: 12,
                    width: 514,
                  }}
                >
                  {loading ? (
                    <Updating sx={{ py: 6 }} loading />
                  ) : !searchState || !data ? null : !options.length ? (
                    <Flex
                      sx={{ justifyContent: 'space-between', px: 5, py: 4, alignItems: 'center' }}
                    >
                      <Box>
                        <Paragraph>This investor is not available yet.</Paragraph>
                        <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
                          Do you want to create a new investor
                          <span style={{ fontWeight: 'bold' }}>{` ${searchState}?`}</span>
                        </Text>
                      </Box>
                      <Button
                        onPress={() => {
                          setInvestorModal(true)
                          setOpen(false)
                        }}
                        label="Create Investor"
                      />
                    </Flex>
                  ) : (
                    memoListSearch
                  )}
                </Box>
              )}
            </>
          }
          zIndex={reasonPopverZIndex}
        >
          <Flex
            sx={{
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingY: 2,
              paddingX: 2,
              mb: 1,
              // ...sx,
            }}
          >
            <Button
              icon="search"
              size="small"
              onPress={() => {
                searchInvestor({ variables: { name: searchState } })
              }}
              color="darkGray"
              sx={{
                backgroundColor: 'transparent',
                color: 'transparent',
                borderColor: 'transparent',
              }}
            />
            <TextField
              sx={{ py: 0, px: 2, bg: 'transparent' }}
              name="search"
              type="search"
              placeholder="Search..."
              onChange={onChangeField}
              size="normal"
              value={searchState}
            />
          </Flex>
        </Popover>
        {!!investorState.length &&
          (queryLoading ? (
            <Updating sx={{ py: 6 }} loading />
          ) : (
            <Box>
              <Grid sx={{ py: 3 }} columns={!hideSetLead ? LEAD_GRID : GRID}>
                <Paragraph bold>Investors</Paragraph>
                <Paragraph bold>Type</Paragraph>
                {!hideSetLead && <Paragraph bold>Lead investor</Paragraph>}
                <Paragraph bold>Enable/Disable</Paragraph>
              </Grid>
              {investorState.map((investor, index) => (
                <ListItem
                  key={index}
                  hideSetLead={hideSetLead}
                  investor={investor}
                  onDelete={expand_status_id =>
                    !disabled && !investor.isEdit
                      ? onRemoveItem(index)
                      : onDeleteInvestor({ ...investor, expand_status_id }, index)
                  }
                  onRemove={() => {
                    onRemoveItem(index)
                  }}
                  onCheck={() => {
                    investor.isEdit
                      ? onEditInvestor(investor, index)
                      : onChangeInvestor(
                          { ...investor, isLead: !investor.isLead } as Investor,
                          index
                        )
                  }}
                  onChangeInvestor={(investor, refetchHistory) => {
                    onChangeInvestor(investor, index)
                    if (refetchViewHistoryCols && refetchHistory) refetchViewHistoryCols()
                  }}
                  showViewHistory={showViewHistory}
                  viewHistory={viewHistory}
                  companyId={companyId}
                />
              ))}
            </Box>
          ))}
      </Box>
      {modalVisible && (
        <Modal
          buttons={[
            {
              disabled: deleteLoading || editing,
              label: copy.modals.leave.buttons.no,
              type: 'outline',
              action: onModalCancel,
            },
            {
              disabled: deleteLoading || editing,
              label: copy.modals.leave.buttons.yes,
              type: 'primary',
              action: onModalConfirm,
            },
          ]}
        >
          <Heading center as="h4">
            {message}
          </Heading>
        </Modal>
      )}

      {investorModal && (
        <Modal
          sx={{
            p: 4,
            maxWidth: '60vw',
            alignItems: 'flex-start',
            minWidth: 700,
          }}
        >
          <InvestorManagement
            onClose={() => {
              setInvestorModal(false)
              if (isEdited && refetchAPI) {
                refetchAPI()
              }
              searchInvestor({ variables: { name: searchState } })
            }}
            setIsEdited={setIsEdited}
            refetchAPI={refetchAPI}
          />
        </Modal>
      )}

      {pendingCRModal && (
        <PendingChangeRequestModal
          data={dataCR || (approvedCR ? [approvedCR] : rejectCR || [])}
          loading={CRloading}
          setIsSaving={() => {}}
          setError={() => {}}
          isSaving={false}
          onPressOK={async (search: boolean) => {
            setApprovedCR(undefined)
            setRejectCR(undefined)
            setPendingCRModal(false)
            if (search) {
              searchInvestor({ variables: { name: searchState } })
            }
          }}
          handleApproveUpdateNewData={() => {}}
          handleActionPendingCR={handleActionPendingCR}
          approvedCR={approvedCR}
          rejectCR={rejectCR}
        />
      )}

      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onOK={() => {
            setErrorMessage(undefined)
          }}
        />
      )}
    </Box>
  )
}
export default InvestorForm
