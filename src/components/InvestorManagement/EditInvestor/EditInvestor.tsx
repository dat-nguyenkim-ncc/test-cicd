import { ApolloError, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import React, { useRef, useState } from 'react'
import { Button, Checkbox, Dropdown, FormConfirm, Icon, TextField, Tooltip } from '../..'
import { ETLRunTimeContext } from '../../../context'
import {
  editInvestor,
  getPendingCRgql,
  GET_COMPANY_OVERRIDES_HISTORY,
  searchInvestorByName,
} from '../../../pages/CompanyForm/graphql'
import {
  ColumnNames,
  OverridesInvestorInput,
  TableNames,
  trimTheString,
} from '../../../pages/CompanyForm/helpers'
import { investor } from '../../../pages/CompanyForm/mock'
import { onError } from '../../../sentry'
import strings from '../../../strings'
import { ChangeFieldEvent } from '../../../types'
import { EnumCompanySource, EnumInvestorSource } from '../../../types/enums'
import { InvestorItemType, Investor } from '../../InvestorForm'
import { Paragraph } from '../../primitives'
import EditForm from '../EditForm'
import HeadingManagement from '../HeadingManagement'
import { EnumInvestorManagementScreen, ScreenType } from '../helpers'
import InvestorItem from '../InvestorItem'
import { INVESTOR_GRID_FOR_CORRESPONDING_DATA } from '../InvestorItem/InvestorItem'

type EditInvestorProps = {
  state: Investor
  editState: Investor
  changeScreen(state: ScreenType): void
  onChange(state: Investor): void
  onSuccess(): void
  setError(error: string): void
  refetch(text: string): void
  hasPermission: boolean
  isOverridesUser: boolean
  setError(error: string): void
}

type RequestItem = {
  name: string
  type: string
  associated_company_id?: number
  data: InvestorItemType[]
}

const EditInvestor = ({
  state,
  editState,
  changeScreen,
  onChange,
  onSuccess,
  setError,
  refetch,
  hasPermission,
  isOverridesUser,
}: EditInvestorProps) => {
  const {
    pages: {
      addCompanyForm: {
        investor: { management: copy },
      },
    },
  } = strings

  //Context
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [dataInvestor, setDataInvestor] = useState<Investor[]>([])
  const [unMergeState, setUnMergeState] = useState<RequestItem[]>([])
  const [confirmState, setConfirmState] = useState<RequestItem[]>([])
  const [temporaryState, setTemporaryState] = useState<InvestorItemType[]>([])
  const [isInUnMerge, setInUnMerge] = useState<boolean>(Boolean)
  const [pendingUpdateInvestor, setPendingUpdateInvestor] = useState<OverridesInvestorInput[]>([])

  // GRAPHQL
  const [getInvestor, { data: queryData, loading: queryLoading }] = useLazyQuery(
    searchInvestorByName,
    {
      onCompleted() {
        setDataInvestor(queryData.searchInvestorByName.data)
      },
      fetchPolicy: 'network-only',
    }
  )

  const { investor_id, source } = editState || {}

  const { data: investorNameOverrides, loading: nameOverrideLoading } = useQuery(
    GET_COMPANY_OVERRIDES_HISTORY,
    {
      variables: {
        input: {
          tableName: TableNames.INVESTOR,
          columnName: ColumnNames.INVESTOR_NAME,
          companyId: -1,
          rowId: investor_id,
          source,
        },
      },
      fetchPolicy: 'network-only',
    }
  )

  const { data: investorTypeOverrides, loading: typeOverrideLoading } = useQuery(
    GET_COMPANY_OVERRIDES_HISTORY,
    {
      variables: {
        input: {
          tableName: TableNames.INVESTOR,
          columnName: ColumnNames.INVESTOR_TYPE,
          companyId: -1,
          rowId: investor_id,
          source,
        },
      },
      fetchPolicy: 'network-only',
    }
  )

  const { data: investorNameCR, loading: nameCRLoading } = useQuery(getPendingCRgql, {
    variables: {
      input: {
        tableName: TableNames.INVESTOR,
        columnName: ColumnNames.INVESTOR_NAME,
        companyId: -1,
        rowId: investor_id,
        source,
      },
    },
    fetchPolicy: 'network-only',
  })

  const { data: investorTypeCR, loading: typeCRLoading } = useQuery(getPendingCRgql, {
    variables: {
      input: {
        tableName: TableNames.INVESTOR,
        columnName: ColumnNames.INVESTOR_TYPE,
        companyId: -1,
        rowId: investor_id,
        source,
      },
    },
    fetchPolicy: 'network-only',
  })

  const [updateInvestor, { loading: updateLoading }] = useMutation(editInvestor)

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    try {
      const override = pendingUpdateInvestor.reduce((acc, cur) => {
        if (
          trimTheString(cur.oldValue) === cur.oldValue
            ? trimTheString(cur.oldValue) !== trimTheString(cur.newValue)
            : cur.oldValue !== cur.newValue
        ) {
          acc.push({ ...cur, newValue: trimTheString(cur.newValue) })
        }
        return acc
      }, [] as OverridesInvestorInput[])

      if (!!override.length || !!unMergeState.length) {
        await updateInvestor({
          variables: {
            edit_record: {
              override,
              unmerge: unMergeState.map(({ name, data, type, associated_company_id }) => ({
                name,
                type,
                associated_company_id: associated_company_id ? +associated_company_id : undefined,
                data: data.map(({ external_investor_id, source }) => ({
                  external_investor_id,
                  source,
                })),
              })),
            },
          },
        })
      }
      onSuccess()
    } catch (error) {
      setError((error as ApolloError).message)
      onError(error)
    }
  }

  const isDuplicated = dataInvestor.some(
    (item: Investor) =>
      item.investor_name === state.investor_name && item.investor_id !== state.investor_id
  )

  const hasChildren = !!state.children?.length
  const hasChildrenPartsOfMergedCompany =
    !!state.children?.length &&
    !!state.children.find(({ merged_company_id }) => !!merged_company_id)
  const isUnMerge = hasChildren && state.children?.length !== unMergeState.length
  const childrenUnMergeAll =
    state.children?.filter(item => item.source !== EnumCompanySource.BCG) || []

  const renderHeader = () => (
    <Grid
      columns={INVESTOR_GRID_FOR_CORRESPONDING_DATA}
      sx={{
        alignItems: 'center',
      }}
    >
      <Paragraph bold>External investor name</Paragraph>
      <Paragraph bold>Source</Paragraph>
      <Paragraph bold>Company ID</Paragraph>
      <Paragraph bold>Duplicate company</Paragraph>
    </Grid>
  )

  const isUnmergeAll = useRef(false)

  const onClickUnmerge = () => {
    const companyIds = temporaryState.reduce(
      (res, item) => (!!item.merged_company_id ? [...res, item.merged_company_id] : res),
      [] as string[]
    )

    if (Array.from(new Set(companyIds)).length > 1) {
      setError(copy.message.multipleAssociatedCompanies)
      return
    }

    const companyId = companyIds[0]

    const externalInvestorIds = state.children?.reduce(
      (res, item) =>
        item.merged_company_id === companyId ? [...res, item.external_investor_id as string] : res,
      [] as string[]
    )

    const selectedExternalInvestorIds = temporaryState.map(
      ({ external_investor_id }) => external_investor_id
    )

    if (
      companyId &&
      externalInvestorIds?.some(item => !selectedExternalInvestorIds.includes(item))
    ) {
      setError(copy.message.needToRemoveAllSources)
      return
    }

    const onlyOneInvestorToRemove = temporaryState.length === 1

    if (onlyOneInvestorToRemove)
      selectedInvestor.current = temporaryState[0].external_investor_id as string

    isUnmergeAll.current = false

    setInUnMerge(true)
    setConfirmState([
      {
        data: temporaryState,
        name: onlyOneInvestorToRemove ? temporaryState[0].investor_name : '',
        type: '',
        associated_company_id: companyId ? +companyId : undefined,
      },
    ])
  }

  const onChangeField = (e: ChangeFieldEvent) => {
    const { name, value } = e.target
    setConfirmState([{ ...confirmState[0], [name]: value }])
  }

  const selectedInvestor = useRef('')

  const onCheck = (input: InvestorItemType) => {
    setConfirmState([{ ...confirmState[0], name: input.investor_name }])
    selectedInvestor.current = input.external_investor_id as string
  }

  const flatInvestorName = isUnmergeAll.current
    ? confirmState.map(({ name }) => name).join(', ')
    : confirmState[0]?.data.map(({ investor_name }) => investor_name).join(', ')

  const renderUnmergeAllConfirmation = () =>
    confirmState.map((item, index) => (
      <Grid key={index} sx={{ mt: 2, px: 3, alignItems: 'center' }} columns={['1fr 0.5fr 1.5fr']}>
        <Text sx={{ fontWeight: 'bold', fontSize: 14 }}>{item.data[0].investor_name || ''}</Text>
        <Text sx={{ fontWeight: 'bold', fontSize: 14 }}>
          {item.data[0].source
            ? EnumInvestorSource[item.data[0].source as keyof typeof EnumInvestorSource]
            : ''}
        </Text>
        <Dropdown
          name="type"
          placeholder="Type of investor"
          onChange={e => {
            let cloneState = [...confirmState]
            cloneState[index] = { ...cloneState[index], type: e.target.value }
            setConfirmState(cloneState)
          }}
          options={investor}
        />
      </Grid>
    ))

  const renderUnmergeConfirmation = () => (
    <>
      {confirmState[0].data.map((item, index) => (
        <Grid key={index} sx={{ mt: 2, px: 3, alignItems: 'center' }} columns={['1fr 0.5fr 0.5fr']}>
          <Text sx={{ fontWeight: 'bold', fontSize: 14 }}>{item.investor_name || ''}</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 14 }}>
            {item.source ? EnumInvestorSource[item.source as keyof typeof EnumInvestorSource] : ''}
          </Text>
          <Checkbox
            onPress={() => {
              onCheck(item)
            }}
            checked={selectedInvestor.current === item.external_investor_id}
          />
        </Grid>
      ))}
      <Box sx={{ px: 1, py: 24 }}>
        <TextField
          name="name"
          placeholder="Enter investor name"
          onChange={onChangeField}
          value={confirmState[0].name}
        />
        <Dropdown
          sx={{ mt: 4 }}
          name="type"
          placeholder="Type of investor"
          options={investor}
          value={confirmState[0].type}
          onChange={onChangeField}
        />
      </Box>
    </>
  )

  return !isInUnMerge ? (
    <>
      <HeadingManagement
        heading={hasChildren ? copy.titles.unMerge : copy.titles.edit}
        onPress={() => {
          !updateLoading && changeScreen(EnumInvestorManagementScreen.management)
        }}
        disabled={updateLoading}
      />

      <EditForm
        isOverridesUser={isOverridesUser}
        disabled={updateLoading}
        state={state}
        editState={editState}
        dataInvestor={dataInvestor}
        pendingUpdateInvestor={pendingUpdateInvestor}
        onChange={onChange}
        getInvestor={name => getInvestor({ variables: { name } })}
        setPendingUpdateInvestor={setPendingUpdateInvestor}
        overrides={{
          name: investorNameOverrides?.getCompanyOverrideHistory || [],
          type: investorTypeOverrides?.getCompanyOverrideHistory || [],
        }}
        pendingCR={{
          name: investorNameCR?.getCompanyPendingChangeRequest || [],
          type: investorTypeCR?.getCompanyPendingChangeRequest || [],
        }}
        refetch={refetch}
        loading={{
          name: nameOverrideLoading || nameCRLoading,
          type: typeOverrideLoading || typeCRLoading,
        }}
      />

      {isUnMerge && hasPermission && (
        <>
          <Box sx={{ px: 2, pt: 4 }}>
            {renderHeader()}
            <Box sx={{ mt: 2 }}>
              {state.children
                ?.filter(
                  investor =>
                    ![
                      ...unMergeState.reduce(
                        (res, item) => [...res, ...item.data],
                        [] as InvestorItemType[]
                      ),
                    ].some(item => item.external_investor_id === investor.external_investor_id)
                )
                .map(investor => {
                  const isDisabled =
                    !!investor.merged_company_id &&
                    investor.merged_company_id === state.associated_company_id

                  const selectedToRemove = !!temporaryState.find(
                    ({ external_investor_id }) =>
                      external_investor_id === investor.external_investor_id
                  )

                  return (
                    <Box
                      key={investor.external_investor_id}
                      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                    >
                      {hasChildrenPartsOfMergedCompany && (
                        <Box
                          sx={{
                            mr: 1,
                            visibility: isDisabled ? 'visible' : 'hidden',
                          }}
                        >
                          <Tooltip
                            content={copy.message.investorPartsOfMergedCompany}
                            isShow={true}
                          >
                            <Icon icon={'alert'} size="tiny" background="darkGray" color="white" />
                          </Tooltip>
                        </Box>
                      )}
                      <Box sx={{ flex: 1, opacity: isDisabled ? 0.5 : 1 }}>
                        <InvestorItem
                          disabled={updateLoading || isDisabled}
                          showSource
                          sx={{ px: 3, py: 4 }}
                          investor={investor}
                          onRemove={() => {
                            const cloneState = selectedToRemove
                              ? temporaryState.filter(
                                  ({ external_investor_id }) =>
                                    external_investor_id !== investor.external_investor_id
                                )
                              : [...temporaryState, investor]

                            setTemporaryState(cloneState)
                          }}
                          showCorrespondingCompanyDetail
                          selectedToRemove={selectedToRemove}
                        />
                      </Box>
                    </Box>
                  )
                })}
            </Box>
          </Box>
        </>
      )}
      <Flex sx={{ mt: 5, justifyContent: 'space-between' }}>
        <Box>
          {isUnMerge && hasPermission && (
            <Button
              disabled={
                updateLoading ||
                nameOverrideLoading ||
                typeOverrideLoading ||
                !childrenUnMergeAll.length ||
                hasChildrenPartsOfMergedCompany
              }
              sx={{ px: 2, color: 'orange' }}
              onPress={() => {
                if (!childrenUnMergeAll.length) {
                  return
                }

                setConfirmState(
                  childrenUnMergeAll.map(item => ({
                    data: [item],
                    name: item.investor_name,
                    type: '',
                    associated_company_id: undefined,
                  }))
                )
                setInUnMerge(true)
                isUnmergeAll.current = true
              }}
              label={copy.buttons.unMergeAll}
              icon="unMerge"
              variant="invert"
              color="gold"
              iconLeft
            />
          )}
        </Box>
        <Flex sx={{ gap: 2 }}>
          <Button
            disabled={!temporaryState.length}
            onPress={onClickUnmerge}
            label={copy.buttons.unMergeClick}
          ></Button>
          <Button
            label={hasChildren ? copy.buttons.saveMerge : copy.buttons.save}
            onPress={onSubmit}
            disabled={
              (!pendingUpdateInvestor.length && !unMergeState.length) ||
              !state.investor_name?.length ||
              !state.investor_type ||
              queryLoading ||
              isDuplicated ||
              updateLoading
            }
          />
        </Flex>
      </Flex>
    </>
  ) : (
    <FormConfirm
      textConfirm={copy.buttons.unMerge}
      color="gold"
      bgColor="bgGold"
      onConfirm={() => {
        setUnMergeState(isUnmergeAll.current ? confirmState : [...unMergeState, confirmState[0]])
        setInUnMerge(false)
        setConfirmState([])
        setTemporaryState([])
      }}
      onCancel={() => {
        setInUnMerge(false)
        selectedInvestor.current = ''
      }}
      disabled={
        confirmState.some(({ type }) => !type?.length) ||
        (!isUnmergeAll.current && !selectedInvestor.current)
      }
    >
      <>
        <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5, mb: 4 }}>
          {copy.message.unMerge.replace('$name?', '')}
          <span style={{ fontWeight: 'bold' }}>{` ${flatInvestorName}?`}</span>
        </Text>
        {isUnmergeAll.current ? renderUnmergeAllConfirmation() : renderUnmergeConfirmation()}
      </>
    </FormConfirm>
  )
}

export default EditInvestor
