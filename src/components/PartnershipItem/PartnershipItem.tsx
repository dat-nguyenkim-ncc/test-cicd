import React, { useContext, useMemo } from 'react'
import { Box, BoxOwnProps, Flex, Grid } from 'theme-ui'
import { Tooltip, ReasonSwitch, Modal, Button } from '..'
import { GetCompanyOverrideInput, PartnerDetailType, Partnership } from '../../types'
import { EnumExpandStatus, EnumExpandStatusId, Routes } from '../../types/enums'
import { Paragraph } from '../primitives'
import { formatDate } from '../../utils'
import { ColumnNames, getNumPending, TableNames } from '../../pages/CompanyForm/helpers'
import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import { useViewDataOverrides } from '../../hooks/useViewDataOverrides'
import useChangeRequest from '../../hooks/useChangeRequest'
import { idNANumber } from '../../utils/consts'
import { useParams } from 'react-router-dom'

const MAX_LINE = 3
export const ITEM_GRID = {
  NOT_EDIT: ['1fr 1fr 1.5fr 3fr'],
  EDIT: ['0.6fr 1fr 1.5fr 3fr 0.5fr'],
}

type ItemProps = {
  partnership: Partnership
  isEdit: boolean
  refetchViewHistoryCols(): void
  updateStatus(id: string | number, newStatus: EnumExpandStatusId): void
} & BoxOwnProps

const handleOpenUrl = (companyId?: number) => {
  if (companyId) {
    const url = Routes.COMPANY.replace(':id', `${companyId}`)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const PartnershipItem = ({
  partnership,
  isEdit,
  refetchViewHistoryCols,
  updateStatus,
}: ItemProps) => {
  const [modalEdit, setModalEdit] = React.useState(false)
  const { id: companyId } = useParams<any>()

  const isFollowing = useMemo(
    () =>
      !isEdit
        ? true
        : partnership.fctStatusId === EnumExpandStatusId.FOLLOWING &&
          partnership.partnerDetails.find(item => item.companyId === +companyId)?.fctStatusId ===
            EnumExpandStatusId.FOLLOWING,
    [isEdit, partnership, companyId]
  )

  return (
    <>
      <Grid
        key={partnership.id}
        gap={2}
        columns={isEdit ? ITEM_GRID.EDIT : ITEM_GRID.NOT_EDIT}
        sx={{
          alignItems: 'center',
          bg: 'white',
          p: 3,
          my: 2,
          borderRadius: 12,
        }}
      >
        <Paragraph
          sx={{
            opacity: isFollowing ? 1 : 0.5,
          }}
        >
          {formatDate(partnership.date)}
        </Paragraph>
        <Box
          sx={{
            opacity: isFollowing ? 1 : 0.5,
          }}
        >
          {partnership.partnerDetails
            .filter(
              item =>
                !(item.externalId === partnership.externalId || item.companyId === +companyId) &&
                (isEdit ? true : item.fctStatusId === EnumExpandStatusId.FOLLOWING)
            )
            .map((partner, index, array) => (
              <Paragraph
                sx={{
                  cursor: partner.companyId ? 'pointer' : 'default',
                  color: partner.companyId ? 'primary' : 'default',
                }}
                onClick={e => {
                  e.stopPropagation()
                  handleOpenUrl(partner.companyId)
                }}
                key={index}
              >
                {`${partner.partnerName}${index < array.length - 1 ? ',' : ''}`}
              </Paragraph>
            ))}
        </Box>
        <div style={{ width: '100%', opacity: isFollowing ? 1 : 0.5 }}>
          <Tooltip
            sx={{ ml: -3, maxWidth: 514 }}
            content={partnership.title}
            id={`title-${partnership.id}`}
            numberOfTextLine={MAX_LINE}
          >
            <Paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              css={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitLineClamp: MAX_LINE,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {partnership.title}
            </Paragraph>
          </Tooltip>
        </div>
        <div style={{ width: '100%', opacity: isFollowing ? 1 : 0.5 }}>
          <Tooltip
            sx={{ maxWidth: 514 }}
            content={partnership.summary}
            id={`summary-${partnership.id}`}
            numberOfTextLine={MAX_LINE}
          >
            <Paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              css={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitLineClamp: MAX_LINE,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {partnership.summary}
            </Paragraph>
          </Tooltip>
        </div>
        {isEdit && (
          <Box sx={{ justifySelf: 'flex-end', mr: 3 }}>
            <Button
              sx={{ height: 'auto' }}
              color="primary"
              variant="invert"
              icon="pencil"
              onPress={async () => {
                setModalEdit(true)
              }}
            />
          </Box>
        )}
      </Grid>
      {modalEdit && (
        <Modal
          maxWidth={1200}
          sx={{ px: 5, py: 6 }}
          buttons={[
            {
              label: 'OK',
              action: () => {
                setModalEdit(false)
              },
              type: 'primary',
              sx: {
                p: '10px 60px',
              },
            },
          ]}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%' }}
        >
          <PartnershipEditForm
            partnership={partnership}
            refetchViewHistoryCols={refetchViewHistoryCols}
            updateStatus={updateStatus}
            companyId={+companyId}
          />
        </Modal>
      )}
    </>
  )
}
export default PartnershipItem

const MODAL_GRID = ['0.6fr 1.2fr 3fr 2fr']
const PartnershipEditForm = ({
  partnership,
  refetchViewHistoryCols,
  updateStatus,
  companyId,
}: {
  partnership: Partnership
  refetchViewHistoryCols(): void
  updateStatus(id: string | number, newStatus: EnumExpandStatusId): void
  companyId: number
}) => {
  const {
    handleUpdateStatus,
    isOverridesUser,
    companySource,
    hasHistoryField,
    viewHistory,
  } = useContext(CompanyContext)

  const { handleClickShowPendingCR, PendingCRModal, overviewPendingRequest } = useChangeRequest({
    refetchViewHistoryCols,
    handleApproveUpdateNewData: async data => {
      if (data.columnName === ColumnNames.FCT_STATUS_ID) {
        await updateStatus(+data.rowId || '', data.newValue as EnumExpandStatusId)
      }
    },
    defaultSource: companySource,
    companyId: companyId,
  })

  const { viewPendingCQFn, viewHistoryFn } = useViewDataOverrides({
    listOverride: hasHistoryField,
    listPendingRequest: overviewPendingRequest,
    viewHistory,
    viewPendingCQ: handleClickShowPendingCR,
    companySource,
  })

  const numberOfTextLine = React.useMemo(
    () => (partnership.partnerDetails?.length || MAX_LINE) * 2,
    [partnership.partnerDetails]
  )

  return (
    <Box sx={{}}>
      <Grid gap={3} columns={MODAL_GRID} sx={{ alignItems: 'center', px: 3, py: 1 }}>
        <Paragraph bold>Date</Paragraph>
        <Paragraph bold>Title</Paragraph>
        <Paragraph bold>Detail</Paragraph>
        <Paragraph bold>Partner Name</Paragraph>
      </Grid>
      <Grid
        key={partnership.id}
        gap={3}
        columns={MODAL_GRID}
        sx={{ alignItems: 'center', bg: 'white', p: 3, my: 2, borderRadius: 12 }}
      >
        <Paragraph>{formatDate(partnership.date)}</Paragraph>
        <div style={{ width: '100%' }}>
          <Tooltip
            sx={{ ml: -3, maxWidth: 514 }}
            content={partnership.title}
            id={`title-${partnership.id}`}
            numberOfTextLine={numberOfTextLine}
          >
            <Paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              css={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitLineClamp: numberOfTextLine,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {partnership.title}
            </Paragraph>
          </Tooltip>
        </div>
        <div style={{ width: '100%' }}>
          <Tooltip
            sx={{ maxWidth: 514 }}
            content={partnership.summary}
            id={`summary-${partnership.id}`}
            numberOfTextLine={numberOfTextLine}
          >
            <Paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              css={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitLineClamp: numberOfTextLine,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {partnership.summary}
            </Paragraph>
          </Tooltip>
        </div>
        <Box>
          {partnership.partnerDetails.map((item: PartnerDetailType, index) => {
            const overrideIdentity: GetCompanyOverrideInput = {
              tableName: TableNames.COMPANIES_PARTNERSHIPS,
              columnName: ColumnNames.FCT_STATUS_ID,
              companyId: idNANumber,
              rowId: String(item.id),
              source: partnership.source as string,
            }
            const isFollowing = item.fctStatusId === EnumExpandStatusId.FOLLOWING
            return (
              <Flex key={item.id} sx={{ py: 1, alignItems: 'center' }}>
                <Paragraph
                  sx={{
                    cursor: item.companyId ? 'pointer' : 'default',
                    color: item.companyId ? 'primary' : 'default',
                    flex: 1,
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    handleOpenUrl(item.companyId)
                  }}
                  key={index}
                  bold
                >
                  {item.partnerName}
                </Paragraph>
                <ReasonSwitch
                  disabled={false}
                  switchProps={{
                    checked: isFollowing,
                    onToggle: () => {},
                  }}
                  onSave={async (reason: string) => {
                    const input = {
                      id: String(item.id),
                      companyId: idNANumber,
                      reason: reason,
                      tableName: TableNames.COMPANIES_PARTNERSHIPS,
                      columnName: ColumnNames.FCT_STATUS_ID,
                      source: partnership.source as string,
                      newValue: isFollowing
                        ? EnumExpandStatusId.UNFOLLOWED
                        : EnumExpandStatusId.FOLLOWING,
                      oldValue: isFollowing
                        ? EnumExpandStatusId.FOLLOWING
                        : EnumExpandStatusId.UNFOLLOWED,
                    }

                    await handleUpdateStatus(input)
                    if (isOverridesUser) {
                      await updateStatus(item.id, input.newValue)
                    }
                  }}
                  viewHistory={viewHistoryFn(overrideIdentity)}
                  viewPendingChangeRequest={viewPendingCQFn(overrideIdentity)}
                  reasonProps={{
                    reasonRequired: !isOverridesUser,
                    oldValue: isFollowing
                      ? EnumExpandStatus.FOLLOWING
                      : EnumExpandStatus.UNFOLLOWED,
                    newValue: isFollowing
                      ? EnumExpandStatus.UNFOLLOWED
                      : EnumExpandStatus.FOLLOWING,
                    totalItemPendingCR: getNumPending(overviewPendingRequest, overrideIdentity),
                  }}
                />
              </Flex>
            )
          })}
        </Box>
      </Grid>

      <PendingCRModal />
    </Box>
  )
}
