import React from 'react'
import { UseCaseResult } from '../../components/UseCaseForm/UseCaseForm'
import { ColumnNames } from '../../pages/CompanyForm/helpers'
import { GetCompanyOverrideInput } from '../../types'
import { EnumExpandStatusId } from '../../types/enums'
import useChangeRequest, { HandleAfterApproveData } from '../useChangeRequest'

type Props = {
  refetchViewHistoryCols: () => Promise<void>
  defaultSource: string
  companyId: number
  handleAfterReject(data: GetCompanyOverrideInput, isAppendData: boolean): void
}

const multipleIds = [2, 3]

export default function useProfileCQ({
  refetchViewHistoryCols,
  defaultSource,
  companyId,
  handleAfterReject,
}: Props) {
  const [editState, setEditState] = React.useState<UseCaseResult[]>([])
  const [oldState, setOldState] = React.useState<UseCaseResult[]>([])

  const updateStatus = (
    id: string | number,
    newStatus: EnumExpandStatusId,
    isAppendData: boolean = false
  ) => {
    const ucItem = oldState.find(item => item.use_case_id === +id)
    const mapFn = (item: UseCaseResult) => {
      return `${item.use_case_id}` === id ? { ...item, fct_status_id: +newStatus } : item
    }
    const filterFn = (item: UseCaseResult) => {
      return isAppendData &&
        !multipleIds.includes(ucItem?.use_case_type_id || -1) &&
        item.use_case_type_id === ucItem?.use_case_type_id
        ? item.use_case_id === +id
        : true
    }
    setEditState((editState || []).filter(filterFn).map(mapFn))
    setOldState(oldState.filter(filterFn).map(mapFn))
  }

  const handleApproveUpdateNewData = (
    data: HandleAfterApproveData,
    isAppendData: boolean = false
  ) => {
    if (data.columnName === ColumnNames.FCT_STATUS_ID) {
      updateStatus(data.rowId, data.newValue as EnumExpandStatusId, isAppendData)
    } else {
      const mapFn = (item: UseCaseResult) =>
        `${item.use_case_id}` === data.rowId ? { ...item, use_case_value: data.newValue } : item

      setEditState((editState || []).map(mapFn))
      setOldState(oldState.map(mapFn))
    }
  }

  const {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    showPendingChangeRequest,
    handleAppendDataCQAction,
  } = useChangeRequest({
    refetchViewHistoryCols,
    handleApproveUpdateNewData,
    handleAfterReject,
    defaultSource,
    companyId: +companyId,
  })

  return {
    PendingCRModal,
    overviewPendingRequest,
    refetchViewPendingChangeRequestCols,
    handleClickShowPendingCR,
    showPendingChangeRequest,
    handleAppendDataCQAction,
    editState,
    setEditState,
    oldState,
    setOldState,
    handleApproveUpdateNewData,
  }
}
