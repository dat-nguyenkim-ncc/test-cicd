import React from 'react'
import { FinanceServiceLicense } from '../../components/ProfileForm/FinanceServicesLicenses'
import { ColumnNames } from '../../pages/CompanyForm/helpers'
import { EnumExpandStatusId } from '../../types/enums'
import useChangeRequest, { HandleAfterApproveData } from '../useChangeRequest'

type Props = {
  refetchViewHistoryCols: () => Promise<void>
  defaultSource: string
  companyId: number
}

export default function useFinanceServiceLicenseCQ({
  refetchViewHistoryCols,
  defaultSource,
  companyId,
}: Props) {
  const [editState, setEditState] = React.useState<FinanceServiceLicense[]>([])
  const [oldState, setOldState] = React.useState<FinanceServiceLicense[]>([])

  const updateStatus = (id: string | number, newStatus: EnumExpandStatusId) => {
    const mapFn = (item: FinanceServiceLicense) => {
      return +item.id === +id
        ? ({ ...item, fctStatusId: +newStatus } as FinanceServiceLicense)
        : item
    }
    setEditState((editState || []).map(mapFn))
    setOldState(oldState.map(mapFn))
  }

  const handleApproveUpdateNewData = (data: HandleAfterApproveData) => {
    if (data.columnName === ColumnNames.FCT_STATUS_ID) {
      updateStatus(data.rowId, data.newValue as EnumExpandStatusId)
    } else {
      const mapFn = (item: FinanceServiceLicense) =>
        item.id === +data.rowId ? { ...item, [data.columnName]: data.newValue } : item

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
    handleAfterReject: (data, isAppendData) => {
      if (isAppendData) {
        setEditState(editState.filter(item => item.id !== +data.rowId))
        setOldState(oldState.filter(item => item.id !== +data.rowId))
      }
    },
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
