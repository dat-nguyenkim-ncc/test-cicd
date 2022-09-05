import React from 'react'
import { Box, Flex } from 'theme-ui'
import { ProfileEditType } from '.'
import { ProfileType } from '../../pages/CompanyForm/helpers'
import { ViewInterface } from '../../types'
import { EnumExpandStatusId } from '../../types/enums'
import { Paragraph } from '../primitives'

type Props = ViewInterface<{
  group: ProfileType[]
  state: ProfileEditType[]
}>

const ProfileGroupItem = ({ sx, group, state }: Props) => {
  return (
    <>
      <Box
        sx={{
          bg: 'gray03',
          my: 5,
          p: 4,
          borderRadius: '10px',
          width: '100%',
          border: '1px solid',
          borderColor: 'gray01',
          ...sx,
        }}
      >
        {group.map((g, i) => {
          const data = state?.filter(p => p.profile_type_id === g.profile_type_id)
          return data?.length ? (
            <Flex
              key={i}
              sx={{
                pb: 2,
                gap: 2,
              }}
            >
              <Paragraph sx={{ flex: 1 }} bold>{`${g.profile_type_name}:`}</Paragraph>
              <Box sx={{ flex: 2 }}>
                {data.map((p, index) => {
                  return (
                    <Paragraph
                      sx={{
                        mb: index + 1 < data.length ? 1 : 0,
                        opacity: p.expand_status_id === EnumExpandStatusId.FOLLOWING ? 1 : 0.5,
                        wordBreak: 'break-word',
                      }}
                      key={index}
                    >
                      {p.profile_value}
                    </Paragraph>
                  )
                })}
              </Box>
            </Flex>
          ) : undefined
        })}
      </Box>
    </>
  )
}

export default ProfileGroupItem
