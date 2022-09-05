import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Button, ButtonText, Triangle } from '..'
import { CompanyTypeSector, TagData, TaxonomyType, ViewInterface } from '../../types'
import strings from '../../strings'
import { Paragraph } from '../primitives'
import { ButtonTextProps } from '../ButtonText/ButtonText'
import {
  HasHistoryField,
  HasPendingCQField,
  ViewHistoryProps,
  ViewPendingChangeRequest,
} from '../../pages/CompanyForm/CompanyForm'
import ReasonPopover from '../ReasonPopover'
import { popoverZIndex } from '../../utils/consts'
import { ColumnNames, findCQ, TableNames } from '../../pages/CompanyForm/helpers'
import CompanyContext from '../../pages/CompanyForm/provider/CompanyContext'
import {
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumExpandStatusId,
  ETaxonomyKeys,
  TagTypes,
} from '../../types/enums'
import { Palette } from '../../theme'

const GRID = '125px 46px repeat(7, 115px 30px)'
const EXTRA_WIDTH = '200px'

export type TMapping = { data: TagData[]; buttons?: ButtonTextProps[] }

export type TagMappingProps = ViewInterface<{
  title: string
  typeTech: CompanyTypeSector
  mappings: {
    primary?: TMapping
    aux?: TMapping
    group?: TMapping
  }
  extras?: {
    primary?: TMapping
    aux?: TMapping
    group?: TMapping
  }
  onClickRemove?(type: TaxonomyType, typeTech: CompanyTypeSector, tag: TagData): void
  renderTags?(props: TagMappingGridProps): React.ReactElement
  viewTagsPendingCQFn?: (tag: TagData, columnName: string) => (() => void) | undefined
  viewTagsHistoryFn?: (tag: TagData, columnName: string) => (() => void) | undefined
  numberOfCRs?: number
  setTagPendingRequestType?(type: TagTypes | undefined): void
}> &
  Partial<ViewHistoryProps> &
  Partial<ViewPendingChangeRequest>

export type TagMappingItemProps = ViewInterface<{
  tag: TagData
  onClickRemove?(tag: TagData): void
  columns: string
  isTagMaps?: boolean
  viewTagsPendingCQFn?: (tag: TagData, columnName: string) => (() => void) | undefined
  viewTagsHistoryFn?: (tag: TagData, columnName: string) => (() => void) | undefined
}> &
  Partial<ViewHistoryProps> &
  Partial<ViewPendingChangeRequest>

export const TagMappingItem = ({
  tag,
  sx,
  onClickRemove,
  columns,
  isTagMaps,
  showViewHistory,
  showPendingChangeRequest,
  viewTagsHistoryFn,
  viewTagsPendingCQFn,
}: TagMappingItemProps) => {
  //Context
  const { overviewPendingRequest } = React.useContext(CompanyContext)

  const isAppendCQ = +(tag.fctStatusId || 0) === +EnumExpandStatusId.CHANGE_REQUEST
  const oldValue = tag.fctStatusId
  const SOURCE_NA = 'NA'

  const identity: HasHistoryField = {
    columnName: ColumnNames.FCT_STATUS_ID,
    tableName: TableNames.COMPANIES_TAGS,
    rowId: tag.rowId,
    source: SOURCE_NA as string,
  }

  const { total: numPending } = findCQ<HasPendingCQField>(overviewPendingRequest, identity) || {
    total: 0,
  }

  // const hasPendingRequest = !isAppendCQ && numPending > 0
  const hasHistory =
    !isAppendCQ &&
    showViewHistory?.(identity.tableName, identity.columnName, identity.rowId, identity.source)
  if (isTagMaps) {
    return (
      <>
        <ReasonPopover
          zIndex={popoverZIndex}
          buttons={[]}
          oldValue={oldValue}
          newValue={''}
          setReason={() => {}}
          label={hasHistory ? ' ' : undefined}
          viewHistory={isAppendCQ ? undefined : viewTagsHistoryFn?.(tag, ColumnNames.FCT_STATUS_ID)}
          viewPendingChangeRequest={undefined}
          totalItemPendingCR={numPending}
          disablePopover={true}
        >
          <Grid
            gap={0}
            columns={columns}
            sx={{
              mb: 4,
              p: 3,
              alignItems: 'center',
              borderRadius: 10,
              border: '1px solid black',
              position: 'relative',
              ...sx,
            }}
          >
            {(tag.parent || []).map(
              (p, index) =>
                tag.dimension === p.dimension && (
                  <React.Fragment key={index}>
                    <Paragraph>{p.label}</Paragraph>
                    <Triangle />
                  </React.Fragment>
                )
            )}
            <Paragraph>{tag.label}</Paragraph>
            {onClickRemove && (
              <Button
                sx={{ position: 'absolute', right: 0 }}
                variant="invert"
                size="normal"
                icon="remove"
                onPress={() => onClickRemove(tag)}
              />
            )}
          </Grid>
        </ReasonPopover>
      </>
    )
  }
  return (
    <Grid
      gap={0}
      columns={columns}
      sx={{
        mb: 3,
        p: 3,
        alignItems: 'center',
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
        ...sx,
      }}
    >
      {(tag.parent || []).map(
        (p, index) =>
          tag.dimension === p.dimension && (
            <React.Fragment key={index}>
              <Paragraph>{p.label}</Paragraph>
              <Triangle />
            </React.Fragment>
          )
      )}
      <Paragraph>{tag.label}</Paragraph>
      {onClickRemove && (
        <Button
          sx={{ position: 'absolute', right: 0 }}
          variant="invert"
          size="normal"
          icon="remove"
          onPress={() => onClickRemove(tag)}
        />
      )}
    </Grid>
  )
}

export type TagMappingGridProps = ViewInterface<{
  onClickRemove?(tag: TagData): void
  columns?: string
  title?: string
  type: TaxonomyType
  copy: any
  mapping: TagData[]
  buttons?: ButtonTextProps[]
  renderTag?: (props: TagMappingItemProps) => React.ReactElement
  isTagMaps?: boolean
  viewTagsPendingCQFn?: (tag: TagData, columnName: string) => (() => void) | undefined
  viewTagsHistoryFn?: (tag: TagData, columnName: string) => (() => void) | undefined
}> &
  Partial<ViewHistoryProps> &
  Partial<ViewPendingChangeRequest>

export const TagMappingGrid = ({
  onClickRemove,
  columns = GRID,
  sx,
  mapping,
  title,
  type,
  buttons,
  isTagMaps,
  showViewHistory,
  showPendingChangeRequest,
  viewTagsHistoryFn,
  viewTagsPendingCQFn,
  renderTag = (props: TagMappingItemProps) => <TagMappingItem {...props} />,
}: TagMappingGridProps) => {
  return (
    <Box sx={sx}>
      {type !== ETaxonomyKeys.GROUP && title && (
        <Box mb={12}>
          {!!buttons?.length && (
            <Flex sx={{ justifyContent: 'flex-end', mb: 8 }}>
              {buttons?.map((b, idx) => (
                <ButtonText key={idx} {...b} />
              ))}
            </Flex>
          )}
          <Box sx={{ p: 3, bg: 'darkGray', borderRadius: 10 }}>
            <Paragraph bold sx={{ color: 'white' }}>
              {title}
            </Paragraph>
          </Box>
        </Box>
      )}
      {mapping?.length > 0 &&
        mapping.map((tag, row) => {
          return (
            <React.Fragment key={row}>
              {renderTag({
                tag,
                columns,
                onClickRemove,
                isTagMaps,
                showViewHistory,
                showPendingChangeRequest,
                viewTagsHistoryFn,
                viewTagsPendingCQFn,
              })}
            </React.Fragment>
          )
        })}
    </Box>
  )
}

const TagMapping = ({
  sx,
  title,
  typeTech,
  mappings,
  extras = {},
  onClickRemove,
  showViewHistory,
  viewTagsHistoryFn,
  viewTagsPendingCQFn,
  showPendingChangeRequest,
  numberOfCRs = 0,
  setTagPendingRequestType,
  renderTags = (props: TagMappingGridProps) => <TagMappingGrid {...props} />,
}: TagMappingProps) => {
  const { companyMapping: copy } = strings
  const subs = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5']

  const buildMappings = (title: string, type: TaxonomyType) => {
    const mapping = mappings[type]?.data || []
    const buttons = mappings[type]?.buttons || []
    const extra = extras[type]?.data || []
    const extraBtns = extras[type]?.buttons || []
    const isTagMaps = type === ETaxonomyKeys.GROUP
    const isAux = type === ETaxonomyKeys.AUXILIARY

    if (mapping.length < 1 && extra.length < 1) return null
    return (
      <Box mt={3}>
        {isAux && typeTech === EnumCompanyTypeSector.FIN ? (
          <>
            <Flex>
              <Box sx={{ minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                <TagMappingGrid
                  title={`${title} ${
                    copy.dimension1ByTypeTech[typeTech as keyof typeof copy.dimension1ByTypeTech]
                  }${type === ETaxonomyKeys.AUXILIARY ? 'S' : ''}`}
                  type={type}
                  copy={copy}
                  mapping={[]}
                />
              </Box>
              <Box sx={!isTagMaps ? { flex: '1 1 auto', ml: 12 } : {}}>
                <TagMappingGrid
                  title={`${title} ${copy.dimension.cluster}${
                    type === ETaxonomyKeys.AUXILIARY ? 'S' : ''
                  }`}
                  type={type}
                  copy={copy}
                  mapping={[]}
                />
              </Box>
            </Flex>
            {mapping.map((mp, i) => {
              const sector = [(!mp.parent.length ? [mp] : mp.parent)[0]]
              const cluster =
                mp.dimensionType === EnumDimensionType.SECTOR
                  ? []
                  : [
                      {
                        ...mp,
                        parent:
                          mp.parent?.filter(p => p.dimensionType !== EnumDimensionType.SECTOR) ||
                          [],
                      },
                    ]
              return (
                <Flex key={i}>
                  <Box sx={{ minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                    {renderTags({
                      onClickRemove:
                        typeTech !== EnumCompanyTypeSector.FIN
                          ? tag => onClickRemove && onClickRemove(type, typeTech, tag)
                          : undefined,
                      columns: '',
                      type,
                      copy,
                      mapping: sector,
                      buttons: extraBtns,
                    })}
                  </Box>
                  <Box sx={!isTagMaps ? { flex: '1 1 auto', ml: 12 } : {}}>
                    {renderTags({
                      onClickRemove: tag => onClickRemove && onClickRemove(type, typeTech, tag),
                      columns: GRID,
                      type,
                      copy,
                      mapping: cluster,
                      buttons,
                      isTagMaps,
                      showViewHistory,
                      showPendingChangeRequest,
                      viewTagsHistoryFn,
                      viewTagsPendingCQFn,
                    })}
                  </Box>
                </Flex>
              )
            })}
          </>
        ) : (
          <Flex mt={2}>
            {!isTagMaps && (
              <Box sx={{ minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                {renderTags({
                  onClickRemove:
                    typeTech !== EnumCompanyTypeSector.FIN
                      ? tag => onClickRemove && onClickRemove(type, typeTech, tag)
                      : undefined,
                  columns: '',
                  type,
                  title: `${title} ${
                    copy.dimension1ByTypeTech[typeTech as keyof typeof copy.dimension1ByTypeTech]
                  }${type === ETaxonomyKeys.AUXILIARY ? 'S' : ''}`,
                  copy,
                  mapping: extra,
                  buttons: extraBtns,
                })}
              </Box>
            )}
            <Box sx={!isTagMaps ? { flex: '1 1 auto', ml: 12 } : {}}>
              {renderTags({
                onClickRemove: tag => onClickRemove && onClickRemove(type, typeTech, tag),
                columns: GRID,
                type,
                title: `${title} ${copy.dimension.cluster}${
                  type === ETaxonomyKeys.AUXILIARY ? 'S' : ''
                }`,
                copy,
                mapping,
                buttons,
                isTagMaps,
                showViewHistory,
                showPendingChangeRequest,
                viewTagsHistoryFn,
                viewTagsPendingCQFn,
              })}
            </Box>
          </Flex>
        )}
      </Box>
    )
  }

  const {
    pages: {
      addCompanyForm: { taxonomy },
    },
  } = strings

  return (
    <Box sx={sx}>
      <Flex sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', ml: 0, mb: 4 }}>
        <Paragraph bold>{title}</Paragraph>
        {!!numberOfCRs && title === taxonomy.tagMapping.tagMaps && (
          <ButtonText
            onPress={() => {
              setTagPendingRequestType && setTagPendingRequestType(TagTypes.TAG)
            }}
            label={strings.common.viewPendingChangeRequest + ` (${numberOfCRs})`}
            sx={{ borderBottom: 0, color: Palette.orange, whiteSpace: 'nowrap' }}
          />
        )}
      </Flex>
      {!mappings.group && (
        <Grid gap={0} columns={`${EXTRA_WIDTH} auto`}>
          <Paragraph sx={{ flex: 1 }} bold>
            {copy.dimension1ByTypeTech[typeTech as keyof typeof copy.dimension1ByTypeTech]}
          </Paragraph>
          <Grid gap={0} columns={GRID} sx={{ alignItems: 'center', px: 3 }}>
            {subs.map((s, index) => (
              <React.Fragment key={s}>
                <Paragraph sx={{ flex: 1 }} bold>
                  {copy.headers[s as keyof typeof copy.headers]}
                </Paragraph>
                {index < subs.length - 1 && <Triangle />}
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
      )}
      {buildMappings(copy.primary, 'primary')}
      {buildMappings(copy.aux, 'aux')}
      {buildMappings('', 'group')}
    </Box>
  )
}

export default TagMapping
