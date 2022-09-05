import React from 'react'
import { Box } from 'theme-ui'
import { CompanyPeople } from '../../../../types'
import { Paragraph } from '../../../primitives'
import {
  getProfile,
  getProfileType,
  GET_FINANCIAL_SERVICES_LICENSES,
} from '../../../../pages/CompanyForm/graphql'
import { ProfileType } from '../../../../pages/CompanyForm/helpers'
import { useQuery } from '@apollo/client'
import { Updating } from '../../..'
import { FinancialServiceOverview, ProfileEditType, ProfileGroupItem } from '../../../ProfileForm'
import { EnumExpandStatusId } from '../../../../types/enums'
import {
  FinanceServiceLicense,
  FinanceServiceLicenseType,
} from '../../../ProfileForm/FinanceServicesLicenses'

export type CompanyDetailBusinessProps = {
  data: CompanyPeople
}

const CompanyDetailBusiness = ({ data }: CompanyDetailBusinessProps) => {
  // GRAPHQL
  const { data: profileType, loading } = useQuery<{
    getProfileType: Array<ProfileType>
  }>(getProfileType)
  const { data: profiles, loading: profileLoading } = useQuery<{
    getProfile: Array<ProfileEditType>
  }>(getProfile, {
    fetchPolicy: 'network-only',
    variables: {
      id: +data.companyId,
    },
  })
  const { data: financeLicenses, loading: financeLicensesLoading } = useQuery<{
    getCompanyFinancialServicesLicenses: Array<FinanceServiceLicense>
  }>(GET_FINANCIAL_SERVICES_LICENSES, {
    fetchPolicy: 'network-only',
    variables: {
      companyId: +data.companyId,
    },
  })

  const financeLicenseData = (financeLicenses?.getCompanyFinancialServicesLicenses || []).filter(
    ({ fctStatusId }) => fctStatusId === +EnumExpandStatusId.FOLLOWING
  )

  return loading || profileLoading || financeLicensesLoading ? (
    <Updating loading />
  ) : (
    <Box mt={6}>
      {profileType
        ? profileType.getProfileType.map(
            ({ profile_type_id, profile_type_name, options, group }, index) => {
              const state = profiles?.getProfile.filter(
                p =>
                  (p.profile_type_id === profile_type_id ||
                    group?.some(g => g.profile_type_id === p.profile_type_id)) &&
                  p.expand_status_id === EnumExpandStatusId.FOLLOWING
              )

              const profileTypeIds = (group || []).map(({ profile_type_id }) => profile_type_id)

              const financeServiceLicenseType =
                // @ts-ignore
                profileTypeIds.includes('0') && profileTypeIds.includes(null)

              return (
                <Box sx={{ mb: 5 }} key={index}>
                  {state?.length ||
                  (financeServiceLicenseType && group && !!financeLicenseData.length) ? (
                    <>
                      <Paragraph sx={{ mb: 3 }} bold>
                        {profile_type_name}
                      </Paragraph>
                      {financeServiceLicenseType && group && !!financeLicenseData.length ? (
                        <>
                          <FinancialServiceOverview
                            group={
                              group.map(item => ({
                                ...item,
                                field:
                                  item.profile_type_id === '0'
                                    ? 'license_jurisdiction'
                                    : 'license_type',
                              })) as FinanceServiceLicenseType[]
                            }
                            oldState={financeLicenseData}
                          />
                        </>
                      ) : group && state ? (
                        <>
                          <ProfileGroupItem sx={{ my: 1 }} group={group} state={state} />
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              bg: 'gray03',
                              my: 1,
                              p: 4,
                              borderRadius: '10px',
                              width: '100%',
                              border: '1px solid',
                              borderColor: 'gray01',
                            }}
                          >
                            {(state || []).map((item, i) => {
                              return (
                                <Paragraph sx={{ mt: i > 0 ? 1 : 0 }} key={i}>
                                  {item.profile_value}
                                </Paragraph>
                              )
                            })}
                          </Box>
                        </>
                      )}
                    </>
                  ) : undefined}
                </Box>
              )
            }
          )
        : undefined}
    </Box>
  )
}

export default CompanyDetailBusiness
