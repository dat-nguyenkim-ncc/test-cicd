import React from 'react'
import { GetCompanyOverrideInput } from '../../../types'
import { EnumReverseApiSource } from '../../../types/enums'
import { HasHistoryField, HasPendingCQField } from '../CompanyForm'
import { OverridesCompanyDataInput } from '../helpers'

export type IHandleAppendDataCQAction = (
  identity: HasHistoryField,
  isApprove: boolean
) => Promise<void> | void

export type IHandleUpdateStatus = (input: OverridesCompanyDataInput) => Promise<void>

export type IHandleUpdateField = (
  input: {
    tableName: string
    columnName: string
    oldValue: string | number
    newValue: string | number
    id: string
    source?: string
  },
  isAppendData?: boolean
) => Promise<void> | void

export type IHandleClickShowPendingCR = (request: GetCompanyOverrideInput) => void

type IContext = {
  companySource: EnumReverseApiSource
  companyId: number
  viewHistory: (input: GetCompanyOverrideInput) => void

  pendingRequestData: any
  getPendingRequestLoading: any
  overviewPendingRequest: any
  refreshNumPending: any
  handleClickShowPendingCR: IHandleClickShowPendingCR
  isOverridesUser: boolean
  hasHistoryField: HasHistoryField[]
  handleOverrideData: any
  handleUpdateStatus: IHandleUpdateStatus
  handleAppendDataCQAction: IHandleAppendDataCQAction
  handleUpdateField: IHandleUpdateField
}

export const CompanyContext = React.createContext<IContext>({
  pendingRequestData: {},
  getPendingRequestLoading: false,
  overviewPendingRequest: [] as HasPendingCQField[],
  refreshNumPending: () => {},
  handleClickShowPendingCR: (request: GetCompanyOverrideInput) => {},
  isOverridesUser: false,
  viewHistory: (input: GetCompanyOverrideInput) => {},
  companyId: 0,
  hasHistoryField: {} as HasHistoryField[],
  handleOverrideData: async (input: OverridesCompanyDataInput | OverridesCompanyDataInput[]) => {},
  handleUpdateStatus: async (input: OverridesCompanyDataInput) => {},
  companySource: '' as EnumReverseApiSource,
  handleAppendDataCQAction: (_, __) => {},
  handleUpdateField: () => {},
})
export default CompanyContext
