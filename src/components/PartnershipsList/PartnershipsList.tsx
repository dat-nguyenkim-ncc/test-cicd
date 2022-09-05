import React from 'react'
import { Avatar, Box, Flex, Grid } from 'theme-ui'
import { ButtonText, Icon } from '..'
import { Partnership, PartnershipGroupType } from '../../types'
import { EnumExpandStatusId, Routes } from '../../types/enums'
import { Paragraph } from '../primitives'
import logo from '../CompanyLogo/logo.png'
import { formatDate } from '../../utils'
import PartnershipItem, { ITEM_GRID } from '../PartnershipItem/PartnershipItem'

type Props = {
  data: PartnershipGroupType[]
  isEdit?: boolean
  onChange?(data: PartnershipGroupType[]): void
  refetchViewHistoryCols?(): void
}

const GRID = ['1.5fr 0.2fr 0.6fr 2fr 0.2fr']

export default function PartnershipsList({
  data,
  isEdit = false,
  onChange = () => {},
  refetchViewHistoryCols = () => {},
}: Props) {
  return (
    <>
      <Box sx={{ mt: 5 }}>
        <Grid gap={2} columns={GRID} sx={{ p: 2 }}>
          <Paragraph sx={{ color: 'primary' }} bold>
            Partner
          </Paragraph>
          <Paragraph sx={{ color: 'primary' }} bold>
            #
          </Paragraph>
          <Paragraph sx={{ color: 'primary' }} bold>
            Most Recent
          </Paragraph>
          <Paragraph sx={{ color: 'primary' }} bold>
            Details
          </Paragraph>
        </Grid>
        {data.map((p: any, index: number) => (
          <PartnershipGroup
            key={index}
            data={p}
            isEdit={isEdit}
            refetchViewHistoryCols={refetchViewHistoryCols}
            updateStatus={(id: number, newStatus: EnumExpandStatusId) => {
              onChange(
                data.map((item, i) => ({
                  ...item,
                  partnerships: item.partnerships.map(p => ({
                    ...p,
                    fctStatusId: p.id === id ? newStatus : p.fctStatusId,
                    partnerDetails: p.partnerDetails.map(partner => ({
                      ...partner,
                      fctStatusId: partner.id === id ? newStatus : partner.fctStatusId,
                    })),
                  })),
                }))
              )
            }}
          />
        ))}
      </Box>
    </>
  )
}

const PartnershipGroup = ({
  data,
  isEdit,
  refetchViewHistoryCols,
  updateStatus,
}: {
  data: { name: string; logoUrl?: string; companyId?: number; partnerships: Partnership[] }
  isEdit: boolean
  refetchViewHistoryCols(): void
  updateStatus(id: number, newStatus: EnumExpandStatusId): void
}) => {
  const [expand, setExpand] = React.useState<boolean>(false)
  const handleOpenUrl = React.useCallback(
    e => {
      if (data.companyId) {
        e.stopPropagation()
        const url = Routes.COMPANY.replace(':id', `${data.companyId}`)
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    },
    [data.companyId]
  )

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'gray03',
        borderRadius: 10,
        my: 3,
      }}
    >
      {/* Header */}
      <Grid
        gap={2}
        columns={expand ? ['1fr'] : GRID}
        sx={{ cursor: 'pointer', alignItems: 'center' }}
        onClick={() => {
          setExpand(!expand)
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <Avatar
            src={data.logoUrl || logo}
            size="48"
            sx={{ borderRadius: 4, minWidth: 48 }}
          ></Avatar>
          <Paragraph
            sx={{ ml: 3, color: data.companyId ? 'primary' : 'default', fontSize: 18 }}
            onClick={handleOpenUrl}
            bold
          >
            {data.name}
          </Paragraph>
        </Flex>
        {!expand && data.partnerships[0] && (
          <>
            <Paragraph>{`${data.partnerships.length}`}</Paragraph>
            <Paragraph>{formatDate(data.partnerships[0].date)}</Paragraph>
            <Paragraph>{data.partnerships[0].title}</Paragraph>
            <Icon sx={{ pr: 3 }} icon="arrow" />
          </>
        )}
      </Grid>
      {/* Body Expand */}
      {expand && (
        <PartnershipGroupContent
          data={data.partnerships}
          isEdit={isEdit}
          refetchViewHistoryCols={refetchViewHistoryCols}
          updateStatus={updateStatus}
        />
      )}
    </Box>
  )
}

const PartnershipGroupContent = ({
  data = [],
  isEdit,
  refetchViewHistoryCols,
  updateStatus,
}: {
  data: Partnership[]
  isEdit: boolean
  refetchViewHistoryCols(): void
  updateStatus(id: number, newStatus: EnumExpandStatusId): void
}) => {
  const [showAll, setShowAll] = React.useState<boolean>(false)

  return (
    <Box sx={{ mt: 3 }}>
      <Grid
        gap={2}
        columns={isEdit ? ITEM_GRID.EDIT : ITEM_GRID.NOT_EDIT}
        sx={{ alignItems: 'center', px: 3, py: 1 }}
      >
        <Paragraph bold>Date</Paragraph>
        <Paragraph bold>Other partners</Paragraph>
        <Paragraph bold>Title</Paragraph>
        <Paragraph bold>Detail</Paragraph>
      </Grid>
      {(showAll ? data : data.slice(0, 3)).map(partnership => (
        <PartnershipItem
          key={partnership.id}
          partnership={partnership}
          isEdit={isEdit}
          refetchViewHistoryCols={refetchViewHistoryCols}
          updateStatus={updateStatus}
        />
      ))}

      {data.length > 3 && (
        <ButtonText
          sx={{ my: 2, mx: 1 }}
          onPress={() => {
            setShowAll(!showAll)
          }}
          label={!showAll ? 'Show all' : 'Show less'}
          icon={showAll ? 'indicatorUp' : 'indicatorDown'}
          color="primary"
        />
      )}
    </Box>
  )
}
