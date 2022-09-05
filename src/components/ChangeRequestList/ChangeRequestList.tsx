import moment from 'moment'
import React from 'react'
import { useCallback } from 'react'
import { useLayoutEffect } from 'react'
import { useState } from 'react'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { ETLRunTimeContext } from '../../context'
import { ChangeRequestResultType } from '../../pages/ChangeRequestManagement/ChangeRequestManagement'
import { formatFields, tableUrl } from '../../pages/ChangeRequestManagement/helpers'
import { TableNames } from '../../pages/CompanyForm/helpers'
import strings from '../../strings'
import { Palette } from '../../theme'
import { ViewInterface } from '../../types'
import { EnumTagGroupSource, Routes } from '../../types/enums'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'
import Button from '../Button'
import Icon from '../Icon'
import { handleValue, IPengdingCQData } from '../PendingChangeRequest/PendingChangeRequest'
import { Paragraph } from '../primitives'
import Tooltip from '../Tooltip'

const { changeRequest: copy } = strings

const getReasonGrid = () => {
  const innerWidth = window.innerWidth
  if (innerWidth >= 2560) {
    return '3fr'
  } else if (innerWidth >= 1920) {
    return '2.6fr'
  }
  return '1.5fr'
}

export const handleCRType = (item: IPengdingCQData) => {
  switch (item.tableName) {
    case TableNames.INVESTOR: {
      return copy.entityType.investor
    }
    case TableNames.PEOPLE: {
      return copy.entityType.people
    }
    case TableNames.TECHNOLOGY_PROVIDER: {
      return copy.entityType.techProvider
    }
    case TableNames.CURRENT_CLIENTS: {
      return copy.entityType.currentClient
    }
    default: {
      return copy.entityType.company
    }
  }
}

const GRID = `0.6fr 1fr 0.6fr 0.8fr 1fr 1fr 1fr 1fr 0.5fr 0.45fr ${getReasonGrid()}`

type Props = {
  data: ChangeRequestResultType[]
  setApprovedCR(cr: IPengdingCQData): void
  setRejectCR(cr: IPengdingCQData[]): void
}

const Item = ({
  sx,
  data,
  expanded,
  setExpanded,
  onApproved,
  onRejectCR,
}: ViewInterface<{
  data: ChangeRequestResultType
  expanded: boolean
  setExpanded(): void
  onApproved(item: IPengdingCQData): void
  onRejectCR(item: IPengdingCQData[]): void
}>) => {
  const [isHover, setIsHover] = useState<number | undefined>()
  const [maxWidth, setMaxWidth] = useState<string | undefined>()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const onHover = (index: number) => {
    if (isHover === undefined && (data.dataOverride.length === 1 || expanded)) {
      setIsHover(index)
    }
  }

  useLayoutEffect(
    () => setMaxWidth(`calc(${document.getElementById(`column-name`)?.offsetWidth}px - 24px)`),
    [setMaxWidth]
  )

  const handleUrl = (
    table: string,
    companyId: number | string,
    { rowId, columName, tableName, source }: any
  ) => {
    if (tableName !== TableNames.COMPANIES_TAGS) {
      const url = columName === 'news_status' ? Routes.EDIT_COMPANY_NEWS : tableUrl(table)
      // table feedly id needs to be encoded in url
      const encodeIdTables = [TableNames.PARTNERSHIPS, TableNames.NEWS]
      const id = (() => {
        switch (tableName) {
          case TableNames.TECHNOLOGY:
            return `technology_${rowId}`
          case TableNames.CERTIFICATION:
            return `certification_${rowId}`
          case TableNames.COMPANY_TECHNOLOGY_PROVIDER:
            return `companyprovider_${rowId}`
          case TableNames.TECHNOLOGY_PROVIDER:
            return `provider_${rowId}`
          case TableNames.COMPANIES_PEOPLE:
            return `status_${rowId}`
          case TableNames.JOB_TITLE:
            return `jobtitle_${rowId}`
          case TableNames.CURRENT_CLIENTS:
            return `client_${rowId}`
          case TableNames.COMPANIES_CURRENT_CLIENTS:
            return `client_${rowId}`
          case TableNames.FINANCE_SERVICES_LICENSES:
            return `license_${rowId}`
          default:
            if (encodeIdTables.includes(tableName)) {
              return encodeURIComponent(rowId)
            }
            return rowId
        }
      })()
      return url.replace(':id', `${companyId}`).replace(':cr', `${id}`)
    }
    const subUrl = source === EnumTagGroupSource.BCG ? 'tag' : 'fintechtype'
    return Routes.EDIT_COMPANY_TAXONOMY_CR.replace(':id', `${companyId}`).replace(
      ':cr',
      `${subUrl}`
    )
  }

  const openTab = useCallback((table, companyId, { rowId, columName, tableName, source }) => {
    console.log(table, companyId, { rowId, columName, tableName, source })
    const url = handleUrl(table, companyId, { rowId, columName, tableName, source })

    const redirectCondition =
      tableName !== TableNames.TECHNOLOGY_PROVIDER && tableName !== TableNames.PEOPLE

    redirectCondition && window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <Box sx={{ border: expanded ? `1px solid ${Palette.primary}` : '', borderRadius: 10, ...sx }}>
      {(expanded ? data.dataOverride : [data.dataOverride[0]]).map((item, index) => {
        const newValue = handleValue(item, item.newValue)
        const oldValue = handleValue(item, item.oldValue)
        const generateId = (name: string) => `${name}-${item.dataOverrideId}`
        const type = handleCRType(item)
        const date = moment(item.date).format(DEFAULT_VIEW_DATE_FORMAT)
        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              cursor: data.dataOverride.length > 1 && index === 0 ? 'pointer' : 'auto',
            }}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => isHover !== undefined && setIsHover(undefined)}
            onMouseOver={() => onHover(index)}
            onClick={() => {
              if (data.dataOverride.length > 1 && index === 0) {
                setExpanded()
              }
            }}
          >
            <Grid
              gap={2}
              columns={GRID}
              sx={{
                px: 3,
                py: 14,
                borderRadius: 10,
                bg: isHover === index ? 'bgPrimary' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={date}
                  id={generateId(item.date)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {date}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={item.user}
                  id={generateId(item.user)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.user}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={type}
                  id={generateId(type)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      maxWidth: maxWidth,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {type}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={data.name}
                  id={generateId(data.name)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      maxWidth: maxWidth,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {data.name}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={item.tableName}
                  id={generateId(item.tableName)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.tableName}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box id={generateId(`column-name`)}>
                <Flex sx={{ alignItems: 'center', width: '100%' }}>
                  <Tooltip
                    sx={{ ml: -3, maxWidth: 514 }}
                    content={formatFields(data.columnName)}
                    id={generateId(data.columnName)}
                    isWhite
                  >
                    <Flex>
                      {index === 0 && data.dataOverride.length > 1 && <Icon icon="indicatorDown" />}
                      {index > 0 && (
                        <Box>
                          <Box
                            sx={{
                              borderLeft: '1px solid #D8D8D8',
                              height: `${index + 1 === data.dataOverride.length ? '55' : '100'}%`,
                              margin: '0 8px',
                            }}
                          />
                        </Box>
                      )}
                      <Text
                        sx={{
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          // py: 16,
                        }}
                      >
                        {formatFields(data.columnName)}
                        {data.dataOverride.length > 1 && index === 0 && (
                          <Text as="span" sx={{ color: 'primary' }}>
                            {` (${data.dataOverride.length})`}
                          </Text>
                        )}
                      </Text>
                    </Flex>
                  </Tooltip>
                  {item.companyId && (
                    <Box
                      sx={{ cursor: 'pointer', ml: 2, mt: 1 }}
                      onClick={event => {
                        event.preventDefault()
                        openTab(item.tableName, item.companyId, {
                          rowId: item.rowId,
                          columName: item.columnName,
                          tableName: item.tableName,
                          source: item.source,
                        })
                      }}
                    >
                      <Icon icon="link" color="primary" />
                    </Box>
                  )}
                </Flex>
              </Box>

              <Box>
                {typeof oldValue === 'string' || typeof oldValue === 'number' ? (
                  <Tooltip
                    sx={{ ml: -3, maxWidth: 514 }}
                    content={`${oldValue}`}
                    id={generateId(`${oldValue}`)}
                    isWhite
                  >
                    <Paragraph
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {`${oldValue}`}
                    </Paragraph>{' '}
                  </Tooltip>
                ) : (
                  oldValue
                )}
              </Box>

              <Box>
                {typeof newValue === 'string' || typeof newValue === 'number' ? (
                  <Tooltip
                    sx={{ ml: -3, maxWidth: 514 }}
                    content={`${newValue}`}
                    id={generateId(`${newValue}`)}
                    isWhite
                  >
                    <Paragraph
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {`${newValue}`}
                    </Paragraph>
                  </Tooltip>
                ) : (
                  newValue
                )}
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={item.inputSource}
                  id={generateId(item.inputSource)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.inputSource || ''}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={item.selfDeclared ? 'Yes' : ''}
                  id={generateId(`${item.selfDeclared}`)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.selfDeclared ? 'Yes' : ''}
                  </Paragraph>
                </Tooltip>
              </Box>

              <Box>
                <Tooltip
                  sx={{ ml: -3, maxWidth: 514 }}
                  content={item.comment}
                  id={generateId(item.comment)}
                  isWhite
                >
                  <Paragraph
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.comment}
                  </Paragraph>
                </Tooltip>
              </Box>
            </Grid>
            {isHover === index && (
              <Flex sx={{ position: 'absolute', right: 0, top: 0, height: '100%', mr: 3 }}>
                <Button
                  sx={{ mr: 3, bg: 'green' }}
                  icon="tick"
                  size="tiny"
                  onPress={e => {
                    e?.stopPropagation()
                    if (!checkTimeETL()) return
                    onApproved(item)
                  }}
                />
                <Button
                  sx={{ mr: 3, bg: 'red' }}
                  icon="remove"
                  size="tiny"
                  onPress={e => {
                    e?.stopPropagation()
                    if (!checkTimeETL()) return
                    onRejectCR([item])
                  }}
                />
              </Flex>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

const ChangeRequestList = ({ data, setApprovedCR, setRejectCR }: Props) => {
  const [expanded, setExpanded] = useState<number>(-1)

  return (
    <>
      <Grid
        gap={2}
        columns={GRID}
        sx={{
          alignItems: 'center',
          borderRadius: 10,
          p: 3,
        }}
      >
        <Paragraph sx={{}} bold>
          {copy.grid.date}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.user}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.type}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.name}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.table}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.field}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.curValue}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.newValue}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.inputSource}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.selfDeclared}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.reason}
        </Paragraph>
      </Grid>
      {data.map((cr, index) => {
        return (
          <Item
            sx={{ bg: index % 2 === 0 ? 'gray03' : 'transparent' }}
            key={index}
            data={cr}
            expanded={index === expanded}
            setExpanded={() => setExpanded(index === expanded ? -1 : index)}
            onApproved={setApprovedCR}
            onRejectCR={setRejectCR}
          />
        )
      })}
    </>
  )
}

export default ChangeRequestList
