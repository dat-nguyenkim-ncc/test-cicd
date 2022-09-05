import { Box, Flex } from '@theme-ui/components'
import React, { FormEvent, useCallback, useState } from 'react'
import { useMemo } from 'react'
import { Button, InvestorListSearch, Search, Updating } from '../..'
import { ChangeRequestResultType } from '../../../pages/ChangeRequestManagement/ChangeRequestManagement'
import { PendingChangeRequestModal } from '../../../pages/CompanyForm/pendingCRModal'
import { onError } from '../../../sentry'
import strings from '../../../strings'
import { Investor } from '../../InvestorForm'
import useInvestorCR from '../../InvestorListSearch/useInvestorCR'
import { IPengdingCQData } from '../../PendingChangeRequest/PendingChangeRequest'
import { Heading, Paragraph } from '../../primitives'
import { ScreenType, EnumInvestorManagementScreen } from '../helpers'

type ManagementProps = {
  loading: boolean
  searchState: string
  pendingCR: ChangeRequestResultType[]
  data?: Investor[]
  isPage?: boolean
  hasPermission?: boolean
  searchInvestor(): void
  setSearchState(state: string): void
  onEdit(state: Investor): void
  onDelete(state: Investor): void
  changeScreen(state: ScreenType): void
}

const {
  pages: {
    addCompanyForm: {
      investor: { management: copy },
    },
  },
} = strings

const Management = ({
  loading,
  searchState,
  data,
  pendingCR,
  isPage = false,
  hasPermission = false,
  searchInvestor,
  setSearchState,
  onEdit,
  onDelete,
  changeScreen,
}: ManagementProps) => {
  const [selected, setSelected] = useState<Investor[]>([])

  const onSearch = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      if (event) event.preventDefault()
      if (!searchState || searchState.length < 2) return
      searchInvestor()
    },
    [searchState, searchInvestor]
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
  } = useInvestorCR({ refetch: searchInvestor })

  const onHandleChangeRequest = React.useCallback(
    async (approved: boolean, id?: string) => {
      if (!id) return
      try {
        setLoading(true)
        const changRequest =
          pendingCR?.find((cr: ChangeRequestResultType) =>
            cr.dataOverride.some(({ rowId }) => rowId === id)
          )?.dataOverride || []
        if (approved) {
          setApprovedCR(changRequest[0])
        } else {
          setRejectCR(changRequest)
        }
      } catch (error) {
        onError(error)
      } finally {
        setPendingCRModal(true)
        setLoading(false)
      }
    },
    [setLoading, setPendingCRModal, setApprovedCR, setRejectCR, pendingCR]
  )

  const memoListSearch = useMemo(
    () => (
      <InvestorListSearch
        sx={{ maxHeight: isPage ? 'auto' : '60vh', overflow: 'auto', mt: 2 }}
        investors={data || []}
        pendingCR={pendingCR}
        isEdit
        selected={selected}
        setSelected={setSelected}
        onEdit={onEdit}
        onDelete={onDelete}
        hasPermission={hasPermission}
        refetch={searchInvestor}
        onHandleChangeRequest={onHandleChangeRequest}
        onHandleReject={(cr: IPengdingCQData[]) => {
          setDataCR(cr)
          setPendingCRModal(true)
        }}
      />
    ),
    [
      selected,
      data,
      pendingCR,
      isPage,
      hasPermission,
      setSelected,
      onEdit,
      onDelete,
      searchInvestor,
      onHandleChangeRequest,
      setDataCR,
    ]
  )

  const searchBox = useMemo(() => {
    return (
      <form style={{ flex: 0.5 }} onSubmit={onSearch}>
        <Search
          onSearch={onSearch}
          onChange={setSearchState}
          sx={{ py: 3, px: 4, bg: 'gray03' }}
          size="tiny"
          value={searchState}
          placeholder={copy.placeholder.search}
          bindValue
        />
      </form>
    )
  }, [searchState, onSearch, setSearchState])

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 2 }}>
        {isPage ? (
          searchBox
        ) : (
          <Heading sx={{ fontWeight: 600 }} as={'h4'}>
            {copy.titles.management}
          </Heading>
        )}
        <Flex>
          {hasPermission && (
            <Button
              sx={{ p: 0, color: 'primary' }}
              onPress={() => changeScreen(EnumInvestorManagementScreen.merge)}
              label={copy.buttons.merge}
              variant="invert"
              icon="merge"
              iconLeft
              color="primary"
            />
          )}
          <Button
            sx={{ p: 0, ml: 4, color: 'primary' }}
            onPress={() => changeScreen(EnumInvestorManagementScreen.create)}
            label={copy.buttons.createNew}
            variant="invert"
            icon="plus"
            iconLeft
            color="primary"
          />
        </Flex>
      </Flex>
      <Box sx={{ flex: 1, width: '100%' }}>
        {!isPage && searchBox}
        {loading ? (
          <Updating sx={{ pb: 6 }} loading />
        ) : !data?.length ? (
          <Paragraph sx={{ textAlign: 'center', pt: 6, pb: 5 }}>
            {!!searchState ? copy.message.noData : ''}
          </Paragraph>
        ) : (
          <>
            <Paragraph sx={{ px: 20, pt: 20, color: 'gray04' }} bold>
              Recent search
            </Paragraph>
            {memoListSearch}
          </>
        )}
      </Box>

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
              searchInvestor()
            }
          }}
          handleApproveUpdateNewData={() => {}}
          handleActionPendingCR={handleActionPendingCR}
          approvedCR={approvedCR}
          rejectCR={rejectCR}
        />
      )}
    </>
  )
}

export default Management
