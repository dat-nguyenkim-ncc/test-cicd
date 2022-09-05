import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import ExpandLabel from './ExpandLabel'
import { ProfileEditType } from '../../../ProfileForm'
import { getFlatProfileTypes } from '../../../../pages/CompanyForm/helpers'
import strings from '../../../../strings'
import { LicensesResult } from '../../../../pages/Merge'

type SummaryProfileProps = {
  label?: string
  data: { profiles: ProfileEditType[]; licenses: LicensesResult[] }
  profileType: any
}

const SummaryProfile = ({ label, data, profileType }: SummaryProfileProps) => {
  const {
    pages: {
      addCompanyForm: { titles },
    },
  } = strings

  profileType = getFlatProfileTypes(profileType)
  const [isExpand, setExpand] = useState<boolean>(true)

  return (
    <Box
      sx={{
        pb: 16,
        mb: 16,
        px: 2,
        borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label && (
        <ExpandLabel label={label} isExpand={isExpand} onClick={() => setExpand(!isExpand)} />
      )}

      {isExpand &&
        (data && !![...data.profiles, ...data.licenses] ? (
          <>
            {profileType.map(
              (p: any, index: number) =>
                !!data.profiles.filter(
                  ({ profile_type_id }) => profile_type_id === p.profile_type_id
                ).length && (
                  <Box key={index} sx={{ mt: 16 }}>
                    <Paragraph bold>{p.profile_type_name}</Paragraph>
                    {data.profiles
                      .filter(({ profile_type_id }) => profile_type_id === p.profile_type_id)
                      .map((profile, i) => (
                        <Flex key={i} sx={{ ml: 1, mt: 16 }}>
                          <Box
                            sx={{
                              mt: '5px',
                              mr: 2,
                              borderStyle: 'solid',
                              borderColor: 'primary',
                              backgroundColor: 'primary',
                              width: 5,
                              height: 5,
                              borderRadius: '100%',
                              cursor: 'pointer',
                            }}
                          ></Box>
                          <Paragraph>{profile.profile_value}</Paragraph>
                        </Flex>
                      ))}
                  </Box>
                )
            )}
            {!!data.licenses.length && (
              <Box sx={{ mt: 16 }}>
                <Paragraph bold>{titles.licenses}</Paragraph>
                {data.licenses.map((item, i) => (
                  <Flex key={i} sx={{ ml: 1, mt: 16 }}>
                    <Box
                      sx={{
                        mt: '5px',
                        mr: 2,
                        borderStyle: 'solid',
                        borderColor: 'primary',
                        backgroundColor: 'primary',
                        width: 5,
                        height: 5,
                        borderRadius: '100%',
                        cursor: 'pointer',
                      }}
                    ></Box>
                    <Paragraph>{`${item.license_type}${
                      item.license_jurisdiction ? ` (${item.license_jurisdiction})` : ''
                    }`}</Paragraph>
                  </Flex>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryProfile
