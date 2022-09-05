import { useApolloClient } from '@apollo/client'
import { Box } from '@theme-ui/components'
import React, { useState } from 'react'
import { Dropdown, Modal, TextField, Updating } from '../..'
import {
  APPROVE_PENDING_REQUEST,
  DeclineChangeRequestInput,
  DECLINE_PENDING_REQUEST,
} from '../../../pages/CompanyForm/graphql/pendingChangeRequests'
import { ColumnNames, OverridesInvestorInput, TableNames } from '../../../pages/CompanyForm/helpers'
import { investor } from '../../../pages/CompanyForm/mock'
import { PendingChangeRequestModal } from '../../../pages/CompanyForm/pendingCRModal'
import strings from '../../../strings'
import { ChangeFieldEvent, GetCompanyOverrideInput, OverridesData } from '../../../types'
import { Investor } from '../../InvestorForm'
import { OverridesHistory } from '../../OverridesHistory'
import { IPengdingCQData } from '../../PendingChangeRequest/PendingChangeRequest'
import { Heading, Paragraph } from '../../primitives'
import ReasonPopover from '../../ReasonPopover'

export type InvestorOverride = {
  name: OverridesData[]
  type: OverridesData[]
}

export type InvestorPendingCR = {
  name: IPengdingCQData[]
  type: IPengdingCQData[]
}

export type InvestorOverrideLoading = {
  name: boolean
  type: boolean
}

type EditFormProps = {
  disabled?: boolean
  state: Investor
  editState: Investor
  dataInvestor: Investor[]
  pendingUpdateInvestor: OverridesInvestorInput[]
  onChange(state: Investor): void
  getInvestor(name: string): void
  setPendingUpdateInvestor(value: OverridesInvestorInput[]): void
  pendingCR?: InvestorPendingCR
  overrides?: InvestorOverride
  loading?: InvestorOverrideLoading
  isOverridesUser?: boolean
  refetch?(text: string): void
}
let timer: any

const EditForm = ({
  disabled,
  state,
  editState,
  dataInvestor,
  pendingUpdateInvestor,
  onChange,
  getInvestor,
  setPendingUpdateInvestor,
  overrides = { name: [], type: [] },
  pendingCR = { name: [], type: [] },
  loading = { name: false, type: false },
  isOverridesUser,
  refetch,
}: EditFormProps) => {
  const {
    pages: {
      addCompanyForm: {
        investor: { management: copy },
      },
    },
  } = strings

  const {
    pages: { addCompanyForm: title },
  } = strings

  const { name, type } = overrides
  const { name: nameCR, type: typeCR } = pendingCR

  const client = useApolloClient()

  const [reason, setReason] = useState<string>('')
  const [historyModal, setHistoryModal] = useState(false)
  const [pendingCRModal, setPendingCRModal] = React.useState<boolean>(false)
  const [selectedOverride, setSelectedOverride] = useState<OverridesData[]>([])
  const [dataPending, setDataPending] = React.useState<IPengdingCQData[]>([])
  const [CRloading, setLoading] = React.useState<boolean>(false)

  const onChangeField = (e: ChangeFieldEvent) => {
    const { name, value } = e.target
    if (name === 'investor_name' && state.investor_name !== value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        getInvestor(value?.trimRight())
      }, 500)
    }
    onChange({ ...state, [name]: value })
  }

  const getOldValue = (name: string) => {
    if (name === ColumnNames.INVESTOR_NAME) return editState.investor_name || ''
    if (name === ColumnNames.INVESTOR_TYPE) return editState.investor_type || ''
    return ''
  }

  const handleUpdateInvestor = (investorInput: OverridesInvestorInput) => {
    const index = pendingUpdateInvestor.findIndex(item => {
      const { tableName, columnName, id, source } = item

      const {
        tableName: tableName1,
        columnName: columnName1,
        id: id1,
        source: source1,
      } = investorInput

      return (
        tableName === tableName1 && columnName === columnName1 && id === id1 && source === source1
      )
    })
    if (index > -1) {
      const cloneState = [...pendingUpdateInvestor]
      cloneState[index] = investorInput
      setPendingUpdateInvestor(cloneState)
    } else setPendingUpdateInvestor([...pendingUpdateInvestor, investorInput])
  }

  const onUpdateInvestor = async (
    column: string,
    { investor_id, investor_name, investor_type, source }: Investor
  ) => {
    try {
      handleUpdateInvestor({
        id: investor_id || '',
        tableName: TableNames.INVESTOR,
        columnName: column,
        oldValue: getOldValue(column),
        newValue: column === ColumnNames.INVESTOR_NAME ? investor_name : investor_type,
        source: source || '',
        reason,
      })

      setReason('')
    } catch (error) {
      console.log(error)
    }
  }

  const isDuplicated = dataInvestor.some(
    (item: Investor) =>
      item.investor_name?.trimEnd() === state.investor_name?.trimEnd() &&
      item.investor_id !== state.investor_id
  )

  const approvePendingRequest = React.useCallback(
    async input => {
      await client.mutate({ mutation: APPROVE_PENDING_REQUEST, variables: { input } })
    },
    [client]
  )

  const declinePendingCR = React.useCallback(
    async (dataOverrideIds: number[], rejectReason: string) => {
      await client.mutate<any, { input: DeclineChangeRequestInput }>({
        mutation: DECLINE_PENDING_REQUEST,
        variables: {
          input: {
            dataOverrideIds,
            reason: rejectReason,
          },
        },
      })
    },
    [client]
  )
  const handleActionPendingCR = React.useCallback(
    async (
      requestInfo: GetCompanyOverrideInput,
      changeRequests: IPengdingCQData[] = [],
      rejectReason: string,
      isAprrove: boolean = false
    ) => {
      try {
        setLoading(true)
        if (isAprrove) {
          const changeRequest = changeRequests[0]
          if (changeRequest) {
            await approvePendingRequest({
              item: {
                tableName: changeRequest.tableName,
                columnName: changeRequest.columnName,
                reason: changeRequest.comment,
                oldValue: changeRequest.oldValue,
                newValue: changeRequest.newValue,
                companyId: -1,
                id: requestInfo.rowId,
                source: changeRequest.source,
                dataOverrideId: changeRequests[0].dataOverrideId,
              },
              reason: rejectReason,
            })
          }
        } else {
          await declinePendingCR(
            changeRequests.map(i => i.dataOverrideId),
            rejectReason
          )
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    [approvePendingRequest, declinePendingCR]
  )

  return loading.name || loading.type ? (
    <Box>
      <Updating sx={{ py: 65 }} loading />
    </Box>
  ) : (
    <Box>
      <ReasonPopover
        reasonRequired={!isOverridesUser}
        disabled={disabled}
        positions={['top', 'bottom']}
        buttons={[
          {
            label: 'Update',
            isCancel: true,
            action: () => {
              onUpdateInvestor(ColumnNames.INVESTOR_NAME, state)
            },
            type: 'primary',
            disabled:
              getOldValue(ColumnNames.INVESTOR_NAME)?.trimEnd() ===
                state.investor_name?.trimEnd() || !state.investor_name,
          },
        ]}
        oldValue={getOldValue(ColumnNames.INVESTOR_NAME)}
        newValue={state.investor_name}
        reason={reason}
        setReason={setReason}
        onCancelCallBack={() => {
          if (state.investor_name !== getOldValue(ColumnNames.INVESTOR_NAME)) {
            onChange({
              ...state,
              [ColumnNames.INVESTOR_NAME]: getOldValue(ColumnNames.INVESTOR_NAME),
            })
            setPendingUpdateInvestor(
              pendingUpdateInvestor.filter(item => item.columnName !== ColumnNames.INVESTOR_NAME)
            )
          }
        }}
        viewHistory={
          name.length
            ? () => {
                setHistoryModal(true)
                setSelectedOverride(name)
              }
            : undefined
        }
        viewPendingChangeRequest={
          nameCR.length
            ? () => {
                setPendingCRModal(true)
                setDataPending(nameCR)
              }
            : undefined
        }
        totalItemPendingCR={nameCR.length}
        label={' '}
      >
        <TextField
          disabled={disabled}
          sx={{ borderRadius: 8, border: isDuplicated ? 'solid 1px red' : '' }}
          placeholder="Enter investor name"
          name="investor_name"
          onChange={onChangeField}
          value={state.investor_name}
        />
      </ReasonPopover>
      {isDuplicated && (
        <Paragraph sx={{ pt: 1, pl: 2, color: 'red' }}>{copy.message.duplicate}</Paragraph>
      )}
      <ReasonPopover
        reasonRequired={!isOverridesUser}
        disabled={disabled}
        positions={['top', 'bottom']}
        buttons={[
          {
            label: 'Update',
            isCancel: true,
            action: () => onUpdateInvestor(ColumnNames.INVESTOR_TYPE, state),
            type: 'primary',
            disabled:
              getOldValue(ColumnNames.INVESTOR_TYPE) === state.investor_type ||
              !state.investor_type,
          },
        ]}
        oldValue={getOldValue(ColumnNames.INVESTOR_TYPE)}
        newValue={state.investor_type}
        reason={reason}
        setReason={setReason}
        onCancelCallBack={() => {
          if (state.investor_type !== getOldValue(ColumnNames.INVESTOR_TYPE)) {
            onChange({
              ...state,
              [ColumnNames.INVESTOR_TYPE]: getOldValue(ColumnNames.INVESTOR_TYPE),
            })
            setPendingUpdateInvestor(
              pendingUpdateInvestor.filter(item => item.columnName !== ColumnNames.INVESTOR_TYPE)
            )
          }
        }}
        viewHistory={
          type.length
            ? () => {
                setHistoryModal(true)
                setSelectedOverride(type)
              }
            : undefined
        }
        viewPendingChangeRequest={
          typeCR.length
            ? () => {
                setPendingCRModal(true)
                setDataPending(typeCR)
              }
            : undefined
        }
        totalItemPendingCR={typeCR.length}
        label={' '}
        sx={{ mt: type.length || typeCR.length ? 3 : 0 }}
      >
        <Dropdown
          disabled={disabled}
          name="investor_type"
          placeholder="Type of investor"
          value={state.investor_type || ''}
          options={investor || []}
          onChange={onChangeField}
        />
      </ReasonPopover>
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
            {title.modals.overrides.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <OverridesHistory data={selectedOverride} />
          </Box>
        </Modal>
      )}
      {pendingCRModal && (
        <PendingChangeRequestModal
          data={dataPending}
          loading={CRloading}
          setIsSaving={() => {}}
          setError={() => {}}
          isSaving={false}
          onPressOK={async (search: boolean) => {
            setPendingCRModal(false)
            if (search) {
              refetch && refetch(state.investor_name)
            }
          }}
          handleApproveUpdateNewData={() => {}}
          handleActionPendingCR={handleActionPendingCR}
        />
      )}
    </Box>
  )
}

export default EditForm
