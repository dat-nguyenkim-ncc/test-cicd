import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import { Checkbox, Icon, Radio } from '../../..'
import { ProfileEditType } from '../../../ProfileForm'
import { EnumExpandStatusId } from '../../../../types/enums'

type ProfileGroupProps = {
  label?: string
  data: ProfileEditType[]
  profiles: ProfileEditType[]
  isMultiple: boolean
  onChange(profile: ProfileEditType, isAdd: boolean): void
}

const ProfileGroup = ({ label, data, profiles, onChange, isMultiple }: ProfileGroupProps) => {
  const [isExpand, setExpand] = useState<boolean>(true)

  return (
    <Box sx={{ py: 1 }}>
      {label && <Paragraph>{label}</Paragraph>}
      <Box sx={{ py: 3 }}>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 12,
            px: 20,
            border: 'solid 1px rgba(0, 0, 0, 0.1)',
            borderRadius: `10px 10px ${isExpand ? '0 0' : '10px 10px'}`,
            backgroundColor: '#F2F2F2',
            cursor: 'pointer',
          }}
          onClick={() => setExpand(!isExpand)}
        >
          {!profiles.length ? (
            <Paragraph sx={{ opacity: 0.5 }}>{`Select ${label}`}</Paragraph>
          ) : (
            <Paragraph bold>{`${profiles.length} Selected...`}</Paragraph>
          )}
          <Icon
            sx={{ transform: isExpand ? 'rotate(180deg) translateY(4px)' : 'translateY(4px)' }}
            icon="arrow"
            color="text"
            size="tiny"
          />
        </Flex>
        {isExpand && (
          <Box
            sx={{
              border: 'solid 1px rgba(0, 0, 0, 0.1)',
              borderTop: '0px',
              borderRadius: '0 0 10px 10px',
            }}
          >
            {data.map((profile, index) => {
              const isChecked = !!profiles.find(
                ({ profile_id }) => profile_id === profile.profile_id
              )
              return (
                <Flex
                  key={index}
                  sx={{
                    alignItems: 'center',
                    py: 12,
                    px: 30,
                    borderRadius: index + 1 === data.length ? '0 0 10px 10px' : 0,
                    backgroundColor: index % 2 ? 'gray03' : '#FBFBFB',
                  }}
                >
                  {isMultiple ? (
                    <Checkbox
                      onPress={() => onChange(profile, !isChecked)}
                      checked={isChecked}
                      square={true}
                      label={profile.profile_value}
                    />
                  ) : (
                    <Radio
                      key={index}
                      sx={{ mr: 4 }}
                      label={profile.profile_value}
                      selected={isChecked}
                      onClick={() => {
                        onChange(profile, !isChecked)
                      }}
                      size="tiny"
                    />
                  )}
                  {profile.expand_status_id !== EnumExpandStatusId.FOLLOWING && (
                    <Paragraph sx={{ opacity: 0.5, ml: 2 }}>(unfollowed)</Paragraph>
                  )}
                </Flex>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ProfileGroup
