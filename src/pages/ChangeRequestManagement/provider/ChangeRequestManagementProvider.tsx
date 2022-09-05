import React from 'react'
import { ISortBy, ViewInterface } from '../../../types'
import { SortDirection } from '../../../types/enums'
import { StateFilterBy } from '../ChangeRequestFilter'
import { INIT_FILTER_BY } from '../ChangeRequetFilters'
import { ESortFields } from '../helpers'

type SortBy = ISortBy<ESortFields>
interface IContext {
  searchText: string
  setSearchText: React.Dispatch<React.SetStateAction<string>>
  sortBy: SortBy
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>
  filterBy: StateFilterBy
  setFilterBy: React.Dispatch<React.SetStateAction<StateFilterBy>>
}

const INIT = {
  searchText: '',
  setSearchText: () => {},
  sortBy: {
    field: ESortFields.COMPANY_NAME,
    direction: SortDirection.ASC,
  },
  setSortBy: () => {},
  filterBy: INIT_FILTER_BY,
  setFilterBy: () => {},
}
const ChangeRequestManagementContext = React.createContext<IContext>(INIT)
export const useChangeRequestManagement = () => {
  const context = React.useContext(ChangeRequestManagementContext)
  return context
}

const ChangeRequestManagementProvider = ({ children }: ViewInterface<{}>) => {
  const [searchText, setSearchText] = React.useState<string>('')
  const [sortBy, setSortBy] = React.useState<SortBy>({
    field: ESortFields.COMPANY_NAME,
    direction: SortDirection.ASC,
  })
  const [filterBy, setFilterBy] = React.useState<StateFilterBy>({ ...INIT_FILTER_BY })

  return (
    <ChangeRequestManagementContext.Provider
      value={{
        searchText,
        setSearchText,
        sortBy,
        setSortBy,
        filterBy,
        setFilterBy,
      }}
    >
      {children}
    </ChangeRequestManagementContext.Provider>
  )
}

export default ChangeRequestManagementProvider
