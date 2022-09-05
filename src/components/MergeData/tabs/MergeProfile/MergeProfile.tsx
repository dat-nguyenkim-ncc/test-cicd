import React from 'react'
import { ProfileEditType } from '../../../ProfileForm'
import ProfileGroup from './ProfileGroup'
import {
  getFlatProfileTypes,
  ProfileType,
  SingleProfileTypeIds,
} from '../../../../pages/CompanyForm/helpers'
import MergeStepLayout from '../../MergeStepLayout'
import LicensesGroup from './LicensesGroup'
import strings from '../../../../strings'
import { LicensesResult } from '../../../../pages/Merge'

type MergeProfileProps = {
  label: string
  data: { profiles: ProfileEditType[]; licenses: any }
  profileType: ProfileType[]
  profiles: ProfileEditType[]
  licenses: LicensesResult[]
  onChange(data: { profiles: ProfileEditType[]; licenses: any }): void
}

const MergeProfile = ({
  label,
  data,
  profileType,
  profiles = [],
  licenses = [],
  onChange,
}: MergeProfileProps) => {
  const {
    pages: {
      addCompanyForm: { titles },
    },
  } = strings

  const profileTypes = getFlatProfileTypes(profileType)

  return (
    <MergeStepLayout
      sx={{ px: 6 }}
      label={label}
      isEmpty={![...data.profiles, ...data.licenses]?.length}
    >
      {!!data.profiles.length &&
        profileTypes.map((type: ProfileType, index: number) => {
          if (
            !data.profiles.find(({ profile_type_id }) => type.profile_type_id === profile_type_id)
          )
            return null
          return (
            <ProfileGroup
              key={index}
              label={type.profile_type_name}
              data={data.profiles.filter(
                ({ profile_type_id }) => type.profile_type_id === profile_type_id
              )}
              profiles={profiles.filter(
                ({ profile_type_id }) => type.profile_type_id === profile_type_id
              )}
              isMultiple={!SingleProfileTypeIds.includes(+type.profile_type_id)}
              onChange={(pro, isAdd) => {
                let cloneProfiles = [...profiles]
                if (SingleProfileTypeIds.includes(+pro.profile_type_id)) {
                  cloneProfiles = cloneProfiles.filter(
                    ({ profile_type_id }) => +profile_type_id !== +pro.profile_type_id
                  )
                }
                if (isAdd) {
                  cloneProfiles.push(pro)
                } else {
                  cloneProfiles = cloneProfiles.filter(
                    ({ profile_id }) => profile_id !== pro.profile_id
                  )
                }
                onChange({ profiles: cloneProfiles, licenses })
              }}
            />
          )
        })}
      {!!data.licenses.length && (
        <LicensesGroup
          label={titles.licenses}
          data={data.licenses}
          licenses={licenses}
          onChange={(license, isAdd) => {
            let cloneLicenses = [...licenses]
            if (isAdd) {
              cloneLicenses.push(license)
            } else {
              cloneLicenses = cloneLicenses.filter(({ id }) => id !== license.id)
            }
            onChange({ profiles, licenses: cloneLicenses })
          }}
        />
      )}
    </MergeStepLayout>
  )
}

export default MergeProfile
