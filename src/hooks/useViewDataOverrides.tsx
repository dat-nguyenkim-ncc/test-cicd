import { HasHistoryField, HasPendingCQField } from '../pages/CompanyForm/CompanyForm'
import { getNumPending, SourceIndependentTables } from '../pages/CompanyForm/helpers'
import { GetCompanyOverrideInput } from '../types'
import { EnumReverseApiSource } from '../types/enums'

type Identity = GetCompanyOverrideInput

type Props = {
  listPendingRequest: Array<HasPendingCQField>
  listOverride: Array<HasHistoryField>

  viewPendingCQ(input: Identity): void
  viewHistory(input: Identity): void

  companySource: EnumReverseApiSource
}

export const useViewDataOverrides = ({
  listPendingRequest,
  listOverride,
  viewPendingCQ,
  viewHistory,
  companySource,
}: Props) => {
  const showViewHistory = (
    tableName: string,
    columnName: string,
    rowId: string,
    source: string = companySource
  ) => {
    return listOverride.some(
      x =>
        x.tableName === tableName &&
        x.columnName === columnName &&
        x.rowId === rowId &&
        (SourceIndependentTables.includes(tableName)
          ? true
          : x.source === source || x.source === 'NA')
    )
  }

  const showPendingChangeRequest = (
    tableName: string,
    columnName: string,
    rowId: string,
    source: string = companySource
  ) => {
    return getNumPending(listPendingRequest, { tableName, columnName, rowId, source }) > 0
  }

  const viewPendingCQFn = (check: Identity) => {
    return showPendingChangeRequest(
      check.tableName,
      check.columnName,
      check.rowId as string,
      check.source
    )
      ? () => viewPendingCQ(check)
      : undefined
  }

  const viewHistoryFn = (check: Identity) => {
    return showViewHistory(check.tableName, check.columnName, check.rowId as string, check.source)
      ? () => viewHistory(check)
      : undefined
  }

  return { viewPendingCQFn, viewHistoryFn }
}
