import React, { FormEvent, useState, useMemo, useCallback } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { searchInvestorByName } from '../../../pages/CompanyForm/graphql'
import HeadingManagement from '../HeadingManagement'
import { EnumInvestorManagementScreen, ScreenType } from '../helpers'
import strings from '../../../strings'
import { Search, Popover, InvestorListSearch, Updating, Button, Modal, Icon } from '../..'
import { Investor } from '../../InvestorForm'
import { reasonPopverZIndex } from '../../../utils/consts'
import { Box, Flex, Grid } from '@theme-ui/components'
import { Heading, Paragraph } from '../../primitives'
import { Palette } from '../../../theme'
import InvestorItem, { INVESTOR_GRIDS } from '../InvestorItem'
import { MERGE_INVESTOR } from '../graphql'
import { onError } from '../../../sentry'
import EditForm from '../EditForm'
import { OverridesInvestorInput } from '../../../pages/CompanyForm/helpers'
import { ETLRunTimeContext } from '../../../context'
import { PendingChangeRequestModal } from '../../../pages/CompanyForm/pendingCRModal'
import { ChangeRequestResultType } from '../../../pages/ChangeRequestManagement/ChangeRequestManagement'
import useInvestorCR from '../../InvestorListSearch/useInvestorCR'
import { EnumExpandStatusId } from '../../../types/enums'

const {
  pages: {
    addCompanyForm: {
      investor: { management: copy },
    },
  },
} = strings

type MergeInvestorProps = {
  changeScreen(state: ScreenType): void
  onSuccess(investor: Investor): void
  setError(error: string): void
  searchState: string
  initialData: any
  refetchAPI?: () => void
}

const MergeInvestor = ({
  changeScreen,
  onSuccess,
  setError,
  searchState: searchTerm,
  initialData,
  refetchAPI,
}: MergeInvestorProps) => {
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [searchState, setSearchState] = useState<string>(searchTerm)
  const [open, setOpen] = useState<boolean>(
    searchTerm && searchTerm.length >= 2 && initialData?.length ? true : false
  )
  const [selected, setSelected] = useState<Investor[]>([])
  const [defaultInvestor, setDefaultInvestor] = useState<Investor>({
    investor_name: '',
    investor_type: '',
  } as Investor)
  const [editState, setEditState] = useState<Investor>({
    investor_name: '',
    investor_type: '',
  } as Investor)
  const [dataInvestor, setDataInvestor] = useState<Investor[]>([])
  const [pendingUpdateInvestor, setPendingUpdateInvestor] = useState<OverridesInvestorInput[]>([])
  const [openData, setOpenData] = useState(initialData)
  const [warning, setWarning] = useState<string | undefined>('')

  // GRAPHQL
  const [searchInvestor, { data, loading }] = useLazyQuery(searchInvestorByName, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })
  const [getInvestor, { data: queryData, loading: queryLoading }] = useLazyQuery(
    searchInvestorByName,
    {
      fetchPolicy: 'network-only',
      onCompleted() {
        setDataInvestor(
          queryData.searchInvestorByName.data.filter(
            ({ investor_name }: Investor) =>
              !selected.some(ins => ins.investor_name === investor_name)
          )
        )
      },
    }
  )
  const [mergeInvestor, { loading: merging }] = useMutation(MERGE_INVESTOR, {
    onCompleted: () => {
      refetchAPI && refetchAPI()
    },
  })

  const onSearch = (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    if (!searchState || searchState.length < 2) return
    searchInvestor({ variables: { name: searchState } })
    setOpenData([])
  }

  const onSubmitMerge = async () => {
    if (!checkTimeETL()) return
    try {
      await mergeInvestor({
        variables: {
          input: {
            parent: defaultInvestor.investor_id,
            children: selected
              .map(({ investor_id }) => investor_id)
              .filter(id => id !== defaultInvestor.investor_id),
            edit_record: pendingUpdateInvestor,
          },
        },
      })
      onSuccess(defaultInvestor)
    } catch (error) {
      setError(error.message)
      onError(error)
    }
  }

  const allData = useMemo(() => [...(openData || []), ...(data?.searchInvestorByName.data || [])], [
    openData,
    data,
  ])

  // Handle investor change request
  const [pendingCRModal, setPendingCRModal] = React.useState<boolean>(false)

  const {
    dataCR,
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
      setOpen(false)
      try {
        setLoading(true)
        const changRequest =
          data?.searchInvestorByName.pendingCR?.find((cr: ChangeRequestResultType) =>
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
    [setOpen, setLoading, setPendingCRModal, setApprovedCR, setRejectCR, data]
  )

  const onChangeSelect = useCallback(
    (state: Investor[]) => {
      const associatedCompanyIds = new Set(
        state
          .filter(
            ({ associated_company_id, company_status_id }) =>
              !!associated_company_id && company_status_id === +EnumExpandStatusId.FOLLOWING
          )
          .map(
            ({ associated_company_id, company_status_id }) =>
              `${associated_company_id}_${company_status_id}`
          )
      )
      const isHasMoreAssociatedCompany = associatedCompanyIds.size > 1
      if (isHasMoreAssociatedCompany) {
        setError(copy.message.differentAssociatedCompany)
        return
      }
      setSelected(state)
    },
    [setSelected, setError]
  )

  const memoListSearch = useMemo(
    () => (
      <InvestorListSearch
        sx={{
          maxHeight: '35vh',
          overflow: 'auto',
          mt: 2,
        }}
        investors={allData}
        showCheck
        selected={selected}
        setSelected={onChangeSelect}
        pendingCR={data?.searchInvestorByName.pendingCR}
        onHandleChangeRequest={onHandleChangeRequest}
      />
    ),
    [allData, selected, data, onHandleChangeRequest, onChangeSelect]
  )

  return (
    <>
      <HeadingManagement
        heading={copy.titles.merge}
        onPress={() => {
          !merging && changeScreen(EnumInvestorManagementScreen.management)
        }}
        disabled={merging}
      />
      <Popover
        open={open}
        setOpen={setOpen}
        positions={['bottom']}
        noArrow
        content={
          <Box
            sx={{
              mt: 2,
              bg: 'white',
              border: `solid 1px ${Palette.gray01}`,
              borderRadius: 12,
              width: `${
                window.document.getElementById('searchForm')?.getBoundingClientRect().width || 428
              }px`,
            }}
          >
            {loading ? (
              <Updating sx={{ py: 6 }} loading />
            ) : !allData.length ? (
              <Paragraph sx={{ textAlign: 'center', py: 6 }}>{copy.message.noData}</Paragraph>
            ) : (
              memoListSearch
            )}
          </Box>
        }
        zIndex={reasonPopverZIndex}
      >
        <form
          id="searchForm"
          onClick={() => {
            setOpen(true)
          }}
          onSubmit={onSearch}
        >
          <Search
            onSearch={onSearch}
            onChange={(value = '') => setSearchState(value)}
            sx={{ py: 3, px: 4, bg: 'gray03' }}
            size="tiny"
            value={searchState}
            placeholder={copy.placeholder.search}
          />
        </form>
      </Popover>
      {!!selected.length && (
        <Box sx={{ px: 2, mt: 4, overflowY: 'auto', maxHeight: 500 }}>
          <Grid
            columns={INVESTOR_GRIDS}
            sx={{
              alignItems: 'center',
            }}
          >
            <Paragraph bold>Investor name</Paragraph>
            <Paragraph bold>Type</Paragraph>
          </Grid>
          <Box sx={{ mt: 2 }}>
            {selected.map((investor: Investor, index: number) => {
              const isChecked =
                defaultInvestor.external_investor_id === investor.external_investor_id
              return (
                <InvestorItem
                  key={index}
                  disabled={merging}
                  sx={{ px: 3, py: 4 }}
                  investor={investor}
                  onRemove={() => {
                    setSelected([
                      ...selected.filter(({ investor_id }) => investor.investor_id !== investor_id),
                    ])
                    if (isChecked) {
                      setDefaultInvestor({} as Investor)
                      setEditState({} as Investor)
                    }
                  }}
                  onCheck={() => {
                    setDefaultInvestor(investor)
                    setEditState(investor)
                  }}
                  checked={isChecked}
                />
              )
            })}
          </Box>
        </Box>
      )}

      {selected.length > 1 && (
        <EditForm
          disabled={merging}
          state={defaultInvestor}
          editState={editState}
          dataInvestor={dataInvestor}
          pendingUpdateInvestor={pendingUpdateInvestor}
          onChange={setDefaultInvestor}
          getInvestor={name => getInvestor({ variables: { name } })}
          setPendingUpdateInvestor={setPendingUpdateInvestor}
        />
      )}
      <Flex sx={{ mt: 5, justifyContent: 'flex-end' }}>
        <Button
          onPress={() => {
            if (!checkTimeETL()) return
            const duplicated = selected.filter(
              ({ company_status_id }) =>
                company_status_id && company_status_id === +EnumExpandStatusId.DUPLICATED
            )
            if (!!duplicated.length) {
              setWarning(
                `Some investors are mapped to different duplicate companies: "<strong>${duplicated
                  .map(({ company_name }) => company_name)
                  .join(', ')}</strong>". Do you want to continue?`
              )
              return
            } else {
              onSubmitMerge()
            }
          }}
          label={copy.buttons.mergeInvestors}
          disabled={!defaultInvestor.investor_id || queryLoading || selected.length < 2 || merging}
        />
      </Flex>

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
              searchInvestor({ variables: { name: searchState } })
            }
          }}
          handleApproveUpdateNewData={() => {}}
          handleActionPendingCR={handleActionPendingCR}
          approvedCR={approvedCR}
          rejectCR={rejectCR}
        />
      )}
      {!!warning && (
        <Modal
          sx={{ p: 6 }}
          buttons={[
            {
              label: copy.buttons.cancel,
              action: () => {
                setWarning('')
              },
              type: 'secondary',
            },
            {
              label: copy.buttons.ok,
              action: () => {
                onSubmitMerge()
                setWarning('')
              },
              type: 'primary',
            },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'center', px: 6 }}
        >
          <Box sx={{ px: 4, py: 3, width: '100%' }}>
            <Flex sx={{ width: '100%', justifyContent: 'center' }}>
              <Icon icon="alert" size="small" background="red" color="white" />
              <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                Warning
              </Heading>
            </Flex>
            <Paragraph sx={{ mt: 3, textAlign: 'center', lineHeight: 1.5 }}>{warning}</Paragraph>
          </Box>
        </Modal>
      )}
    </>
  )
}
export default MergeInvestor
