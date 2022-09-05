import React, { useEffect, useState } from 'react'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Input, Text, Divider } from '@theme-ui/components'
import { Heading, Paragraph, Section } from '../../components/primitives'
import strings from '../../strings'
import { EnumTagGroupSource } from '../../types/enums'
import { GET_TAGS } from '../CompanyForm/graphql'
import { Tag, TagGroupType } from '../../types'
import {
  Button,
  Checkbox,
  Dropdown,
  FooterCTAs,
  Icon,
  List,
  Modal,
  SwipeButton,
  TextField,
  Updating,
} from '../../components'
import EditInline from '../../components/EditInline'
import { customScrollbar, Palette } from '../../theme'
import { editTag, getCompanyTagMapping } from './graphql'
import { Prompt, useHistory } from 'react-router'
import { ETLRunTimeContext } from '../../context'
import ThunderBoltSVG from '../../theme/svg/ThunderBoltSVG'

const modals = {
  add: 'add',
  delete: 'delete',
  move: 'move',
  error: 'error',
  warning: 'warning',
  rename: 'rename',
  leave: 'leave',
}

const OPTIONS = {
  merge: 'merge',
  rename: 'rename',
}

type TagInputType = {
  group: Tag
} & Tag

type EditStateType = {
  groupsDelete: TagGroupType[]
  tagsDelete: Tag[]
  groupsAdd: TagGroupType[]
  tagsAdd: TagInputType[]
  groupsRename: Tag[]
  tagsRename: Tag[]
  tagsMove: TagGroupType[]
  tagsMerge: Array<Tag & { merge: string }>
}

const initialState: EditStateType = {
  groupsDelete: [],
  tagsDelete: [],
  groupsAdd: [],
  tagsAdd: [],
  groupsRename: [],
  tagsRename: [],
  tagsMove: [],
  tagsMerge: [],
}

const INITIAL_NEW_TAG = {
  name: '',
  shownOnBanksy: false,
}

const TagManagement = () => {
  const { tagGroup: copy, tagManagement } = strings

  const { isRunning, checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [message, setMessage] = useState<string>('')

  const [newTag, setNewTag] = useState<{ name: string; shownOnBanksy: boolean }>(INITIAL_NEW_TAG)

  const [isAddGroup, setIsAddGroup] = useState<boolean>(false)
  const [isAddTag, setIsAddTag] = useState<boolean>(false)

  const [tagGroups, setTagGroups] = useState<TagGroupType[]>([])
  const [tagChecked, setTagChecked] = useState<Tag[]>([])
  const [tagGroupSelected, setTagGroupSelected] = useState<TagGroupType>()
  const [groupSelected, setGroupSelected] = useState<TagGroupType>({} as TagGroupType)
  const [tagSelected, setTagSelected] = useState<Tag>({} as Tag)
  const [groupToMove, setGroupToMove] = useState<TagGroupType>({} as TagGroupType)
  const [tagsDuplicate, setTagsDuplicate] = useState<Tag[]>([])
  const [tagsEdit, setTagsEdit] = useState<Tag[]>([])
  const [tagsMerge, setTagsMerge] = useState<Tag & { merge: string }>({} as Tag & { merge: string })

  const [editState, setEditState] = useState<EditStateType>(
    JSON.parse(JSON.stringify(initialState))
  )
  const [deleteState, setDeleteState] = useState<{ group?: TagGroupType; tags?: Tag[] }>({})
  const [renameState, setRenameState] = useState<{ group?: TagGroupType; tag?: Tag }>({})

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [modal, setModal] = useState<string>()
  const [option, setOption] = useState<string>('')

  useEffect(() => {
    setTagsEdit(tagsDuplicate)
  }, [tagsDuplicate, setTagsEdit])

  // GRAPHQL
  const { data, loading, refetch } = useQuery(GET_TAGS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: { sources: [EnumTagGroupSource.BCG] },
    onCompleted() {
      setTagGroups(data?.getTagGroups)
    },
  })
  const [submitEditTag, { loading: submitLoading }] = useMutation(editTag)
  const [getCompanies, { data: total, loading: getLoading }] = useLazyQuery(getCompanyTagMapping)

  const resetForm = () => {
    setMessage('')
    setNewTag(INITIAL_NEW_TAG)

    setIsAddGroup(false)
    setIsAddTag(false)

    setTagGroups([])
    setTagChecked([])
    setTagGroupSelected({} as TagGroupType)
    setTagSelected({} as Tag)
    setGroupSelected({} as TagGroupType)
    setGroupToMove({} as TagGroupType)
    setTagsDuplicate([])

    setDeleteState({})
    setRenameState({})

    setEditState(JSON.parse(JSON.stringify(initialState)))
    setTagsMerge({} as Tag & { merge: string })
  }
  const onAddGroup = () => {
    if (!newTag.name) return
    if (
      tagGroups.find(({ label }) => label.trim().toUpperCase() === newTag.name.trim().toUpperCase())
    ) {
      setMessage('We cannot have tag groups with the same name!')
      setModal(modals.error)
      setModalVisible(true)
      return
    }
    const cloneGroups = [...tagGroups]
    cloneGroups.push({ id: '', rowId: '', label: newTag.name, children: [] })
    setTagGroups(cloneGroups)

    const groupsAdd = [...editState.groupsAdd]
    groupsAdd.push({ id: '', rowId: '', label: newTag.name, children: [] })
    setEditState({ ...editState, groupsAdd })

    setNewTag(INITIAL_NEW_TAG)
    setIsAddTag(false)
    setIsAddGroup(false)
    setModalVisible(false)
  }

  const onAddTag = (tags?: TagGroupType) => {
    if (!tags) return
    if (
      tags?.children.find(
        ({ label }) => label.trim().toUpperCase() === newTag.name.trim().toUpperCase()
      )
    ) {
      setMessage('We cannot have tags with the same name in the same group!')
      setModal(modals.error)
      setModalVisible(true)
      return
    }
    const cloneState = [...tags.children]
    cloneState.push({ id: '', rowId: '', label: newTag.name, shownOnBanksy: newTag.shownOnBanksy })
    const cloneGroups = tagGroups.map(gr =>
      gr.label === tags.label
        ? {
            ...tags,
            children: cloneState,
          }
        : gr
    )
    setTagGroups(cloneGroups)

    const tagsAdd = [...editState.tagsAdd]
    tagsAdd.push({
      id: '',
      rowId: '',
      label: newTag.name,
      shownOnBanksy: newTag.shownOnBanksy,
      group: { id: tags.id, rowId: tags.rowId, label: tags.label },
    })
    setEditState({ ...editState, tagsAdd })

    setNewTag(INITIAL_NEW_TAG)
    setIsAddTag(false)
    setIsAddGroup(false)
    setModalVisible(false)
  }

  const onDeleteGroup = (group?: TagGroupType) => {
    if (!group) {
      setModalVisible(false)
      return
    }
    if (!!group?.id) {
      const groupsDelete = [...editState.groupsDelete]
      groupsDelete.push(group)
      setEditState({ ...editState, groupsDelete })
    } else {
      setEditState({
        ...editState,
        groupsAdd: editState.groupsAdd.filter(({ label }) => label !== group.label),
      })
    }
    setTagGroups(tagGroups.filter(({ label }) => label !== group.label))
    setTagGroupSelected(
      tagGroupSelected?.label !== group.label ? tagGroupSelected : ({} as TagGroupType)
    )
    setModalVisible(false)
    setDeleteState({})
  }

  const onDeleteTags = (tags?: Tag[]) => {
    const selected = tagGroups.find(t => t.label === tagGroupSelected?.label)
    const tagsDelete = [...editState.tagsDelete, ...(tags || []).filter(({ id }) => !!id)]
    const cloneGroups = tagGroups.map(gr =>
      gr.label === selected?.label
        ? {
            ...selected,
            children: selected.children.filter(
              ({ label }) => !tags?.find(tag => tag.label === label)
            ),
          }
        : gr
    )
    setEditState({
      ...editState,
      tagsAdd: editState.tagsAdd.filter(
        ({ label, group }) =>
          !(group.label === selected?.label && tags?.find(tag => tag.label === label))
      ),
      tagsDelete,
    })
    setTagGroups(cloneGroups)
    setTagChecked(tagChecked.filter(({ label }) => !tags?.find(tag => tag.label === label)))
    setModalVisible(false)
    setDeleteState({})
  }

  const filterAddTags = (tagsMove: TagGroupType[]) => {
    return [
      ...editState.tagsAdd
        .map(tag => ({
          ...tag,
          group:
            tagChecked.find(t => t.label === tag.label) &&
            tag.group.label === tagGroupSelected?.label
              ? { id: groupToMove.id, label: groupToMove.label, rowId: groupToMove.rowId }
              : tag.group,
        }))
        .reduce((acc, cur) => {
          if (
            !acc.some(tag => tag.label === cur.label && tag.group.label === cur.group.label) &&
            !groupToMove.children.some(tag => !!tag.id && tag.label === cur.label) &&
            !groupToMove.children.some(
              tag =>
                !tag.id &&
                tagsMove
                  .find(gr => gr.label === groupToMove.label)
                  ?.children.some(t => t.label === cur.label)
            )
          ) {
            acc.push(cur)
          }
          return acc
        }, [] as TagInputType[]),
    ]
  }

  const onMoveTags = () => {
    const duplicateTag = tagChecked.filter(
      ({ id, label }) =>
        !!id &&
        groupToMove.children.find(
          e => e.label.trim().toUpperCase() === label.trim().toUpperCase() && !!e.id
        )
    )
    if (duplicateTag.length) {
      setTagsDuplicate(duplicateTag)
      setMessage(tagManagement.message.duplicateTag.replace('A tag', ''))
      setModal(modals.warning)
      setModalVisible(true)
      return
    }

    let tagsMove = [...editState.tagsMove].map(gr => ({
      ...gr,
      children: gr.children.filter(({ label }) => !tagChecked.find(tag => tag.label === label)),
    }))
    const group = tagsMove.find(({ label }) => label === groupToMove.label)

    if (group) {
      tagsMove = tagsMove.map(gr =>
        gr.label === group.label
          ? {
              ...group,
              children: [...group.children, ...tagChecked.filter(({ id }) => !!id)],
            }
          : gr
      )
    } else tagsMove.push({ ...groupToMove, children: tagChecked.filter(({ id }) => !!id) })

    setEditState({
      ...editState,
      tagsMove: tagsMove.filter(({ children }) => !!children.length),
      tagsAdd: filterAddTags(tagsMove),
    })

    const cloneGroup = tagGroups.map(gr => {
      if (gr.label === groupToMove.label) {
        return {
          ...gr,
          children: [
            ...gr.children.filter(
              c =>
                !(!c.id && tagChecked.find(tag => tag.label === c.label)) ||
                (!c.id && !tagChecked.find(tag => tag.label === c.label)?.id)
            ),
            ...tagChecked.filter(
              tag =>
                (!!tag.id && gr.children.find(({ label }) => label === tag.label)) ||
                !gr.children.find(({ label }) => label === tag.label)
            ),
          ],
        }
      }
      if (gr.label === tagGroupSelected?.label) {
        return {
          ...gr,
          children: gr.children.filter(({ label }) => !tagChecked.find(tag => tag.label === label)),
        }
      }
      return gr
    })

    setTagGroups(cloneGroup)
    setTagChecked([])
    setGroupToMove({} as TagGroupType)
    setModalVisible(false)
  }

  const onMoveConfirm = () => {
    let cloneGroup = tagGroups
    let tagsMove = [...editState.tagsMove].map(gr => ({
      ...gr,
      children: gr.children.filter(({ label }) => !tagChecked.find(tag => tag.label === label)),
    }))
    const group = tagsMove.find(({ label }) => label === groupToMove.label)

    if (option === OPTIONS.merge) {
      if (group) {
        tagsMove = tagsMove.map(gr =>
          gr.label === group.label
            ? {
                ...group,
                children: [
                  ...group.children,
                  ...tagChecked.filter(
                    ({ id, label }) => !!id && !tagsDuplicate.some(tag => tag.label === label)
                  ),
                  { ...tagsMerge },
                ],
              }
            : gr
        )
      } else
        tagsMove.push({
          ...groupToMove,
          children: [
            ...tagChecked.filter(
              ({ id, label }) => !!id && !tagsDuplicate.some(tag => tag.label === label)
            ),
            { ...tagsMerge },
          ],
        })

      setEditState({
        ...editState,
        tagsMerge: [...editState.tagsMerge, { ...tagsMerge }],
        tagsMove: tagsMove.filter(({ children }) => !!children.length),
        tagsAdd: filterAddTags(tagsMove),
      })

      cloneGroup = tagGroups.map(gr => {
        if (gr.label === groupToMove.label) {
          return {
            ...gr,
            children: [
              ...gr.children.filter(c => c.id !== tagsMerge.merge && c.id !== tagsMerge.id),
              { ...tagsMerge },
            ],
          }
        }
        if (gr.label === tagGroupSelected?.label) {
          return {
            ...gr,
            children: gr.children.filter(
              ({ label }) => !tagChecked.find(tag => tag.label === label)
            ),
          }
        }
        return gr
      })
    } else if (option === OPTIONS.rename) {
      const tagsMoving = tagChecked.filter(
        tag => !!tag.id && !tagsDuplicate.find(({ label }) => label === tag.label)
      )

      if (group) {
        tagsMove = tagsMove.map(gr =>
          gr.label === group.label
            ? {
                ...group,
                children: [...group.children, ...tagsMoving, ...tagsEdit],
              }
            : gr
        )
      } else
        tagsMove.push({
          ...groupToMove,
          children: [...tagsMoving, ...tagsEdit],
        })
      setEditState({
        ...editState,
        tagsMove: tagsMove.filter(({ children }) => !!children.length),
        tagsRename: [...editState.tagsRename, ...tagsEdit],
        tagsAdd: filterAddTags(tagsMove),
      })

      cloneGroup = tagGroups.map(gr => {
        if (gr.label === groupToMove.label) {
          return {
            ...gr,
            children: [
              ...gr.children.filter(
                c =>
                  !(!c.id && tagChecked.find(tag => tag.label === c.label)) ||
                  (!c.id && !tagChecked.find(tag => tag.label === c.label)?.id)
              ),
              ...tagsMoving,
              ...tagsEdit,
            ],
          }
        }
        if (gr.label === tagGroupSelected?.label) {
          return {
            ...gr,
            children: gr.children.filter(
              ({ label }) => !tagChecked.find(tag => tag.label === label)
            ),
          }
        }
        return gr
      })
    }

    setTagsDuplicate([])
    setOption('')
    setGroupToMove({} as TagGroupType)
    setTagChecked([])
    setTagGroups(cloneGroup)
    setModalVisible(false)
  }

  const onEditTag = (tagName: string, shownOnBanksy: boolean) => {
    const selected = tagGroups.find(t => t.label === tagGroupSelected?.label)
    if (
      selected?.children.find(
        ({ label }) => label.trim().toUpperCase() === tagName.trim().toUpperCase()
      ) &&
      tagName.trim().toLocaleUpperCase() !== tagSelected?.label.trim().toUpperCase()
    ) {
      setMessage('We cannot have tags with the same name in the same group!')
      setModal(modals.error)
      setModalVisible(true)
      return
    }

    if (!tagSelected.id) {
      setEditState({
        ...editState,
        tagsAdd: [
          ...editState.tagsAdd.map(tag => ({
            ...tag,
            label:
              tagSelected.label === tag.label && tagGroupSelected?.label === tag.group.label
                ? tagName
                : tag.label,
          })),
        ],
      })
    } else {
      const tagsRename = [...editState.tagsRename]
      const tagIndex = tagsRename.findIndex(({ id }) => id === tagSelected.id)
      if (tagIndex > -1) {
        tagsRename[tagIndex] = {
          ...tagsRename[tagIndex],
          label: tagName,
          shownOnBanksy: shownOnBanksy,
        }
      } else tagsRename.push({ ...tagSelected, label: tagName, shownOnBanksy: shownOnBanksy })
      setEditState({ ...editState, tagsRename })
    }

    const cloneGroup = tagGroups.map(gr => {
      if (gr.label === tagGroupSelected?.label) {
        return {
          ...gr,
          children: gr.children.map(item => {
            const isTagChanged =
              tagSelected.label === item.label && tagGroupSelected?.label === gr.label
            return {
              ...item,
              label: isTagChanged ? tagName : item.label,
              shownOnBanksy: isTagChanged ? shownOnBanksy : item.shownOnBanksy,
            }
          }),
        }
      }
      return gr
    })
    setTagGroups(cloneGroup)
    setTagSelected({} as Tag)
    setRenameState({})
    setModalVisible(false)
  }

  const onRenameGroup = (value: string) => {
    if (tagGroups.find(({ label }) => label.trim().toUpperCase() === value.trim().toUpperCase())) {
      setMessage('We cannot have tag groups with the same name!')
      setModal(modals.error)
      setModalVisible(true)
      return
    }

    if (!groupSelected.id) {
      setEditState({
        ...editState,
        groupsAdd: [
          ...editState.groupsAdd.map(group => ({
            ...group,
            label: groupSelected.label === group.label ? value : group.label,
          })),
        ],
      })
    } else {
      const groupsRename = editState.groupsRename
      const tagIndex = groupsRename.findIndex(({ id }) => id === groupSelected.id)
      if (tagIndex > -1) {
        groupsRename[tagIndex] = { ...groupsRename[tagIndex], label: value }
      } else groupsRename.push({ ...groupSelected, label: value })
      setEditState({ ...editState, groupsRename })
    }

    const cloneGroup = tagGroups.map(gr =>
      gr.label === groupSelected.label
        ? {
            ...gr,
            label: value,
          }
        : gr
    )
    setTagGroups(cloneGroup)
    setTagSelected({} as Tag)
    setRenameState({})
    setModalVisible(false)
  }

  const parseId = (id: string) => {
    if (!id) return null
    return +id
  }

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    const groups = [
      ...editState.groupsAdd,
      ...editState.tagsMove,
      ...editState.tagsAdd.map(({ group }) => group),
    ].reduce((acc, cur) => {
      if (!acc.find(({ label }) => label === cur.label)) {
        acc.push({ id: cur.id, label: cur.label, rowId: cur.rowId })
      }
      return acc
    }, [] as Tag[])
    const input = {
      newTags: groups.map(gr => ({
        tag_group_id: parseId(gr.id),
        tag_group_name: gr.label,
        tags: [
          ...(editState.groupsAdd.find(({ label }) => label === gr.label)?.children || []),
          ...(editState.tagsMove.find(({ label }) => label === gr.label)?.children || []),
          ...editState.tagsAdd.filter(({ group }) => group.label === gr.label),
        ].map(tag => ({
          tag_id: parseId(tag.id),
          tag_name: tag.label,
          shown_on_banksy: tag.shownOnBanksy,
        })),
      })),
      renamingTags: [
        ...editState.groupsRename.map(gr => ({
          id: parseId(gr.id),
          value: gr.label,
          isGroup: true,
        })),
        ...editState.tagsRename.map(gr => ({
          id: parseId(gr.id),
          value: gr.label,
          shownOnBanksy: gr.shownOnBanksy,
          isGroup: false,
        })),
      ],
      deleteGroups: editState.groupsDelete.map(group => ({
        tag_group_id: parseId(group.id),
        tagIds: group.children.map(({ id }) => parseId(id)),
      })),
      deleteTags: editState.tagsDelete.map(({ id }) => parseId(id)),
      mergeTags: editState.tagsMerge.map(tag => ({
        id: parseId(tag.id),
        deleteId: parseId(tag.merge),
      })),
    }

    await submitEditTag({ variables: { input: input } })
    refetch()
    resetForm()
  }

  const getChildrenSelected = () => {
    if (!tagGroupSelected) return null
    const selected = tagGroups.find(t => t.label === tagGroupSelected.label)

    return (
      <>
        {selected?.children?.map((c, index) => {
          // const checked = !!tagChecked.find(a => a.label === c.label)
          return (
            <EditInline
              key={index}
              // checked={checked}
              // onCheck={() => {
              //   let cloneState = [...tagChecked]
              //   if (checked) cloneState = cloneState.filter(({ label }) => label !== c.label)
              //   else cloneState.push(c)
              //   setTagChecked(cloneState)
              // }}
              prefix={
                c.shownOnBanksy ? (
                  <ThunderBoltSVG style={{ marginRight: 6, transform: 'scale(0.8)' }} />
                ) : (
                  <svg viewBox="0 0 24 24" width="24px" height="24px" style={{ marginRight: 6 }} />
                )
              }
              onMove={() => {
                // setTagSelected(c)
                setTagChecked([c])
                setModal(modals.move)
                setModalVisible(true)
              }}
              onSelect={() => {}}
              onEdit={() => {
                setTagSelected(c)
                setRenameState({ tag: c })
                setModal(modals.rename)
                setModalVisible(true)
              }}
              onCancel={() => {
                setTagSelected({} as Tag)
              }}
              onSave={() => {}}
              onDelete={() => {
                setDeleteState({ tags: [c] })
                setModal(modals.delete)
                getCompanies({ variables: { tags: [parseId(c.id)] } })
                setModalVisible(true)
              }}
              value={c.label}
              background={index % 2 !== 0 ? undefined : 'bgGray'}
            />
          )
        })}
      </>
    )
  }

  // Warning before leave page without saving
  const [block, setBlock] = useState<boolean>(true)
  const [location, setLocation] = useState<string>()
  const history = useHistory()

  const handleBlockedNavigation = (nextLocation: any) => {
    if (block && !isRunning) {
      setLocation(nextLocation.pathname)
      setModal(modals.leave)
      setModalVisible(true)
      setBlock(false)
      return false
    }
    return true
  }
  const handleConfirmNavigationClick = async (callback: boolean) => {
    if (callback) {
      await onSubmit()
    }
    if (location) {
      history.push(location)
    }
  }

  return (
    <>
      <Prompt
        when={
          !loading &&
          !submitLoading &&
          JSON.stringify(tagGroups) !== JSON.stringify(data?.getTagGroups)
        }
        message={handleBlockedNavigation}
      />
      <Heading as="h2">Tag Management</Heading>
      <Section sx={{ mt: 6 }}>
        {loading ? (
          <Updating noPadding loading />
        ) : (
          <Box>
            <Flex>
              <Paragraph sx={{ fontSize: 22, pl: 4 }} bold>
                {copy.title}
              </Paragraph>
            </Flex>

            <Box sx={{ mt: 4, p: 4, borderRadius: 10, border: '1px solid black' }}>
              <Flex>
                <Box sx={{ pl: 3, flex: 2 }}>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Paragraph bold>{copy.tagGroup}</Paragraph>
                    <Button
                      sx={{ p: 0, color: 'primary', fontWeight: 'normal' }}
                      label={tagManagement.buttons.addGroup}
                      icon="plus"
                      color="primary"
                      variant="invert"
                      onPress={() => {
                        setIsAddGroup(true)
                        setModal(modals.add)
                        setModalVisible(true)
                      }}
                    ></Button>
                  </Flex>
                </Box>
                <Box sx={{ pl: 16, flex: 3 }}>
                  <Flex sx={{ justifyContent: 'space-between' }}>
                    <Paragraph bold>{copy.tags}</Paragraph>
                    {tagGroupSelected?.label && (
                      <Flex>
                        <Button
                          sx={{
                            p: 0,
                            color: 'primary',
                            fontWeight: 'normal',
                            alignItems: 'center',
                          }}
                          label={tagManagement.buttons.addTag}
                          icon="plus"
                          color="primary"
                          variant="invert"
                          onPress={() => {
                            setIsAddTag(true)
                            setModal(modals.add)
                            setModalVisible(true)
                          }}
                        ></Button>
                        {/* {!!tagChecked.length && (
                          <>
                            <Button
                              sx={{
                                p: 0,
                                mx: 3,
                                color: 'primary',
                                fontWeight: 'normal',
                                alignItems: 'center',
                              }}
                              label={tagManagement.buttons.move}
                              icon="expandArrow"
                              color="primary"
                              variant="invert"
                              onPress={() => {
                                setModal(modals.move)
                                setModalVisible(true)
                              }}
                            ></Button>
                            <Button
                              sx={{
                                p: 0,
                                color: 'red',
                                fontWeight: 'normal',
                                alignItems: 'center',
                              }}
                              label={tagManagement.buttons.delete}
                              icon="trash"
                              color="red"
                              variant="invert"
                              onPress={() => {
                                setDeleteState({ tags: tagChecked })
                                getCompanies({
                                  variables: { tags: tagChecked.map(({ id }) => parseId(id)) },
                                })
                                setModal(modals.delete)
                                setModalVisible(true)
                              }}
                            ></Button>
                          </>
                        )} */}
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Flex>
              <Flex
                sx={{
                  borderRadius: 10,
                  mt: 5,
                }}
              >
                <Box sx={{ flex: 2, pr: 4, width: '50%', maxHeight: '430px', overflowY: 'auto' }}>
                  {tagGroups
                    .filter(tag => tag.isPriority)
                    .map((tag, index) => {
                      const selected = tagGroupSelected?.label === tag.label

                      return (
                        <EditInline
                          key={index}
                          selected={selected}
                          onSelect={() => {
                            setTagChecked([])
                            setTagSelected({} as Tag)
                            setTagGroupSelected(tag)
                          }}
                          onEdit={() => {
                            setGroupSelected(tag)
                            setRenameState({ group: tag })
                            setModal(modals.rename)
                            setModalVisible(true)
                          }}
                          onCancel={() => {
                            setGroupSelected({} as TagGroupType)
                          }}
                          onSave={newValue => {
                            onRenameGroup(newValue)
                          }}
                          onDelete={() => {
                            setDeleteState({ group: tag })
                            getCompanies({
                              variables: { tags: tag.children.map(({ id }) => parseId(id)) },
                            })
                            setModal(modals.delete)
                            setModalVisible(true)
                          }}
                          value={tag.label}
                          isTriangle
                          isBold
                        />
                      )
                    })}
                  <Divider color="darkGray" my={3} mr={1} />
                  {tagGroups
                    .filter(tag => !tag.isPriority)
                    .map((tag, index) => {
                      const selected = tagGroupSelected?.label === tag.label

                      return (
                        <EditInline
                          key={index}
                          selected={selected}
                          onSelect={() => {
                            setTagChecked([])
                            setTagSelected({} as Tag)
                            setTagGroupSelected(tag)
                          }}
                          onEdit={() => {
                            setGroupSelected(tag)
                            setRenameState({ group: tag })
                            setModal(modals.rename)
                            setModalVisible(true)
                          }}
                          onCancel={() => {
                            setGroupSelected({} as TagGroupType)
                          }}
                          onSave={newValue => {
                            onRenameGroup(newValue)
                          }}
                          onDelete={() => {
                            setDeleteState({ group: tag })
                            getCompanies({
                              variables: { tags: tag.children.map(({ id }) => parseId(id)) },
                            })
                            setModal(modals.delete)
                            setModalVisible(true)
                          }}
                          value={tag.label}
                          isTriangle
                          isBold
                        />
                      )
                    })}
                </Box>
                <Box sx={{ flex: 3, px: 4, width: '50%', maxHeight: '430px', overflowY: 'auto' }}>
                  {getChildrenSelected()}
                </Box>
              </Flex>
            </Box>
          </Box>
        )}

        {modalVisible && (
          <Modal
            sx={{ p: modal === modals.error ? 6 : 20, width: 500, maxHeight: '80vh' }}
            buttons={
              modal === modals.error
                ? [
                    {
                      label: 'Ok',
                      action: () => {
                        setModalVisible(false)
                      },
                      type: 'primary',
                    },
                  ]
                : undefined
            }
            buttonsStyle={{ width: '100%', justifyContent: 'center', px: 6 }}
          >
            {modal === modals.add && (
              <>
                <Flex sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    sx={{ ml: 2 }}
                    onPress={() => {
                      setNewTag(INITIAL_NEW_TAG)
                      setIsAddGroup(false)
                      setIsAddTag(false)
                      setModalVisible(false)
                    }}
                    icon="remove"
                    size="tiny"
                    variant="black"
                  ></Button>
                </Flex>
                <Box
                  sx={{
                    px: 6,
                    py: 2,
                    overflow: 'auto',
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Heading sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }} as={'h4'}>
                    {isAddGroup ? 'Add Tag Group' : 'Add Tag'}
                  </Heading>
                  <TextField
                    sx={{ mt: 4 }}
                    placeholder={isAddGroup ? 'Tag Group Name' : 'Tag Name'}
                    name="tag"
                    onChange={e => {
                      setNewTag({ ...newTag, name: e.target.value })
                    }}
                    value={newTag.name}
                  />
                  {!isAddGroup ? (
                    <Checkbox
                      sx={{ mt: 4 }}
                      label="Live on Banksy"
                      onPress={() => setNewTag({ ...newTag, shownOnBanksy: !newTag.shownOnBanksy })}
                      checked={newTag.shownOnBanksy}
                      square
                      size="small"
                    />
                  ) : (
                    <></>
                  )}
                  <Button
                    label="Add"
                    sx={{ width: '100%', my: 5 }}
                    onPress={() => {
                      if (isAddGroup) {
                        onAddGroup()
                      } else if (isAddTag) {
                        onAddTag(tagGroups.find(t => t.label === tagGroupSelected?.label))
                      }
                    }}
                    disabled={!newTag}
                  ></Button>
                </Box>
              </>
            )}
            {modal === modals.delete &&
              (getLoading ? (
                <Box sx={{ py: 6 }}>
                  <Updating noPadding loading />
                </Box>
              ) : (
                <>
                  <Flex sx={{ mb: 3, mt: 5, justifyContent: 'center' }}>
                    <Icon icon="alert" size="small" background="red" color="white" />
                    <Heading center sx={{ fontWeight: 600, ml: 3, textAlign: 'center' }} as={'h4'}>
                      Warning
                    </Heading>
                  </Flex>
                  {deleteState.group && (
                    <>
                      <Box
                        sx={{
                          px: 6,
                          py: 2,
                          flex: 1,
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
                          {tagManagement.message.delete.replace('$name?', 'tag group')}
                          <span
                            style={{ fontWeight: 'bold' }}
                          >{` ${deleteState.group.label}?`}</span>
                        </Text>
                        <Text
                          sx={{
                            marginTop: 1,
                            textAlign: 'center',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          {`This also means all tags within the group and all company tag mappings will be deleted`}
                        </Text>
                        {!!deleteState.group.children.length && (
                          <List
                            label={`Tags: ${deleteState.group.children.length}`}
                            list={deleteState.group.children}
                          />
                        )}
                        {!!total?.getCompanyTagMapping && (
                          <Text
                            sx={{
                              marginTop: 4,
                              textAlign: 'start',
                              fontSize: 14,
                              lineHeight: 1.5,
                              fontWeight: 'bold',
                            }}
                          >
                            {`Tagged Companies: ${total?.getCompanyTagMapping}`}
                          </Text>
                        )}
                      </Box>
                    </>
                  )}
                  {deleteState.tags && (
                    <>
                      <Box
                        sx={{
                          px: 6,
                          py: 2,
                          flex: 1,
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
                          {tagManagement.message.delete.replace('$name?', '')}
                          <span
                            style={{ fontWeight: 'bold' }}
                          >{` ${deleteState.tags.length} tags?`}</span>
                        </Text>
                        {!!total?.getCompanyTagMapping && (
                          <>
                            <Text
                              sx={{
                                marginTop: 1,
                                textAlign: 'center',
                                fontSize: 14,
                                lineHeight: 1.5,
                              }}
                            >
                              {`This also means all company tag mappings will be deleted.`}
                            </Text>
                            <Text
                              sx={{
                                marginTop: 1,
                                textAlign: 'center',
                                fontSize: 14,
                                lineHeight: 1.5,
                                fontWeight: 'bold',
                              }}
                            >
                              {`Tagged Companies: ${total.getCompanyTagMapping}`}
                            </Text>
                          </>
                        )}
                      </Box>
                    </>
                  )}

                  <Box sx={{ px: 6, pt: 4, width: '100%' }}>
                    <SwipeButton
                      endSwipe={() => {
                        if (deleteState.group) onDeleteGroup(deleteState.group)
                        else if (deleteState.tags) onDeleteTags(deleteState.tags)
                      }}
                    />
                  </Box>
                  <Button
                    label={tagManagement.buttons.cancel}
                    sx={{ mt: 1, mb: 5, color: 'black' }}
                    onPress={() => setModalVisible(false)}
                    variant="invert"
                    disabled={false}
                  ></Button>
                </>
              ))}
            {modal === modals.move && (
              <>
                <Flex sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    sx={{ ml: 2 }}
                    onPress={() => {
                      setTagChecked([])
                      setModalVisible(false)
                    }}
                    icon="remove"
                    size="tiny"
                    variant="black"
                  ></Button>
                </Flex>
                <Box
                  sx={{
                    px: 6,
                    py: 2,
                    overflow: 'auto',
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Heading sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }} as={'h4'}>
                    {`Tag moving`}
                  </Heading>
                  {!!groupToMove.label && (
                    <Text sx={{ textAlign: 'center', lineHeight: 1.5 }}>
                      {`Are you sure to move ${tagChecked.length} tags to`}
                      <span
                        style={{ marginLeft: 4, color: Palette.primary }}
                      >{`${groupToMove.label}?`}</span>
                    </Text>
                  )}
                  {tagChecked && <List label={'Tags'} list={tagChecked} />}
                  <Dropdown
                    sx={{ mt: 4 }}
                    label="To Group"
                    options={tagGroups
                      .filter(({ label }) => label !== tagGroupSelected?.label)
                      .map(tag => ({ label: tag.label, value: tag.label }))}
                    name="tag group"
                    onChange={e => {
                      setGroupToMove(
                        tagGroups.find(({ label }) => label === e.target.value) ||
                          ({} as TagGroupType)
                      )
                    }}
                    value={groupToMove.label}
                  ></Dropdown>
                  <Button
                    label={tagManagement.buttons.confirm}
                    sx={{ width: '100%', my: 5 }}
                    onPress={() => onMoveTags()}
                    disabled={!groupToMove.label}
                  ></Button>
                </Box>
              </>
            )}
            {modal === modals.error && (
              <>
                <Flex>
                  <Icon icon="alert" size="small" background="red" color="white" />
                  <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                    Error
                  </Heading>
                </Flex>
                <Text sx={{ mt: 3, textAlign: 'center', lineHeight: 1.5 }}>{message}</Text>
              </>
            )}
            {modal === modals.warning && (
              <Box sx={{ p: 40, width: '100%' }}>
                <Flex sx={{ width: '100%', justifyContent: 'center' }}>
                  <Icon icon="alert" size="small" background="red" color="white" />
                  <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                    Warning
                  </Heading>
                </Flex>
                <Text sx={{ mt: 3, textAlign: 'center', lineHeight: 1.5 }}>
                  {!!tagsDuplicate.length && (
                    <span style={{ fontWeight: 'bold' }}>{`${tagsDuplicate
                      .map(({ label }) => label)
                      .join(',')}`}</span>
                  )}
                  {message}
                </Text>
                <Flex sx={{ alignItems: 'center', mt: 3 }}>
                  <Checkbox
                    checked={option === OPTIONS.merge}
                    onPress={() => setOption(OPTIONS.merge)}
                  />
                  <Paragraph sx={{ pl: 3 }} bold>
                    Merge tags
                  </Paragraph>
                </Flex>

                {option === OPTIONS.merge &&
                  (() => {
                    const tagInTargetGroup = groupToMove.children.find(
                      tag => tag.label === tagChecked[0].label
                    ) as Tag
                    return (
                      <Box sx={{ ml: 5 }}>
                        <Checkbox
                          sx={{ mt: 3 }}
                          checked={
                            tagChecked[0].label === tagsMerge.label &&
                            tagChecked[0].id === tagsMerge.id
                          }
                          onPress={() =>
                            setTagsMerge({
                              ...tagChecked[0],
                              merge: tagInTargetGroup.id,
                            })
                          }
                          prefix={
                            tagChecked[0].shownOnBanksy ? (
                              <ThunderBoltSVG
                                style={{
                                  transform: 'scale(0.7)',
                                  margin: '0 -23px 0 10px',
                                }}
                              />
                            ) : (
                              <Box sx={{ width: '10px' }}></Box>
                            )
                          }
                          label={`${tagChecked[0].label} - ${tagGroupSelected?.label}`}
                          size="tiny"
                        />
                        <Checkbox
                          sx={{ mt: 3 }}
                          checked={
                            tagInTargetGroup.label === tagsMerge.label &&
                            tagInTargetGroup.id === tagsMerge.id
                          }
                          onPress={() =>
                            setTagsMerge({
                              ...tagInTargetGroup,
                              merge: tagChecked[0].id,
                            })
                          }
                          prefix={
                            tagInTargetGroup.shownOnBanksy ? (
                              <ThunderBoltSVG
                                style={{
                                  transform: 'scale(0.7)',
                                  margin: '0 -23px 0 10px',
                                }}
                              />
                            ) : (
                              <Box sx={{ width: '10px' }}></Box>
                            )
                          }
                          label={`${tagInTargetGroup.label} - ${groupToMove.label}`}
                          size="tiny"
                        />
                      </Box>
                    )
                  })()}

                <Flex sx={{ alignItems: 'center', mt: 5 }}>
                  <Checkbox
                    checked={option === OPTIONS.rename}
                    onPress={() => setOption(OPTIONS.rename)}
                  />
                  <Paragraph sx={{ pl: 3 }} bold>
                    Edit tag
                  </Paragraph>
                </Flex>

                {option === OPTIONS.rename &&
                  tagsEdit.map((tag, index) => {
                    const isDuplicate = !!groupToMove.children.find(
                      gr => tag.label.trim().toUpperCase() === gr.label.trim().toUpperCase()
                    )
                    return (
                      <Box key={index} sx={{ mt: 3 }}>
                        <Input
                          sx={{
                            px: 3,
                            border: '1px solid',
                            borderColor: isDuplicate ? 'red' : 'gray06',
                            borderRadius: 5,
                          }}
                          name="tag"
                          placeholder={tagsDuplicate[index].label}
                          backgroundColor="transparent"
                          value={tag.label}
                          onChange={e => {
                            let cloneState = [...tagsEdit]
                            cloneState[index] = { ...cloneState[index], label: e.target.value }
                            setTagsEdit(cloneState)
                          }}
                        />
                        {isDuplicate && (
                          <Paragraph sx={{ mt: 1, textAlign: 'end', color: 'red' }}>
                            {tagManagement.message.nameExists}
                          </Paragraph>
                        )}
                        <Checkbox
                          sx={{ mt: 4 }}
                          checked={tag.shownOnBanksy}
                          onPress={() => {
                            let cloneState = [...tagsEdit]
                            cloneState[index] = {
                              ...cloneState[index],
                              shownOnBanksy: !tag.shownOnBanksy,
                            }
                            setTagsEdit(cloneState)
                          }}
                          label="Live on Banksy"
                          square
                          size="small"
                        />
                      </Box>
                    )
                  })}

                <Button
                  label={tagManagement.buttons.confirm}
                  sx={{ width: '100%', mt: 5 }}
                  onPress={() => {
                    onMoveConfirm()
                  }}
                  disabled={
                    !(
                      (option === OPTIONS.merge && !!tagsMerge.id) ||
                      (option === OPTIONS.rename &&
                        !(
                          tagsEdit.some(({ label }) => !label.trim().length) ||
                          tagsEdit.some(
                            ({ label }, index) =>
                              tagsDuplicate[index].label.trim().toUpperCase() ===
                                label.trim().toUpperCase() ||
                              groupToMove.children.find(
                                gr => label.trim().toUpperCase() === gr.label.trim().toUpperCase()
                              )
                          )
                        ))
                    )
                  }
                ></Button>
                <Button
                  label={tagManagement.buttons.cancel}
                  sx={{ width: '100%', mt: 3, color: 'black' }}
                  onPress={() => {
                    setTagsMerge({} as Tag & { merge: string; targetGroupId: string })
                    setTagsDuplicate([])
                    setOption('')
                    setGroupToMove({} as TagGroupType)
                    setModalVisible(false)
                  }}
                  variant="invert"
                ></Button>
              </Box>
            )}
            {modal === modals.rename && (
              <>
                <Flex sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    sx={{ ml: 2 }}
                    onPress={() => {
                      setRenameState({})
                      setModalVisible(false)
                    }}
                    icon="remove"
                    size="tiny"
                    variant="black"
                  ></Button>
                </Flex>
                <Box
                  sx={{
                    px: 6,
                    py: 2,
                    overflow: 'auto',
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Heading sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }} as={'h4'}>
                    {renameState.group ? 'Rename Tag Group' : 'Edit Tag'}
                  </Heading>
                  <TextField
                    sx={{ mt: 4 }}
                    label={renameState.group ? 'Tag Group Name' : 'Tag Name'}
                    placeholder={groupSelected.label || tagSelected.label}
                    name="tag"
                    onChange={e => {
                      if (renameState.group) {
                        setRenameState({ group: { ...renameState.group, label: e.target.value } })
                      } else if (renameState.tag) {
                        setRenameState({ tag: { ...renameState.tag, label: e.target.value } })
                      }
                    }}
                    value={renameState.group?.label || renameState.tag?.label}
                  />
                  {!renameState.group ? (
                    <Checkbox
                      sx={{ mt: 4 }}
                      checked={Boolean(renameState.tag?.shownOnBanksy)}
                      onPress={() =>
                        setRenameState({
                          tag: {
                            ...(renameState.tag || ({} as Tag)),
                            shownOnBanksy: !renameState.tag?.shownOnBanksy,
                          },
                        })
                      }
                      label="Live on Banksy"
                      square
                      size="small"
                    />
                  ) : (
                    <></>
                  )}
                  <Button
                    label="Save"
                    sx={{ width: '100%', my: 5 }}
                    onPress={() => {
                      if (renameState.group) {
                        onRenameGroup(renameState.group.label)
                      } else if (renameState.tag) {
                        onEditTag(renameState.tag.label, renameState.tag.shownOnBanksy as boolean)
                      }
                    }}
                    disabled={
                      renameState.group
                        ? !!groupSelected.label &&
                          (!renameState.group.label ||
                            renameState.group.label.trim().toUpperCase() ===
                              groupSelected.label.trim().toUpperCase())
                        : renameState.tag &&
                          !!tagSelected.label &&
                          (!renameState.tag.label ||
                            renameState.tag?.label.trim().toUpperCase() ===
                              tagSelected.label.trim().toUpperCase()) &&
                          tagSelected.shownOnBanksy === renameState.tag?.shownOnBanksy
                    }
                  ></Button>
                </Box>
              </>
            )}
            {modal === modals.leave && (
              <Box
                sx={{
                  p: 40,
                  overflow: 'auto',
                  flex: 1,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <Flex sx={{ width: '100%', justifyContent: 'center' }}>
                  <Icon icon="alert" size="small" background="red" color="white" />
                  <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                    Warning
                  </Heading>
                </Flex>
                <Paragraph sx={{ mt: 3, lineHeight: 1.5 }}>
                  {`You have made a number of changes on this page. Would you like to save the changes
                  now or leave without saving?`}
                </Paragraph>
                <Flex sx={{ mt: 5, width: '100%', justifyContent: 'center' }}>
                  <Button
                    label="Leave without saving"
                    sx={{ color: 'red' }}
                    onPress={() => {
                      handleConfirmNavigationClick(false)
                    }}
                    variant="outline"
                    disabled={submitLoading}
                  ></Button>
                  <Button
                    label="Save now"
                    sx={{ ml: 2 }}
                    onPress={() => {
                      handleConfirmNavigationClick(true)
                    }}
                    disabled={submitLoading}
                  ></Button>
                </Flex>
              </Box>
            )}
          </Modal>
        )}
      </Section>

      <FooterCTAs
        buttons={[
          {
            label: `${tagManagement.buttons.reset}`,
            onClick: () => {
              resetForm()
              setTagGroups(data?.getTagGroups)
            },
            variant: 'outlineWhite',
            disabled: loading || submitLoading,
          },
          {
            label: `${tagManagement.buttons.save}`,
            onClick: () => {
              onSubmit()
            },
            disabled:
              loading ||
              JSON.stringify(tagGroups) === JSON.stringify(data?.getTagGroups) ||
              submitLoading,
          },
        ]}
      />

      <style>{customScrollbar}</style>
    </>
  )
}

export default TagManagement
