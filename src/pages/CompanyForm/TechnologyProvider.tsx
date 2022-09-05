import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CompanyContext from './provider/CompanyContext'
import { TechnologyProps } from './TechnologyTotalPageForm'
import { useMutation, useQuery } from '@apollo/client'
import { APPEND_TECHNOLOGY_PROVIDER, GET_COMPANY_TECHNOLOGY_PROVIDER } from './graphql'
import useTechnologyCQ from '../../hooks/technology/technologyCQ'
import { ColumnNames, OverridesCompanyDataInput, scrollToElement } from './helpers'
import { Box, Label } from '@theme-ui/components'
import { ETLRunTimeContext } from '../../context'
import { Modal, Updating } from '../../components'
import strings from '../../strings'
import { Heading } from '../../components/primitives'
import TechnologyProviderEditForm, {
  TechnolodyProviderField,
  fields,
} from '../../components/TechnologyProvider/TechnologyProvider'
// import TechnologyProviderSearchForm from '../../components/TechnologyProviderSearch/TechnologyProviderSearch'
import { useParams } from 'react-router'

export type TechnologyProvider = {
  technology_provider_id: number
  name: string
  description: string
  fct_status_id: number
  self_declared: number
  company_technology_provider_id: string
  company_id: number
}

export type TechnologyProviderResponse = {
  getCompanyTechnologyProvider: TechnologyProvider[]
}

export type TechnologyProviderSearchItem = {
  technology_provider_id: number
  name: string
  description: string
}

export type SearchTechnologyProviderResponse = {
  technologyProviderSearch: TechnologyProviderSearchItem[]
}

let isFirstRun = true

const {
  error,
  pages: { addCompanyForm: copy },
} = strings

const TechnologyProviderForm = ({
  companyId,
  onCancel,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  info,
  setError,
  setIsLoading = (isLoading: boolean) => {},
}: TechnologyProps) => {
  const {
    handleUpdateStatus: _handleUpdateStatus,
    isOverridesUser,
    companySource,
  } = React.useContext(CompanyContext)

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { cr: rowId } = useParams<any>()

  const {
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
    PendingCRModal,
  } = useTechnologyCQ<TechnologyProvider>({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
    field: ColumnNames.TECHNOLOGY_PROVIDER_ID,
  })

  const [appendingState, setAppendingState] = useState<TechnologyProvider[]>([])

  const [open, setOpen] = useState<boolean>(false)
  const [openAddingDialog, setOpenAddingDialog] = useState<boolean>(false)

  const handleUpdateStatus = async (input: OverridesCompanyDataInput) => {
    const { tableName, columnName, id, reason } = input
    await _handleUpdateStatus(input)
    isOverridesUser &&
      handleApproveUpdateNewData({
        tableName,
        columnName,
        rowId: id,
        newValue: input.newValue as string,
        comment: reason,
      })
  }

  const { data, loading: querying, error: queryError, networkStatus, refetch } = useQuery<
    TechnologyProviderResponse
  >(GET_COMPANY_TECHNOLOGY_PROVIDER, {
    variables: {
      companyId: +companyId,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setEditState(data?.getCompanyTechnologyProvider || [])
      setOldState(data?.getCompanyTechnologyProvider || [])
      setIsLoading(false)
    },
    onError() {
      setIsLoading(false)
      setError(queryError as Error)
    },
  })

  useEffect(() => {
    if (!rowId) isFirstRun = false
    const id = (rowId?.split('_') || [])[1]
    const isCompanyProvider = rowId?.includes(`companyprovider_`)
    const isProvider = rowId?.includes(`provider_`)
    if (id && isFirstRun && (isCompanyProvider || isProvider)) {
      const certification = oldState.find(
        ({ technology_provider_id, company_technology_provider_id }) =>
          (isProvider && `${technology_provider_id}` === id) ||
          (isCompanyProvider && `${company_technology_provider_id}` === id)
      )

      if (certification) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(rowId || ''))
          isFirstRun = false
        }, 10)
      }
    }
  }, [oldState, rowId, companyId])

  const [addTechnologyProvider, { loading }] = useMutation(APPEND_TECHNOLOGY_PROVIDER, {
    onCompleted: () => {
      refetch()
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
  })

  const handleAddTechnologyProvider = async (appendingState: TechnologyProvider[]) => {
    if (!checkTimeETL()) return
    try {
      const input = {
        company_id: +companyId,
        technology_providers: appendingState.map(
          ({ name, description, technology_provider_id }) => ({
            name,
            description,
            ...(technology_provider_id > 0 && { technology_provider_id }),
          })
        ),
      }

      await addTechnologyProvider({ variables: { input } })
      setOpenAddingDialog(false)

      setAppendingState([])
    } catch (err) {
      console.log(err)
      setError(err as Error)
    }
  }
  const getError = useCallback((str: string) => {
    return str.replace('$value', 'This value')
  }, [])

  const getUniqueValue = useCallback(
    (t: TechnologyProvider) =>
      `${t.name?.trim()?.toLowerCase() || ''}${t.description?.trim()?.toLowerCase() || ''}`,
    []
  )

  const uniqueTechnologyProviderAppendId = useMemo(() => {
    const copyState = [...appendingState].reverse()
    if (copyState.length === 0) return new Map()
    const uniqueValueIds = new Map(
      copyState.map(t => {
        const uniqueValue = getUniqueValue(t)
        return [uniqueValue, t.technology_provider_id]
      })
    )
    return uniqueValueIds
  }, [appendingState, getUniqueValue])

  const validateTechnologyProvider = useCallback(
    (t: TechnologyProvider, field?: TechnolodyProviderField, append: boolean = false) => {
      if (field) {
        const fieldValue = t[field.field]
        if (field.required && !(typeof fieldValue === 'string' ? fieldValue.trim() : fieldValue)) {
          return getError(error.invalid)
        }
      }
      const uniqueValue = getUniqueValue(t)
      if (
        uniqueValue &&
        append &&
        uniqueTechnologyProviderAppendId.get(uniqueValue) !== t.technology_provider_id
      ) {
        return getError(error.duplicated)
      }
    },
    [uniqueTechnologyProviderAppendId, getError, getUniqueValue]
  )

  return (
    <>
      {querying || networkStatus === 4 ? (
        <Updating loading sx={{ p: 5 }} />
      ) : (
        <Box>
          {
            <>
              <TechnologyProviderEditForm
                open={open}
                setOpen={setOpen}
                setError={setError}
                overviewPendingRequest={overviewPendingRequest}
                refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                handleClickShowPendingCR={handleClickShowPendingCR}
                showPendingChangeRequest={showPendingChangeRequest}
                handleAppendDataCQAction={handleAppendDataCQAction}
                isOverridesUser={isOverridesUser}
                handleUpdateStatus={handleUpdateStatus}
                validate={validateTechnologyProvider}
                onChange={() => {}}
                onChangeEdit={(partial: TechnologyProvider[]) => {
                  setEditState([...partial])
                }}
                oldState={oldState}
                editState={editState}
                isEdit={true}
                companyId={companyId}
                showViewHistory={showViewHistory}
                refetchViewHistoryCols={refetchViewHistoryCols}
                buttonLabel={`Add Technology Provider+`}
                onAddField={() => {
                  if (!checkTimeETL()) return
                  setOpenAddingDialog(true)
                  setAppendingState([
                    {
                      name: '',
                      description: '',
                      technology_provider_id: -(appendingState.length + 1),
                    } as TechnologyProvider,
                  ])
                }}
                setOldState={(partial: TechnologyProvider[]) => {
                  setOldState([...partial])
                }}
              />
            </>
          }
        </Box>
      )}
      {!!openAddingDialog && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.buttons.cancel,
              type: 'secondary',
              action: () => {
                setAppendingState([])
                setOpenAddingDialog(false)
              },
              disabled: loading,
            },
            {
              label: copy.buttons.save,
              type: 'primary',
              action: async () => {
                await handleAddTechnologyProvider(appendingState)
              },
              disabled:
                loading ||
                !appendingState.length ||
                appendingState.some(
                  v =>
                    !!validateTechnologyProvider(v, undefined, true) ||
                    fields.some(f => !!validateTechnologyProvider(v, f, true))
                ),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add New Technology Provider`}
          </Heading>
          {/* <TechnologyProviderSearchForm
            editState={editState}
            open={open}
            setOpen={setOpen}
            selectedData={appendingState}
            setSelectedData={setAppendingState}
          /> */}
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5, mt: 5 }}>
            <Label
              sx={{
                flex: 1,
              }}
            >
              New Technology Provider {appendingState.length ? `(${appendingState.length})` : ''}
            </Label>
            <TechnologyProviderEditForm
              setError={setError}
              open={open}
              setOpen={setOpen}
              validate={(t, f) => validateTechnologyProvider(t, f, true)}
              isEdit={false}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              buttonLabel={`Add Technology Provider +`}
              state={appendingState}
              onAddField={() => {
                const cloneState = [...appendingState]
                cloneState.push({
                  name: '',
                  description: '',
                  technology_provider_id: -(cloneState.length + 1),
                } as TechnologyProvider)
                setAppendingState(cloneState)
              }}
              onChange={setAppendingState}
            />
          </Box>
        </Modal>
      )}
      <PendingCRModal />
    </>
  )
}

export default TechnologyProviderForm
