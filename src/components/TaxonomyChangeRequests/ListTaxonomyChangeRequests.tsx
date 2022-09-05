import { Box, Flex, Grid } from '@theme-ui/components'
import { startCase, uniq } from 'lodash'
import React from 'react'
import { Button, Icon, Pill, Tooltip, Updating } from '..'
import { TaxonomyChangeRequest } from '../../graphql/query/getAllTaxonomyChangeRequets'
import { Value2LabelPipe } from '../../pages/CompanyForm/helpers'
import { expandStatus } from '../../pages/CompanyForm/mock'
import { Palette } from '../../theme'
import { DIMENSION_TYPE, TAXONOMY_HISTORY_DATE_FORMAT } from '../../utils/consts'
import { AppTable, AppTableProps } from '../AppTable/AppTable'
import { Paragraph } from '../primitives'
import moment from 'moment'
import { mapIcon } from '../Pill/Pill'
import { EnumExpandStatusId, Routes } from '../../types/enums'
import ListRequestEmpty from '../ListRequetsEmpty'
import { isOverrideUserFn, IUser } from '../../context/UserContext'

type TCellData = TaxonomyChangeRequest

type Props = {
  data: TCellData[]
  loading?: boolean
  handleApprove?(rows: TCellData[]): void
  handleReject?(rows: TCellData[]): void
  user: IUser
  alwayShowBtns?: boolean
  disableRedirect?: boolean
}

const ListTaxonomyChangeRequests = ({ loading = false, ...content }: Props) => {
  return <>{loading ? <Updating loading noPadding /> : <Content {...content} />}</>
}

export default ListTaxonomyChangeRequests

const GAP = '0px'
const CELL_SIZE = `calc(${100 / 26}%)`
const GRID = `
[user] repeat(2, ${CELL_SIZE}) [user-end] 0px 
[table] repeat(4, ${CELL_SIZE}) [table-end] 0px
[company] repeat(3, ${CELL_SIZE}) [company-end] 0px
[name] repeat(4, ${CELL_SIZE}) [name-end] 0px
[status] repeat(2, ${CELL_SIZE}) [status-end] 0px
[isPrimary] repeat(2, ${CELL_SIZE}) [isPrimary-end] 0px
[type] repeat(2, ${CELL_SIZE}) [type-end] 0px
[inputSource] repeat(2, ${CELL_SIZE}) [inputSource-end] 0px
[selfDeclared] repeat(2, ${CELL_SIZE}) [selfDeclared-end] 0px
[reason] repeat(3, ${CELL_SIZE}) [reason-end] 0px`

const RENDER_FIELDS: { field: keyof TCellData; gridColumn: string; header: string }[] = [
  { field: 'user', header: 'User', gridColumn: `user /user-end` },
  { field: 'tableName', header: 'Table Name', gridColumn: `table /table-end` },
  { field: 'companyName', header: 'Company Name', gridColumn: `company /company-end` },
  { field: 'name', header: 'Name', gridColumn: `name /name-end` },
  { field: 'newValue', header: 'Status', gridColumn: `status /status-end` },
  { field: 'isPrimary', header: 'Primary', gridColumn: `isPrimary /isPrimary-end` },
  { field: 'dimension', header: 'Type', gridColumn: `type /type-end` },
  { field: 'inputSource', header: 'Input Source', gridColumn: `inputSource /inputSource-end` },
  { field: 'selfDeclared', header: 'Self Declared', gridColumn: `selfDeclared /selfDeclared-end` },
  { field: 'comment', header: 'Reason', gridColumn: `reason /reason-end` },
]

type ContentProps = Omit<Props, 'loading'>

const Content = ({
  data,
  user,
  handleApprove = () => {},
  handleReject = () => {},
  alwayShowBtns,
  disableRedirect,
}: ContentProps) => {
  const links = uniq(data.map(d => d.linkId))

  const isOverrideUser = isOverrideUserFn(user)

  if (!data.length) return <ListRequestEmpty />
  return (
    <>
      <Grid gap={GAP} columns={GRID} sx={{ alignItems: 'center' }}>
        {RENDER_FIELDS.map(({ header, gridColumn }) => (
          <Paragraph bold key={header} sx={{ gridColumn, p: 8 }}>
            {header}
          </Paragraph>
        ))}
      </Grid>

      {links.map((link, idx) => {
        const rows = data.filter(i => i.linkId === link)
        return (
          <Box key={idx} sx={{ '&:hover': { '& .buttons': { display: 'flex' } } }}>
            <Flex
              sx={{
                bg: Palette.gray03,
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 10,
                height: 44,
              }}
            >
              <Paragraph sx={{ p: 8 }}>
                {moment(rows[0].auditTimestamp).format(TAXONOMY_HISTORY_DATE_FORMAT)}
              </Paragraph>
              <Box className="buttons" sx={{ display: alwayShowBtns ? 'flex' : 'none' }}>
                {isOverrideUser && (
                  <Button
                    sx={{ mr: 3, bg: Palette.primary }}
                    icon="tick"
                    size="tiny"
                    onPress={e => handleApprove(rows)}
                  />
                )}
                {(isOverrideUser || user.email === rows[0].user) && (
                  <Button
                    sx={{ mr: 3, bg: Palette.red }}
                    icon="remove"
                    size="tiny"
                    onPress={e => handleReject(rows)}
                  />
                )}
              </Box>
            </Flex>
            <TaxonomyChangeRequestTable
              disableRedirect={disableRedirect}
              data={rows}
              gap={GAP}
              grid={GRID}
              headers={[]}
            />
          </Box>
        )
      })}
    </>
  )
}

export const TaxonomyChangeRequestTable = ({
  data,
  grid = GRID,
  gap,
  headers = RENDER_FIELDS.map(({ header, gridColumn }) => ({
    render: () => (
      <Paragraph sx={{ gridColumn, color: 'grey', p: 8 }} key={header}>
        {header}
      </Paragraph>
    ),
  })),
  disableRedirect,
}: Pick<Props, 'data'> & Partial<AppTableProps<TCellData>> & { disableRedirect?: boolean }) => {
  const cellProps = (item: TCellData) => {
    return {
      p: 8,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      opacity: item.newValue === EnumExpandStatusId.UNFOLLOWED ? 0.5 : undefined,
    }
  }

  const renderCell = (field: keyof TCellData, gridColumn: string) => (
    item: TCellData,
    idx: number
  ) => {
    let value: string = `${item[field] || ''}`
    if (field === 'columnName') {
      value = startCase(item[field] || '')
    } else if (field === 'newValue') {
      value = `${Value2LabelPipe(expandStatus, item[field] || '') || ''}`
    } else if (field === 'selfDeclared') {
      value = item[field] === 1 ? 'Yes' : 'No'
    } else if (field === 'isPrimary') {
      value = item[field] === 1 ? 'Primary' : 'Auxiliary'
    } else if (field === 'dimension') {
      if (item.category && item.dimension)
        value = (DIMENSION_TYPE[item.category] || {})[item.dimension] || ''
      else value = 'Category'
    }

    return (
      <Box sx={{ gridColumn, ...cellProps(item), gap: 2 }}>
        <Tooltip
          sx={{ ml: -3, maxWidth: 514 }}
          divSx={{ width: '100%' }}
          contentSx={{ width: '100%' }}
          content={value}
          id={`${value}-${idx}`}
          isWhite
        >
          <Flex
            sx={{
              alignItems: 'center',
            }}
          >
            {field === 'name' && item.category && mapIcon[item.category] && (
              <Pill sx={{ mr: 1 }} icon={item.category} />
            )}
            <Paragraph sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {value}
            </Paragraph>
            {field === 'companyName' && !disableRedirect && (
              <Box
                sx={{ cursor: 'pointer', ml: 2, mt: 1 }}
                onClick={event => {
                  event.preventDefault()
                  const url = Routes.EDIT_COMPANY_TAXONOMY.replace(':id', `${item.companyId}`)
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
              >
                <Icon icon="link" color="primary" />
              </Box>
            )}
          </Flex>
        </Tooltip>
      </Box>
    )
  }
  const columns = RENDER_FIELDS.map(({ field, gridColumn }) => ({
    render: renderCell(field, gridColumn),
  }))
  return (
    <Box sx={{ width: '100%' }}>
      <AppTable gap={gap} grid={grid} headers={headers} columns={columns} data={data} />
    </Box>
  )
}
