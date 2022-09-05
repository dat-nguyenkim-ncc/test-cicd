import { useQuery } from '@apollo/client'
import React from 'react'
import { Box, Label, Flex } from 'theme-ui'
import { Checkbox, Updating } from '../../../components'
import { TagData, ViewInterface } from '../../../types'
import { EnumTagGroupSource } from '../../../types/enums'
import { GET_TAGS } from '../../CompanyForm/graphql'

type Props = ViewInterface<{
  state: TagData[]
  setState(t: TagData[]): void
}>

const FintechType = (props: Props) => {
  const { data: tagsBcgFixed, loading } = useQuery(GET_TAGS, {
    variables: {
      sources: [EnumTagGroupSource.BCG_FIXED],
    },
  })

  return (
    <Box sx={{ ...props.sx }}>
      {loading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <>
          {(tagsBcgFixed?.getTagGroups || []).map((item: TagData) => {
            return (
              <Box sx={{ mt: 5 }} key={item.id}>
                <Label>{item.label}</Label>
                <Flex>
                  {(item?.children || []).map((tag: TagData, index: number) => {
                    const isChecked = !!props.state?.find(t => t.id === tag.id)
                    return (
                      <Flex key={tag.id} sx={{ ml: index > 0 ? 6 : 0 }}>
                        <Checkbox
                          label={tag.label}
                          checked={isChecked}
                          onPress={() => {
                            props.setState(
                              isChecked
                                ? props.state.filter(i => i.id !== tag.id)
                                : [...props.state, tag]
                            )
                          }}
                        />
                      </Flex>
                    )
                  })}
                </Flex>
              </Box>
            )
          })}
        </>
      )}
    </Box>
  )
}

export default FintechType
