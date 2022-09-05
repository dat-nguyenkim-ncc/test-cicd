import React from 'react'
import { ColumnNames } from '../../pages/CompanyForm/helpers'
import { EnumExpandStatusId } from '../../types/enums'
import useChangeRequest, { HandleAfterApproveData } from '../useChangeRequest'

type Props = {
  refetchViewHistoryCols: () => Promise<void>
  defaultSource: string
  companyId: number
  field: string
  mapAfterApprove?: (item: any) => any
}

export default function useTechnologyCQ<T>({
  refetchViewHistoryCols,
  defaultSource,
  companyId,
  field,
  mapAfterApprove,
}: Props) {
  const [editState, setEditState] = React.useState<T[]>([])
  const [oldState, setOldState] = React.useState<T[]>([])

  const fieldName = (() => {
    switch (field) {
      case ColumnNames.TECHNOLOGY_PROVIDER_ID:
        return ColumnNames.COMPANY_TECHNOLOGY_PROVIDER_ID
      default:
        return field
    }
  })()

  const getRowId = (id: string | number) => {
    switch (field) {
      case ColumnNames.TECHNOLOGY_PROVIDER_ID:
        return id
      default:
        return +id
    }
  }

  const updateStatus = (id: string | number, newStatus: EnumExpandStatusId) => {
    const rowId = getRowId(id)
    const mapFn = (item: T) => {
      //@ts-ignore
      return item[fieldName] === rowId ? { ...item, fct_status_id: +newStatus } : item
    }

    //@ts-ignore
    const record: any = (editState || []).find(item => item[field] === rowId)

    const filterFn = (item: any) => {
      return field === ColumnNames.TECHNOLOGY_ID
        ? item[fieldName] === rowId ||
            item.technology_type_id !== record?.technology_type_id ||
            (item[fieldName] !== rowId && item.fct_status_id !== +EnumExpandStatusId.CHANGE_REQUEST)
        : true
    }

    setEditState((editState || []).filter(filterFn).map(mapFn))
    setOldState(oldState.filter(filterFn).map(mapFn))
  }

  const handleApproveUpdateNewData = (data: HandleAfterApproveData) => {
    const oneMoreMapFn =
      data.columnName === ColumnNames.CERTIFICATION && mapAfterApprove
        ? mapAfterApprove
        : (item: T) => item
    if (data.columnName === ColumnNames.FCT_STATUS_ID) {
      updateStatus(data.rowId, data.newValue as EnumExpandStatusId)
    } else {
      const mapFn = (item: T) =>
        //@ts-ignore
        +item[field] === +data.rowId ? { ...item, [data.columnName]: data.newValue } : item

      setEditState((editState || []).map(mapFn).map(oneMoreMapFn))
      setOldState(oldState.map(mapFn).map(oneMoreMapFn))
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
        const rowId = getRowId(data.rowId)
        //@ts-ignore
        setEditState(editState.filter(item => item[fieldName] !== rowId))
        //@ts-ignore
        setOldState(oldState.filter(item => item[fieldName] !== rowId))
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
