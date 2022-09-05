import React, { useEffect, useState } from 'react'
import { Heading } from '../../components/primitives'
import strings from '../../strings'
import { FooterCTAs, Modal } from '../../components'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  addProfile,
  ADD_FINANCIAL_SERVICES_LICENSES,
  getProfile,
  getProfileType,
  GET_FINANCIAL_SERVICES_LICENSES,
} from './graphql'
import ProfileForm, { ProfileEditType, ProfileGroupForm } from '../../components/ProfileForm'
import { Box, Label } from 'theme-ui'
import { ViewHistoryProps } from './CompanyForm'
import {
  ProfileName,
  ProfileFormItem,
  OverridesCompanyDataInput,
  ProfileType,
  scrollToElement,
} from './helpers'
import { validateProfileField } from '../../utils'
import { Routes } from '../../types/enums'
import { useHistory, useParams } from 'react-router-dom'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import CompanyContext from './provider/CompanyContext'
import useProfileCQ from '../../hooks/profile/useProfileCQ'
import useFinanceServiceLicenseCQ from '../../hooks/profile/financialServicesLicensesCQ'
import { ETLRunTimeContext } from '../../context'
import FinanceServiceLicenseGroupForm, {
  FinanceServiceLicense,
  FinanceServiceLicenseType,
} from '../../components/ProfileForm/FinanceServicesLicenses'

export const textareaIds = [2, 3, 4, 5, 6, 9, 11, 17, 23, 32, 33, 34]

let isFirstRun = true
type BusinessProps = {
  companyId: number
  onCancel(): void
  setError(err: Error): void
} & ViewHistoryProps

const BusinessForm = ({
  companyId,
  showViewHistory,
  refetchViewHistoryCols = async () => {},

  setError,
}: BusinessProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const history = useHistory()
  const { cr: rowId } = useParams<any>()

  const [appendingState, setAppendingState] = useState<string[]>([])
  const [appendingItem, setAppendingItem] = useState<ProfileFormItem>()

  // GRAPHQL
  const { data: profileType, loading: getProfileLoading } = useQuery<{
    getProfileType: Array<ProfileType>
  }>(getProfileType, {
    fetchPolicy: 'network-only',
  })
  const [doGetProfile, { loading: profileLoading }] = useLazyQuery(getProfile, {
    fetchPolicy: 'network-only',
    variables: {
      id: +companyId,
    },
    onCompleted(data) {
      setEditState(data.getProfile || [])
      setOldState(data.getProfile || [])
    },
  })

  const [doGetFinancialServiceLicenses, { loading: licenseLoading }] = useLazyQuery(
    GET_FINANCIAL_SERVICES_LICENSES,
    {
      fetchPolicy: 'network-only',
      variables: {
        companyId: +companyId,
      },
      onCompleted(data) {
        setEditStateFinance(data.getCompanyFinancialServicesLicenses || [])
        setOldStateFinance(data.getCompanyFinancialServicesLicenses || [])
      },
    }
  )

  const [addBusinessProfile, { loading }] = useMutation(addProfile, {
    onCompleted: () => {
      refetchData()
    },
  })

  const [handleAddFinanceLicenses, { loading: appendingFinanceLicense }] = useMutation(
    ADD_FINANCIAL_SERVICES_LICENSES,
    {
      onCompleted: () => {
        refetchData()
      },
    }
  )

  const {
    companySource,
    isOverridesUser,
    handleUpdateStatus: _handleUpdateStatus,
  } = React.useContext(CompanyContext)
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const refetchData = () => {
    doGetProfile()
    doGetFinancialServiceLicenses()
    refetchViewHistoryCols()
    refetchViewPendingChangeRequestCols()
  }

  const handleUpdateStatus = async (input: OverridesCompanyDataInput) => {
    const { tableName, columnName, id, reason } = input
    await _handleUpdateStatus(input)
    if (isOverridesUser) {
      handleApproveUpdateNewData({
        tableName,
        columnName,
        rowId: id,
        newValue: input.newValue as string,
        comment: reason,
      })
    }
  }

  const handleUpdateFinanceLicenseStatus = async (input: OverridesCompanyDataInput) => {
    const { tableName, columnName, id, reason } = input
    await _handleUpdateStatus(input)
    if (isOverridesUser) {
      handleApproveUpdateNewDataFinance({
        tableName,
        columnName,
        rowId: id,
        newValue: input.newValue as string,
        comment: reason,
      })
    }
  }

  const {
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
  } = useProfileCQ({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
  })

  const {
    PendingCRModal: PendingCRFinance,
    overviewPendingRequest: overviewPendingRequestFinance,
    refetchViewPendingChangeRequestCols: refetchViewPendingChangeRequestColsFinance,
    handleClickShowPendingCR: handleClickShowPendingCRFinance,
    showPendingChangeRequest: showPendingChangeRequestFinance,
    handleAppendDataCQAction: handleAppendDataCQActionFinance,
    editState: editStateFinance,
    setEditState: setEditStateFinance,
    oldState: oldStateFinance,
    setOldState: setOldStateFinance,
    handleApproveUpdateNewData: handleApproveUpdateNewDataFinance,
  } = useFinanceServiceLicenseCQ({
    refetchViewHistoryCols,
    defaultSource: companySource,
    companyId: +companyId,
  })

  const getType = (name: ProfileName) => {
    const type = profileType?.getProfileType?.find(e => e.profile_type_name === name)
    if (type) {
      return type?.profile_type_id
    }
  }

  const handleAddProfiles = async (
    profiles: { profile_type_id: string; new_value: string[] }[]
  ) => {
    if (!checkTimeETL()) return
    try {
      const input = {
        companyId: +companyId,
        profiles,
      }
      if (input.profiles.some(({ new_value }) => new_value.length > 0)) {
        await addBusinessProfile({ variables: { input } })
      }
      setAppendingState([])
      setAppendingItem(undefined)
    } catch (err) {
      setError(err as Error)
    }
  }

  const handleAddFinanceServicesLicenses = async (data: FinanceServiceLicense[]) => {
    if (!checkTimeETL()) return
    try {
      const input = {
        company_id: +companyId,
        financial_licenses: data.map(({ license_jurisdiction, license_type }) => ({
          license_jurisdiction,
          license_type,
        })),
      }

      await handleAddFinanceLicenses({ variables: { input } })
    } catch (err) {
      setError(err as Error)
    }
  }

  // Effects
  useEffect(() => {
    // run once
    doGetProfile()
    doGetFinancialServiceLicenses()
  }, [doGetProfile, doGetFinancialServiceLicenses])

  useEffect(() => {
    if (rowId && isFirstRun) {
      const profile = oldState.find(e => e.profile_id === rowId)
      if (profile?.profile_id) {
        setTimeout(() => {
          // wait UI finish render to get element by id
          scrollToElement(document.getElementById(`profile-${profile.profile_id}`))
          isFirstRun = false
        }, 0)
      }
    }
  }, [oldState, rowId, companyId])

  return (
    <>
      <CompanyFormsSectionLayout
        title={copy.titles.business}
        isLoading={getProfileLoading || profileLoading || licenseLoading}
      >
        {profileType
          ? profileType.getProfileType.map(
              ({ profile_type_id, profile_type_name, group }, index) => {
                const f: ProfileFormItem = {
                  id: profile_type_id,
                  label: profile_type_name,
                  state: [],
                  editState: editState.filter(
                    i =>
                      i.profile_type_id === profile_type_id ||
                      group?.some(({ profile_type_id }) => i.profile_type_id === profile_type_id)
                  ),
                  oldState: oldState.filter(
                    i =>
                      i.profile_type_id === profile_type_id ||
                      group?.some(({ profile_type_id }) => i.profile_type_id === profile_type_id)
                  ),
                  type: textareaIds.includes(+profile_type_id) ? 'textarea' : 'input',
                }

                const profileTypeIds = (group || []).map(({ profile_type_id }) => profile_type_id)

                const financeServiceLicenseType =
                  // @ts-ignore
                  profileTypeIds.includes('0') && profileTypeIds.includes(null)
                return (
                  <Box key={index}>
                    {group ? (
                      <>
                        {financeServiceLicenseType ? (
                          <FinanceServiceLicenseGroupForm
                            label={profile_type_name}
                            group={
                              group.map(item => ({
                                ...item,
                                field:
                                  item.profile_type_id === '0'
                                    ? 'license_jurisdiction'
                                    : 'license_type',
                              })) as FinanceServiceLicenseType[]
                            }
                            editState={editStateFinance || []}
                            setEditState={(partial: FinanceServiceLicense[]) => {
                              setEditStateFinance([...partial])
                            }}
                            oldState={oldStateFinance}
                            loading={appendingFinanceLicense}
                            setError={setError}
                            handleAddProfiles={handleAddFinanceServicesLicenses}
                            companyId={companyId}
                            overviewPendingRequest={overviewPendingRequestFinance}
                            refetchViewPendingChangeRequestCols={
                              refetchViewPendingChangeRequestColsFinance
                            }
                            handleClickShowPendingCR={handleClickShowPendingCRFinance}
                            showPendingChangeRequest={showPendingChangeRequestFinance}
                            handleAppendDataCQAction={handleAppendDataCQActionFinance}
                            isOverridesUser={isOverridesUser}
                            handleUpdateStatus={handleUpdateFinanceLicenseStatus}
                            showViewHistory={showViewHistory}
                            refetchViewHistoryCols={refetchViewHistoryCols}
                            refetchData={refetchData}
                          />
                        ) : (
                          <ProfileGroupForm
                            label={profile_type_name}
                            group={group}
                            editState={f.editState || []}
                            setEditState={(partial: ProfileEditType[]) => {
                              setEditState([
                                ...editState.filter(
                                  i =>
                                    !(
                                      i.profile_type_id === profile_type_id ||
                                      group?.some(
                                        ({ profile_type_id }) =>
                                          i.profile_type_id === profile_type_id
                                      )
                                    )
                                ),
                                ...partial,
                              ])
                            }}
                            oldState={f.oldState}
                            loading={loading}
                            setError={setError}
                            handleAddProfiles={handleAddProfiles}
                            companyId={companyId}
                            overviewPendingRequest={overviewPendingRequest}
                            refetchViewPendingChangeRequestCols={
                              refetchViewPendingChangeRequestCols
                            }
                            handleClickShowPendingCR={handleClickShowPendingCR}
                            showPendingChangeRequest={showPendingChangeRequest}
                            handleAppendDataCQAction={handleAppendDataCQAction}
                            isOverridesUser={isOverridesUser}
                            handleUpdateStatus={handleUpdateStatus}
                            showViewHistory={showViewHistory}
                            refetchViewHistoryCols={refetchViewHistoryCols}
                            refetchData={refetchData}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <Label sx={{ flex: 1 }}>{profile_type_name}</Label>
                        <ProfileForm
                          {...f}
                          overviewPendingRequest={overviewPendingRequest}
                          refetchViewPendingChangeRequestCols={refetchViewPendingChangeRequestCols}
                          handleClickShowPendingCR={handleClickShowPendingCR}
                          showPendingChangeRequest={showPendingChangeRequest}
                          handleAppendDataCQAction={handleAppendDataCQAction}
                          isOverridesUser={isOverridesUser}
                          handleUpdateStatus={handleUpdateStatus}
                          validate={validateProfileField(f.state, f.editState || [])}
                          onChange={() => {}}
                          onChangeEdit={(partial: ProfileEditType[]) => {
                            setEditState([
                              ...editState.filter(i => i.profile_type_name !== f.label),
                              ...partial,
                            ])
                          }}
                          oldState={f.oldState}
                          editState={f.editState}
                          isEdit={true}
                          companyId={companyId}
                          showViewHistory={showViewHistory}
                          refetchViewHistoryCols={refetchViewHistoryCols}
                          buttonLabel={`Add ${f.label} +`}
                          onAddField={() => {
                            if (!checkTimeETL()) return
                            setAppendingState([''])
                            setAppendingItem(f)
                          }}
                          setOldState={(v: ProfileEditType[]) => {
                            setOldState([
                              ...oldState.filter(
                                ({ profile_type_name }) => profile_type_name !== f.label
                              ),
                              ...(v || []),
                            ])
                          }}
                          setError={setError}
                        />
                      </>
                    )}
                  </Box>
                )
              }
            )
          : undefined}
      </CompanyFormsSectionLayout>
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
                const profiles = [
                  {
                    profile_type_id: appendingItem.id,
                    new_value: appendingState.filter(e => e.length > 0).map(v => v.trim()),
                  },
                ]
                await handleAddProfiles(profiles)
              },
              disabled:
                loading ||
                appendingState.some(
                  v =>
                    validateProfileField(appendingState, appendingItem.editState || [])(v) ===
                    'error'
                ),
            },
          ]}
        >
          <Heading as="h4" center sx={{ width: '100%', marginY: 4, fontWeight: 600 }}>
            {`Add New ${appendingItem.label}`}
          </Heading>
          <Box sx={{ overflow: 'auto', width: '100%', maxHeight: '80vh', px: 5 }}>
            <Label
              id={`${getType(appendingItem.label)}`}
              sx={{
                flex: 1,
              }}
            >
              New {appendingItem.label} {appendingState.length && `(${appendingState.length})`}
            </Label>
            <ProfileForm
              isEdit={false}
              companyId={companyId}
              showViewHistory={showViewHistory}
              refetchViewHistoryCols={refetchViewHistoryCols}
              buttonLabel={`Add ${appendingItem.label} +`}
              state={appendingState}
              editState={appendingItem.editState}
              type={appendingItem.type}
              onAddField={() => {
                const cloneState = [...appendingState]
                cloneState.push('')
                setAppendingState(cloneState)
              }}
              onChange={setAppendingState}
              validate={validateProfileField(appendingState, appendingItem.editState || [])}
              setError={setError}
            />
          </Box>
        </Modal>
      )}

      <FooterCTAs
        buttons={[
          {
            label: copy.buttons.backToCompanyRecord,
            variant: 'outlineWhite',
            onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
          },
        ]}
      />
      <PendingCRModal />
      <PendingCRFinance />
    </>
  )
}

export default BusinessForm
