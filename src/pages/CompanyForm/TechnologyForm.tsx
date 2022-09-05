import React, { useEffect, useState } from 'react'
import CompanyContext from './provider/CompanyContext'
import { TechnologyProps } from './TechnologyTotalPageForm'
import { useMutation, useQuery } from '@apollo/client'
import { APPEND_TECHNOLOGY, GET_COMPANY_TECHNOLOGY } from './graphql'
import useTechnologyCQ from '../../hooks/technology/technologyCQ'
import {
  CloudVendorOptions,
  ColumnNames,
  scrollToElement,
  TECHNOLOGY_TYPE,
  TECHNOLOGY_TYPE_ID,
} from './helpers'
import { Box, Label } from '@theme-ui/components'
import TechnologyForm from '../../components/Technology/TechnologyForm'
import { ValidateTechnology } from '../../utils/helper'
import { ETLRunTimeContext } from '../../context'
import { FieldTypes } from '../../components/TextField'
import { Modal, Updating } from '../../components'
import strings from '../../strings'
import { Heading } from '../../components/primitives'
import { useParams } from 'react-router'

export type Technology = {
  company_id: number
  technology_id: number
  technology_type_id: number
  technology_value: string
  fct_status_id: number
  self_declared: number
}

export type TechnologyResponse = {
  getCompanyTechnology: Technology[]
}

type TechnologyFormItem = {
  id: TECHNOLOGY_TYPE_ID
  text: TECHNOLOGY_TYPE
  type: FieldTypes
  state: (string | number)[]
  editState: Technology[]
  oldState: Technology[]
}

let isFirstRun = true

export const TechnologyTypes = [
  {
    id: TECHNOLOGY_TYPE_ID?.ENGINEERING,
    text: TECHNOLOGY_TYPE?.ENGINEERING,
    type: 'input' as FieldTypes,
    state: [],
  },
  {
    id: TECHNOLOGY_TYPE_ID?.CLOUD_VENDOR,
    text: TECHNOLOGY_TYPE?.CLOUD_VENDOR,
    type: 'input' as FieldTypes,
    state: [],
  },
]

const TechnologySubForm = ({
  companyId,
  onCancel,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  info,
  setError,
  setIsLoading = (isLoading: boolean) => {},
}: TechnologyProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { handleUpdateStatus, isOverridesUser, companySource } = React.useContext(CompanyContext)

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
    PendingCRModal,
  } = useTechnologyCQ<Technology>({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
    field: ColumnNames.TECHNOLOGY_ID,
  })

  const [appendingState, setAppendingState] = useState<string[]>([])
  const [appendingItem, setAppendingItem] = useState<TechnologyFormItem>()

  const { data, loading: querying, error: queryError, networkStatus, refetch } = useQuery<
    TechnologyResponse
  >(GET_COMPANY_TECHNOLOGY, {
    variables: {
      companyId: +companyId,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setEditState(data?.getCompanyTechnology || [])
      setOldState(data?.getCompanyTechnology || [])
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
    if (id && isFirstRun && rowId?.includes(`technology_`)) {
      const useCase = oldState.find(({ technology_id }) => `${technology_id}` === id)

      if (useCase) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(`technology_${useCase?.technology_id}` || ''))
          isFirstRun = false
        }, 10)
      }
    }
  }, [oldState, rowId, companyId])

  const [addTechnology, { loading, error }] = useMutation(APPEND_TECHNOLOGY, {
    onCompleted: () => {
      refetch()
      refetchViewHistoryCols()
      refetchViewPendingChangeRequestCols()
    },
    onError() {
      setError(error as Error)
    },
  })

  const handleAddTechnology = async (
    appendingState: string[],
    appendingItem: TechnologyFormItem
  ) => {
    if (!checkTimeETL()) return
    try {
      const input = {
        company_id: +companyId,
        technologies: [
          {
            technology_type_id: appendingItem.id,
            values: appendingState.map(v => v.toString().trim()),
          },
        ],
      }

      await addTechnology({ variables: { input } })

      setAppendingState([])
      setAppendingItem(undefined)
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <>
      {querying || networkStatus === 4 ? (
        <Updating loading sx={{ p: 5 }} />
      ) : (
        TechnologyTypes.map((_f, index) => {
          const f = {
            ..._f,
            editState: editState.filter(i => i.technology_type_id === _f.id),
            oldState: oldState.filter(i => i.technology_type_id === _f.id),
          }
          return (
            <Box key={index}>
              {
                <>
                  <Label id={f.text} sx={{ flex: 1 }}>
                    {f.text}
                  </Label>
                  <TechnologyForm
                    {...f}
                    dataType={f.id}
                    overviewPendingRequest={overviewPendingRequest}
                    refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                    handleClickShowPendingCR={handleClickShowPendingCR}
                    showPendingChangeRequest={showPendingChangeRequest}
                    handleAppendDataCQAction={handleAppendDataCQAction}
                    isOverridesUser={isOverridesUser}
                    handleUpdateStatus={handleUpdateStatus}
                    validate={ValidateTechnology(f.state)}
                    onChange={() => {}}
                    onChangeEdit={(partial: Technology[]) => {
                      setEditState([
                        ...editState.filter(i => i.technology_type_id !== f.id),
                        ...partial,
                      ])
                    }}
                    oldState={f.oldState}
                    editState={f.editState}
                    isEdit={true}
                    companyId={companyId}
                    showViewHistory={showViewHistory}
                    refetchViewHistoryCols={refetchViewHistoryCols}
                    buttonLabel={`Add ${f.text} +`}
                    onAddField={() => {
                      if (!checkTimeETL()) return
                      setAppendingState([''])
                      setAppendingItem(f)
                    }}
                    setOldState={(v: Technology[]) => {
                      setOldState([
                        ...oldState.filter(({ technology_type_id }) => technology_type_id !== f.id),
                        ...(v || []),
                      ])
                    }}
                    options={CloudVendorOptions}
                    setError={setError}
                  />
                </>
              }
            </Box>
          )
        })
      )}
      {!!appendingState.length && appendingItem && (
        <Modal
          sx={{ maxHeight: '90vh', width: '60vw', maxWidth: '60vw', padding: 0 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%', p: 4 }}
          buttons={[
            {
              label: copy.buttons.cancel,
              type: 'secondary',
              action: () => {
                setAppendingState([])
                setAppendingItem(undefined)
              },
              disabled: loading,
            },
            {
              label: copy.buttons.save,
              type: 'primary',
              action: async () => {
                await handleAddTechnology(appendingState, appendingItem)
              },
              disabled:
                loading ||
                appendingState.some(
                  v => ValidateTechnology(appendingState)(v, appendingItem.id) === 'error'
                ),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add New ${appendingItem.text}`}
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
            <Label
              id={appendingItem.text}
              sx={{
                flex: 1,
              }}
            >
              New {appendingItem.text}
            </Label>
            <TechnologyForm
              isEdit={false}
              dataType={appendingItem.id}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              buttonLabel={`Add ${appendingItem.text} +`}
              state={appendingState}
              editState={appendingItem.editState}
              type={appendingItem.type}
              onAddField={() => {
                const cloneState = [...appendingState]
                cloneState.push('')
                setAppendingState(cloneState)
              }}
              onChange={setAppendingState}
              validate={ValidateTechnology(appendingState)}
              options={CloudVendorOptions}
              setError={setError}
            />
          </Box>
        </Modal>
      )}
      <PendingCRModal />
    </>
  )
}

export default TechnologySubForm
