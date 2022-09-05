import { Box, Flex, Grid } from '@theme-ui/components'
import React from 'react'
import { Button, Switch } from '..'
import { IReport, ViewInterface } from '../../types'
import { CELL_BUFFER, CELL_SIZE } from '../../utils/consts'
import { ButtonProps } from '../Button/Button'
import { Paragraph } from '../primitives'
import moment from 'moment'
import { EnumExpandStatusId } from '../../types/enums'
import { ReportManagementContext } from '../../pages/ReportManagement/context'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export const GRID = `
  ${CELL_BUFFER}
  [issue] repeat(2, ${CELL_SIZE}) 
  [issue-end] 
  ${CELL_BUFFER}
  [name] repeat(8, ${CELL_SIZE}) 
  [name-end]
  ${CELL_BUFFER}
  [version] repeat(3, ${CELL_SIZE}) 
  [version-end]
  ${CELL_BUFFER}
  [published] repeat(3, ${CELL_SIZE}) 
  [published-end]
  ${CELL_BUFFER}
  [uploaded] repeat(3, ${CELL_SIZE}) 
  [uploaded-end]
  ${CELL_BUFFER}
  [expandStatus] repeat(3, ${CELL_SIZE}) 
  [expandStatus-end] 
  ${CELL_BUFFER}
  [action] repeat(2, ${CELL_SIZE}) 
  [action-end]
`

export type Props = ViewInterface<{
  report: IReport
  buttons: ButtonProps[]
}>

export default (props: Props) => {
  const { report } = props
  const [isLoading, setIsLoading] = React.useState(false)
  const context = React.useContext(ReportManagementContext)

  return (
    <Box>
      <Grid
        columns={GRID}
        sx={{
          alignItems: 'center',
          minHeight: '40px',
          borderRadius: 10,
          py: 2,
          ...props.sx,
        }}
      >
        <Paragraph sx={{ gridColumn: 'issue / issue-end' }}>{`${report.issueNumber}`}</Paragraph>
        <Paragraph sx={{ gridColumn: 'name / name-end' }}>{report.name || ''}</Paragraph>
        <Paragraph sx={{ gridColumn: 'version / version-end' }}>
          {report.version ? `${report.version}` : ''}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'published / published-end' }}>
          {report.publishedDate ? moment(report.publishedDate).format(DEFAULT_VIEW_DATE_FORMAT) : ''}
        </Paragraph>
        <Paragraph sx={{ gridColumn: 'uploaded / uploaded-end' }}>
          {report.uploadedDate ? moment(report.uploadedDate).format(DEFAULT_VIEW_DATE_FORMAT) : ''}
        </Paragraph>
        <Box sx={{ gridColumn: 'expandStatus / expandStatus-end' }}>
          <Switch
            onToggle={() => {
              context.editReport({
                issueNumber: report.issueNumber,
                version: report.version,
                name: report.name,
                publishedDate: report.publishedDate,
                description: report.description,
                expandStatus:
                  report.expandStatus !== +EnumExpandStatusId.FOLLOWING
                    ? +EnumExpandStatusId.FOLLOWING
                    : +EnumExpandStatusId.UNFOLLOWED,
              })
            }}
            checked={report.expandStatus === +EnumExpandStatusId.FOLLOWING}
            sx={{ width: 53 }}
          />
        </Box>
        <Flex sx={{ gridColumn: 'action / action-end' }}>
          {props.buttons.map((b, index) => (
            <Button
              sx={{ height: 'auto' }}
              key={index}
              color="primary"
              variant="invert"
              icon={b.icon}
              onPress={async () => {
                try {
                  setIsLoading(true)
                  b.onPress && (await b.onPress())
                } catch (e) {
                  throw e
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading || b.disabled}
            />
          ))}
        </Flex>
      </Grid>
    </Box>
  )
}
