import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { SxStyleProp } from 'theme-ui'
import { ButtonText, TagGroup, TagMapping, Updating } from '../../../components'
import { Section } from '../../../components/primitives'
import { TagData, TagGroupType } from '../../../types'
import { EnumCompanyTypeSector, EnumTagGroupSource } from '../../../types/enums'
import { GET_TAGS } from '../../CompanyForm/graphql'

type Props = {
  tags: TagData[]
  disabled?: boolean
  setTags(tags: TagData[]): void
  optionsComponent?: React.ReactElement
  sx?: SxStyleProp
}

const TagBlock = ({ tags, disabled, setTags, ...props }: Props) => {
  const [tagGroups, setTagGroups] = useState<TagGroupType[]>([])
  const [tagGroupSelected, setTagGroupSelected] = useState<TagGroupType>()

  // GRAPHQL
  const { data, loading } = useQuery(GET_TAGS, {
    variables: { sources: [EnumTagGroupSource.BCG] },
    onCompleted() {
      const allTagGroups = (data?.getTagGroups || []).map((tagGroup: TagData) => ({
        ...tagGroup,
        children: (tagGroup.children || []).map(item => ({
          ...item,
          parent: [{ id: tagGroup.id, label: tagGroup.label }],
        })),
      }))
      setTagGroups(allTagGroups)
    },
  })

  return (
    <>
      <Section sx={{ p: 3, ...props.sx }}>
        {loading ? (
          <Updating sx={{ py: 7 }} loading />
        ) : (
          <>
            <TagGroup
              tagGroupSelected={tagGroupSelected}
              tagGroupChildrenSelected={tags}
              tagGroups={tagGroups}
              onTagGroupSelect={setTagGroupSelected}
              onTagGroupChildSelect={setTags}
              sx={{ mt: 5 }}
            />

            {!!tags?.length && (
              <>
                <TagMapping
                  title={'Tag Maps'}
                  onClickRemove={(_, __, t) => {
                    setTags(tags.filter(tag => tag.id !== t.id))
                  }}
                  sx={{ mt: 5, mb: 4 }}
                  typeTech={EnumCompanyTypeSector.FIN} // just a placeholder
                  mappings={{
                    group: { data: tags },
                  }}
                />
                <ButtonText
                  label={'CLEAR ALL ROWS'}
                  sx={{ ml: 3, color: 'primary' }}
                  onPress={() => {
                    setTags([])
                  }}
                />
              </>
            )}
          </>
        )}
      </Section>
    </>
  )
}

export default TagBlock
