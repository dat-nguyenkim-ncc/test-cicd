import React from 'react'
import { Box, Flex, Divider } from 'theme-ui'
import { Triangle } from '..'
import { Tag, TagGroupType, ViewInterface } from '../../types'
import strings from '../../strings'
import theme from '../../theme'
import Checkbox from '../Checkbox'
import { Paragraph } from '../primitives'
import { SearchBox } from '../../pages/CompanyManagement/CompanyFilter'

export type TagGroupProps = ViewInterface<{
  tagGroups: TagGroupType[]
  tagGroupSelected?: TagGroupType
  tagGroupChildrenSelected: Tag[]
  onTagGroupChildSelect(tags: Tag[]): void
  onTagGroupSelect(tag: TagGroupType): void
}>

const TagGroup = ({
  sx,
  tagGroups,
  tagGroupSelected,
  tagGroupChildrenSelected,
  onTagGroupChildSelect,
  onTagGroupSelect,
}: TagGroupProps) => {
  const { tagGroup: copy } = strings

  const [text, setText] = React.useState<string>('')

  const onPressCheckBoxChildren = React.useCallback(
    (child: Tag) => {
      const newSelectedItems = tagGroupChildrenSelected.find(c => c.id === child.id)
        ? [...tagGroupChildrenSelected].filter(a => a.id !== child.id)
        : [...tagGroupChildrenSelected, child]

      onTagGroupChildSelect(newSelectedItems)
    },
    [tagGroupChildrenSelected, onTagGroupChildSelect]
  )

  const onChange = (text: string) => {
    const newGroups = tagGroups.filter(gr =>
      gr.children.some(({ label }) => label.toUpperCase().includes(text.toUpperCase()))
    )
    if (
      tagGroups.filter(gr =>
        gr.children.some(({ label }) => label.toUpperCase().includes(text.toUpperCase()))
      ).length === 1
    ) {
      onTagGroupSelect(newGroups[0])
    }
    setText(text)
  }

  const groups = React.useMemo(
    () =>
      tagGroups.filter(gr =>
        gr.children.some(({ label }) => label.toUpperCase().includes(text.toUpperCase()))
      ),
    [tagGroups, text]
  )

  const getChildrenSelected = React.useMemo(() => {
    if (!tagGroupSelected) return null
    const selected = groups.find(t => t.id === tagGroupSelected.id)
    return selected?.children
      ?.filter(({ label }) => label.toUpperCase().includes(text.toUpperCase()))
      .map((c, index) => {
        const childSelected = !!tagGroupChildrenSelected.find(a => a.id === c.id)
        return (
          <Flex
            key={index}
            sx={{
              height: `${theme.space![5]}px`,
              mt: index > 0 ? 3 : 0,
              px: 4,
              alignItems: 'center',
            }}
          >
            <Paragraph sx={{ color: childSelected ? 'primary' : 'text', flex: 1 }} bold>
              {c.label}
            </Paragraph>
            <Checkbox
              onPress={() => {
                onPressCheckBoxChildren(c)
              }}
              checked={childSelected}
            />
          </Flex>
        )
      })
  }, [tagGroupSelected, groups, onPressCheckBoxChildren, tagGroupChildrenSelected, text])

  return (
    <Box sx={sx}>
      <Paragraph bold>{copy.title}</Paragraph>
      <Box sx={{ mt: 5, p: 5, borderRadius: 10, border: '1px solid black' }}>
        <Flex sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Paragraph bold>{copy.tagGroup}</Paragraph>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Flex sx={{ alignItems: 'center' }}>
              <Paragraph bold>{copy.tags}</Paragraph>
              <SearchBox
                fullWidth
                sx={{ m: 0, ml: 4 }}
                onChange={onChange}
                placeholder="Search tag..."
              />
            </Flex>
          </Box>
        </Flex>
        {!!groups?.length ? (
          <Flex sx={{ bg: 'gray03', borderRadius: 10, p: 5, mt: 5 }}>
            <Box sx={{ width: '50%', maxHeight: '430px', overflowY: 'scroll' }}>
              {groups
                .filter(tag => tag.isPriority)
                .map((tag, index) => {
                  const selected = tagGroupSelected?.id === tag.id

                  return (
                    <Flex
                      onClick={() => {
                        onTagGroupSelect(tag)
                      }}
                      key={tag.id}
                      sx={{
                        height: `${theme.space![5]}px`,
                        mt: index > 0 ? 3 : 0,
                        cursor: 'pointer',
                        pr: 4,
                        alignItems: 'center',
                      }}
                    >
                      <Paragraph
                        sx={{
                          color: selected ? 'primary' : 'text',
                          flex: 1,
                        }}
                        bold
                      >
                        {tag.label}
                      </Paragraph>
                      <Triangle color={selected ? 'primary' : 'text'} />
                    </Flex>
                  )
                })}
                <Divider color='darkGray' my={3} mr={3} />
              {groups
                .filter(tag => !tag.isPriority)
                .map((tag, index) => {
                  const selected = tagGroupSelected?.id === tag.id

                  return (
                    <Flex
                      onClick={() => {
                        onTagGroupSelect(tag)
                      }}
                      key={tag.id}
                      sx={{
                        height: `${theme.space![5]}px`,
                        mt: index > 0 ? 3 : 0,
                        cursor: 'pointer',
                        pr: 4,
                        alignItems: 'center',
                      }}
                    >
                      <Paragraph
                        sx={{
                          color: selected ? 'primary' : 'text',
                          flex: 1,
                        }}
                        bold
                      >
                        {tag.label}
                      </Paragraph>
                      <Triangle color={selected ? 'primary' : 'text'} />
                    </Flex>
                  )
                })}
            </Box>
            <Box sx={{ width: '50%', maxHeight: '430px', overflowY: 'scroll' }}>
              {getChildrenSelected}
            </Box>
          </Flex>
        ) : (
          <Paragraph sx={{ textAlign: 'center', py: 7 }}>NO RESULTS FOUND</Paragraph>
        )}
      </Box>
    </Box>
  )
}

export default TagGroup
