import { useLazyQuery } from '@apollo/client'
import { Box, Flex } from '@theme-ui/components'
import React, { useState } from 'react'
import { Button } from '..'
import { searchInvestorByName } from '../../pages/CompanyForm/graphql'
import { ViewInterface } from '../../types'
import { Investor } from '../InvestorForm'
import CreateInvestor from './CreateInvestor'
import { EnumInvestorManagementScreen, ScreenType } from './helpers'
import Management from './Management'
import MergeInvestor from './MergeInvestor'
import EditInvestor from './EditInvestor'
import DeleteInvestor from './DeleteInvestor'
import { ErrorModal } from '../ErrorModal'
import { useCallback } from 'react'
import Modal from '../Modal'
import { UserContext } from '../../context'
import { isGrantedPermissions } from '../../utils'
import { PERMISSIONS, Routes } from '../../types/enums'
import { ChangeRequestResultType } from '../../pages/ChangeRequestManagement/ChangeRequestManagement'
import { IPengdingCQData } from '../PendingChangeRequest/PendingChangeRequest'
import { ColumnNames } from '../../pages/CompanyForm/helpers'

type InvestorManagementProps = ViewInterface<{
  isPage?: boolean
  onClose(): void
  setIsEdited(state: boolean): void
  rowId?: string
  refetchAPI?: () => void
}>

let isFirstRun = true

const InvestorManagement = ({
  sx,
  isPage = false,
  onClose,
  setIsEdited,
  rowId,
  refetchAPI
}: InvestorManagementProps) => {
  // Context
  const { user } = React.useContext(UserContext)

  const hasPermission = React.useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.INVESTOR_MANAGEMENT] }, user),
    [user]
  )

  const [screen, setScreen] = useState<ScreenType>(EnumInvestorManagementScreen.management)
  const [searchState, setSearchState] = useState<string>('')
  const [editState, setEditState] = useState<Investor>({} as Investor)
  const [investorState, setInvestorState] = useState<Investor>({} as Investor)
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })

  // GRAPHQL
  const [searchInvestor, { data, loading }] = useLazyQuery(searchInvestorByName, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  // Effect
  React.useEffect(() => {
    if (rowId && isFirstRun) {
      searchInvestor({ variables: { id: rowId, getCR: true } })
      isFirstRun = false
    }
  }, [rowId, searchInvestor])

  const onBack = () => {
    setScreen(EnumInvestorManagementScreen.management)
  }

  const setError = useCallback(
    (err: string) => {
      setMessage({ title: 'Error', content: err || '' })
    },
    [setMessage]
  )

  const resetAll = () => {
    setSearchState('')
    setEditState({} as Investor)
    setInvestorState({} as Investor)
    setMessage({ title: '', content: '' })
    onBack()
  }

  const onSearch = (name = searchState) => {
    searchInvestor({ variables: { name: name.trim(), getCR: true } })
  }

  const onEdit = useCallback(
    (investor: Investor, isDelete = false) => {
      setEditState(investor)
      setInvestorState(investor)
      if (isDelete) {
        setScreen(EnumInvestorManagementScreen.delete)
      } else setScreen(EnumInvestorManagementScreen.edit)
    },
    [setEditState, setInvestorState, setScreen]
  )

  const onDelete = useCallback(investor => onEdit(investor, true), [onEdit])

  const isOverridesUser = React.useMemo(() => {
    const pendingItem =
      data?.searchInvestorByName.pendingCR?.find((cr: ChangeRequestResultType) =>
        cr.dataOverride.some(({ rowId }) => rowId === editState.investor_id)
      )?.dataOverride || []

    return (
      hasPermission ||
      pendingItem.some(
        (item: IPengdingCQData) =>
          item.user === user.email && item.columnName === ColumnNames.FCT_STATUS_ID
      )
    )
  }, [hasPermission, data, editState, user])

  const onSuccess = (investor = investorState.investor_name) => {
    resetAll()
    if (isOverridesUser) {
      setSearchState(investor)
      setIsEdited(true)
      onSearch(investor)
    }
  }

  return (
    <>
      {screen === EnumInvestorManagementScreen.management && !isPage && (
        <Flex sx={{ justifyContent: 'flex-end', width: '100%', ...sx }}>
          <Button
            sx={{ position: 'absolute' }}
            onPress={onClose}
            icon="remove"
            size="tiny"
            variant="black"
          />
        </Flex>
      )}

      <Box sx={{ p: isPage ? 0 : 3, width: '100%' }}>
        <Management
          loading={loading}
          searchState={searchState}
          data={data?.searchInvestorByName.data}
          pendingCR={data?.searchInvestorByName.pendingCR}
          changeScreen={screen => {
            setInvestorState({} as Investor)
            setScreen(screen)
          }}
          setSearchState={setSearchState}
          searchInvestor={onSearch}
          onEdit={onEdit}
          onDelete={onDelete}
          isPage={isPage}
          hasPermission={hasPermission}
        />
      </Box>

      {screen !== EnumInvestorManagementScreen.management && (
        <Modal
          sx={{
            p: 4,
            maxWidth: '60vw',
            alignItems: 'flex-start',
            minWidth: 500,
          }}
        >
          <Box sx={{ p: 3, width: '100%' }}>
            {screen === EnumInvestorManagementScreen.create && (
              <CreateInvestor
                state={investorState}
                changeScreen={setScreen}
                onChange={setInvestorState}
                onSuccess={onSuccess}
                setError={setError}
                disabled={false}
              />
            )}
            {screen === EnumInvestorManagementScreen.edit && (
              <EditInvestor
                state={investorState}
                editState={editState}
                onChange={setInvestorState}
                changeScreen={setScreen}
                onSuccess={onSuccess}
                setError={setError}
                refetch={name => {
                  onSearch(name)
                  setScreen(EnumInvestorManagementScreen.management)
                }}
                hasPermission={hasPermission}
                isOverridesUser={isOverridesUser}
              />
            )}
            {screen === EnumInvestorManagementScreen.merge && (
              <MergeInvestor
                changeScreen={setScreen}
                onSuccess={investor => {
                  onSuccess(investor.investor_name)
                }}
                refetchAPI={refetchAPI}
                setError={setError}
                searchState={searchState}
                initialData={data?.searchInvestorByName.data}
              />
            )}
            {screen === EnumInvestorManagementScreen.unMerge && (
              <EditInvestor
                state={investorState}
                editState={editState}
                changeScreen={setScreen}
                onChange={setInvestorState}
                onSuccess={onSuccess}
                setError={setError}
                refetch={name => {
                  onSearch(name)
                  setScreen(EnumInvestorManagementScreen.management)
                }}
                hasPermission={hasPermission}
                isOverridesUser={isOverridesUser}
              />
            )}
            {screen === EnumInvestorManagementScreen.delete && (
              <DeleteInvestor
                investor={editState}
                onCancel={onBack}
                setError={setError}
                onSuccess={() => {
                  onSuccess(searchState)
                }}
              />
            )}
          </Box>
        </Modal>
      )}

      {message.title && message.content && (
        <ErrorModal
          title={message.title}
          message={message.content}
          onOK={() => {
            setMessage({ title: '', content: '' })
          }}
        />
      )}
    </>
  )
}
export default InvestorManagement
