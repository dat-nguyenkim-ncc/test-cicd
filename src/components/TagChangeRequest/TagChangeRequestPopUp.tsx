import { Button, Modal, TextField } from '..'
import { TagChangeRequest } from '../../types'
import { EnumUserGroups, TagTypes } from '../../types/enums'
import React, { useContext, useEffect, useState } from 'react'
import { Heading, Paragraph, Section } from '../primitives'
import Updating from '../Updating'
import { Box, Flex, Grid, SxStyleProp } from 'theme-ui'
import { CELL_SIZE } from '../../utils/consts'
import moment from 'moment'
import { getSelfDeclared } from '../../utils/helper'
import { UserContext } from '../../context'
import { ButtonType } from '../../components/Modal/Modal'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export type TagChangeRequestProps = {
  getCRs(): void
  type: TagTypes
  isFetching: boolean
  tagCRs: TagChangeRequest[]
  setTagCRs(tags: TagChangeRequest[]): void
  setTagPendingRequestType(type: TagTypes | undefined): void
  isSaving: boolean
  resolveTagCRs(approve: number[], reject: number[], reason: string): Promise<void>
}

const getActionName = (value: string) => {
  switch (value) {
    case '1':
      return 'Append'
    case '2':
      return 'Removed'
  }
  return ''
}

enum StateModal {
  SELECTING = 1,
  CONFIRMATION = 2,
}

const TAG_GRID = `
[date] repeat(4, ${CELL_SIZE}) 
[date-end]
${CELL_SIZE} 
[user] repeat(8, ${CELL_SIZE}) 
[user-end]
${CELL_SIZE} 
[tag] repeat(8, ${CELL_SIZE}) 
[tag-end]
${CELL_SIZE} 
[action] repeat(4, ${CELL_SIZE}) 
[action-end]
${CELL_SIZE} 
[inputSource] repeat(4, ${CELL_SIZE}) 
[inputSource-end]
${CELL_SIZE} 
[selfDeclared] repeat(3, ${CELL_SIZE}) 
[selfDeclared-end]
${CELL_SIZE} 
[reason] repeat(6, ${CELL_SIZE}) 
[reason-end]
${CELL_SIZE}
[all] repeat(6, ${CELL_SIZE})
[all-end]
${CELL_SIZE}
`

type ChosenTag = {
  approve: TagChangeRequest[]
  reject: TagChangeRequest[]
}

const ItemProps = {
  wordBreak: 'break-word',
  p: 2,
  '& > a': { color: 'black50' },
} as SxStyleProp

const TagChangeRequestView = ({
  isFetching,
  tagCRs,
  type,
  getCRs,
  isSaving,
  setTagPendingRequestType,
  resolveTagCRs,
}: TagChangeRequestProps) => {
  const { user } = useContext(UserContext)

  const isCanApproveOrDecline = user?.groups?.every(g => g.name !== EnumUserGroups.KT)

  const handleRejectAll = () => {
    setChosenTag({ approve: [], reject: tagCRs || [] })
  }

  const [chosenTag, setChosenTag] = useState<ChosenTag>({ approve: [], reject: [] })

  const [stateModal, setStateModal] = useState<StateModal>(StateModal.SELECTING)

  const allSelectedTagIds = chosenTag.approve.map(({ tagId }) => tagId)

  const allRejectIds = chosenTag.reject.map(({ dataOverrideId }) => dataOverrideId)

  const [rejectReason, setRejectReason] = useState<string>('')

  useEffect(() => {
    if (type) getCRs()
  }, [getCRs, type])

  const selectTag = (item: TagChangeRequest, action: 'select' | 'unselect' | 'untick') => {
    switch (action) {
      case 'select':
        setChosenTag({ ...chosenTag, approve: [...chosenTag.approve, item] })
        return
      case 'unselect':
        setChosenTag({ ...chosenTag, reject: [...chosenTag.reject, item] })
        return
      case 'untick': {
        const { approve, reject } = chosenTag
        const filterFn = (tag: TagChangeRequest) => tag.dataOverrideId !== item.dataOverrideId
        setChosenTag({ approve: approve.filter(filterFn), reject: reject.filter(filterFn) })
      }
    }
  }

  const gridView = (data: TagChangeRequest[], showButtons: boolean) => {
    if (!data.length) return <></>
    return (
      <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
        <Grid
          gap={'1px'}
          columns={TAG_GRID}
          sx={{
            alignItems: 'center',
            py: 2,
          }}
        >
          <Paragraph sx={{ gridColumn: 'date /date-end', color: 'grey', ...ItemProps }}>
            Date
          </Paragraph>
          <Paragraph sx={{ gridColumn: 'user /user-end', color: 'grey', ...ItemProps }}>
            User
          </Paragraph>
          <Paragraph sx={{ gridColumn: 'tag /tag-end', color: 'grey', ...ItemProps }}>
            {type === TagTypes.FINTECHTYPE ? 'Fintech Type' : 'Tag'}
          </Paragraph>
          <Paragraph sx={{ gridColumn: 'action /action-end', color: 'grey', ...ItemProps }}>
            Action
          </Paragraph>
          <Paragraph
            sx={{ gridColumn: 'inputSource /inputSource-end', color: 'grey', ...ItemProps }}
          >
            Input Source
          </Paragraph>
          <Paragraph
            sx={{ gridColumn: 'selfDeclared /selfDeclared-end', color: 'grey', ...ItemProps }}
          >
            Self Declared
          </Paragraph>
          <Paragraph sx={{ gridColumn: 'reason /reason-end', color: 'grey', ...ItemProps }}>
            Reason
          </Paragraph>

          {showButtons && isCanApproveOrDecline && (
            <Button
              sx={{
                gridColumn: 'all /all-end',
                justifySelf: 'flex-end',
                color: 'primary',
                ...ItemProps,
              }}
              label="Reject All"
              variant="invert"
              onPress={() => {
                handleRejectAll()
              }}
            />
          )}
        </Grid>
        {(data || []).map((item, index: number) => {
          const isSelected =
            (allSelectedTagIds.includes(item.tagId) ||
              allRejectIds.includes(item.dataOverrideId)) &&
            showButtons

          const condition = !isSelected && showButtons
          const canBeRemoved = item.user === user.email
          return (
            <Flex key={index}>
              <Grid
                gap={'1px'}
                columns={TAG_GRID}
                sx={{
                  alignItems: 'center',
                  backgroundColor: index % 2 === 0 ? 'gray03' : 'transparent',
                  py: 2,
                  opacity: isSelected ? 0.5 : 1,
                }}
              >
                <Paragraph sx={{ gridColumn: 'date /date-end', ...ItemProps }}>
                  {moment(item.date).format(DEFAULT_VIEW_DATE_FORMAT)}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'user /user-end', ...ItemProps }}>
                  {item.user || ''}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'tag /tag-end', ...ItemProps }}>
                  {item.tagName || ''}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'action /action-end', ...ItemProps }}>
                  {getActionName(item.newValue)}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'inputSource /inputSource-end', ...ItemProps }}>
                  {item.inputSource || ''}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'selfDeclared /selfDeclared-end', ...ItemProps }}>
                  {getSelfDeclared(item.selfDeclared)}
                </Paragraph>
                <Paragraph sx={{ gridColumn: 'reason /reason-end', ...ItemProps }}>
                  {item.reason || ''}
                </Paragraph>
                <Flex
                  sx={{
                    p: '5px 2px',
                    gridColumn: 'all /all-end',
                    justifyContent: 'flex-end',
                    gap: 3,
                  }}
                >
                  {condition && isCanApproveOrDecline && (
                    <Button
                      icon="tick"
                      size="small"
                      onPress={() => {
                        selectTag(item, 'select')
                      }}
                    />
                  )}
                  {((isCanApproveOrDecline && condition) ||
                    (showButtons && !isSelected && canBeRemoved)) && (
                    <Button
                      sx={{ bg: 'red' }}
                      color="white"
                      size="small"
                      icon="decline"
                      onPress={() => {
                        selectTag(item, 'unselect')
                      }}
                    />
                  )}
                  {!showButtons && (
                    <Button
                      sx={{ bg: 'red' }}
                      color="white"
                      size="small"
                      icon="decline"
                      onPress={() => {
                        selectTag(item, 'untick')
                      }}
                    />
                  )}
                </Flex>
              </Grid>
            </Flex>
          )
        })}
      </Box>
    )
  }

  const getApproveOrRejectView = (data: TagChangeRequest[], type: 'Approve' | 'Reject') => {
    if (!data.length) return <></>
    return (
      <Box>
        <Heading sx={{ fontWeight: 600, mb: 4, mt: '50px', flex: 11, fontSize: 14 }} as={'h5'}>
          {`${type} Change Requests`}
        </Heading>
        {gridView(data, false)}
      </Box>
    )
  }

  const reasonField = () => {
    if (stateModal === StateModal.SELECTING || !chosenTag.reject.length) return <></>
    return (
      <TextField
        sx={{ mt: 4 }}
        type="textarea"
        label="Enter the reason to reject"
        name="rejectReason"
        required
        value={rejectReason}
        onChange={e => {
          setRejectReason(e.target.value as string)
        }}
      />
    )
  }

  const handleClickOK = () => {
    if (stateModal === StateModal.SELECTING) {
      setStateModal(StateModal.CONFIRMATION)
      return
    }

    const approve = chosenTag.approve.map(({ dataOverrideId }) => dataOverrideId)
    const reject = chosenTag.reject.map(({ dataOverrideId }) => dataOverrideId)
    resolveTagCRs(approve, reject, rejectReason)
  }

  const buttons = () => {
    return (
      <Flex sx={{ justifyContent: 'flex-end', flex: 1, mt: 4 }}>
        {([
          {
            label: 'Cancel',
            action: () => {
              setStateModal(StateModal.SELECTING)
            },
            type: 'secondary',
            visible: stateModal === StateModal.CONFIRMATION,
            disabled: isSaving,
          },
          {
            label: stateModal === StateModal.SELECTING ? 'OK' : 'Confirm',
            action: async () => {
              handleClickOK()
            },
            type: 'primary',
            disabled:
              isFetching ||
              isSaving ||
              (allSelectedTagIds.length === 0 && allRejectIds.length === 0) ||
              (stateModal === StateModal.CONFIRMATION && allRejectIds.length && !rejectReason),
            visible: isCanApproveOrDecline || tagCRs.some(item => user.email === item.user),
          },
        ] as ButtonType[])
          .filter(s => s.visible)
          .map(b => (
            <Button
              key={b.label}
              sx={{ ...b.sx, p: '10px 60px' }}
              variant={b.type}
              label={b.label}
              onPress={b.action}
              disabled={b.disabled}
              icon={b.icon}
            />
          ))}
      </Flex>
    )
  }

  const getListAllCRs = () => {
    if (stateModal === StateModal.CONFIRMATION) return <></>
    return gridView(tagCRs, true)
  }

  const getChildren = () => {
    if (isFetching) {
      return (
        <Section sx={{ bg: 'rgb(240, 251, 247)', width: '100%', flex: 1, borderRadius: 10 }}>
          <Updating loading noPadding />
        </Section>
      )
    }

    if (!tagCRs?.length)
      return (
        <Section sx={{ flex: 1, width: '100%' }}>
          <Heading center as="h4" sx={{ opacity: 0.3 }}>
            NO DATA
          </Heading>
        </Section>
      )

    return (
      <Box>
        <Flex sx={{ justifyContent: 'space-between', mb: 4 }}>
          <Heading sx={{ fontWeight: 600, flex: 11 }} as={'h4'}>
            {stateModal === StateModal.SELECTING
              ? `Pending Request ${tagCRs?.length ? `(${tagCRs?.length || 0})` : ''}`
              : `Confirmation`}
          </Heading>
          <Button
            sx={{ bg: 'black' }}
            color="white"
            size="small"
            icon="decline"
            onPress={() => {
              setTagPendingRequestType(undefined)
            }}
          />
        </Flex>
        <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {getListAllCRs()}
          {getApproveOrRejectView(chosenTag.approve, 'Approve')}
          {getApproveOrRejectView(chosenTag.reject, 'Reject')}
          {reasonField()}
        </Box>
        {buttons()}
      </Box>
    )
  }

  return (
    <Modal
      sx={{
        p: 5,
        maxWidth: '60vw',
        alignItems: 'flex-start',
        minWidth: '900px',
        position: 'relative',
      }}
    >
      {getChildren()}
    </Modal>
  )
}

export default TagChangeRequestView
