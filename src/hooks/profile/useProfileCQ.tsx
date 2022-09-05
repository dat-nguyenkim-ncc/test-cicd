import React from 'react'
import { ProfileEditType } from '../../components/ProfileForm'
import { ColumnNames, SingleProfileTypeIds } from '../../pages/CompanyForm/helpers'
import { EnumExpandStatusId } from '../../types/enums'
import useChangeRequest, { HandleAfterApproveData } from '../useChangeRequest'

type Props = {
  refetchViewHistoryCols: () => Promise<void>
  defaultSource: string
  companyId: number
}

export default function useProfileCQ({ refetchViewHistoryCols, defaultSource, companyId }: Props) {
  const [editState, setEditState] = React.useState<ProfileEditType[]>([])
  const [oldState, setOldState] = React.useState<ProfileEditType[]>([])

  const updateStatus = (
    id: string | number,
    newStatus: EnumExpandStatusId,
    isAppendData: boolean = false
  ) => {
    const profileItem = oldState.find(item => +item.profile_id === +id)
    const mapFn = (item: ProfileEditType) => {
      return item.profile_id === id ? { ...item, expand_status_id: newStatus } : item
    }
    const filterFn = (item: ProfileEditType) => {
      return isAppendData &&
        SingleProfileTypeIds.includes(+(profileItem?.profile_type_id || -1)) &&
        item.profile_type_id === profileItem?.profile_type_id
        ? +item.profile_id === +id
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
      const mapFn = (item: ProfileEditType) =>
        item.profile_id === data.rowId ? { ...item, profile_value: data.newValue } : item

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
        setEditState(editState.filter(item => item.profile_id !== data.rowId))
        setOldState(oldState.filter(item => item.profile_id !== data.rowId))
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
