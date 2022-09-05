import { Box, Flex, Grid, Label } from '@theme-ui/components'
import React from 'react'
import { Updating } from '..'
import { Palette } from '../../theme'
import { IReport } from '../../types'
import { ReportItem, GRID } from '../ReportItem'

export type Props = {
  reports: IReport[]
  onDownload(item: IReport): Promise<void>
  onEdit(item: IReport): void
  loading?: boolean
}

export default (props: Props) => {
  const { reports = [] } = props

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid columns={GRID} sx={{ alignItems: 'center' }}>
        <Label sx={{ gridColumn: 'issue / issue-end', whiteSpace: 'nowrap' }}>Issue No.</Label>
        <Label sx={{ gridColumn: 'name / name-end' }}>Name</Label>
        <Label sx={{ gridColumn: 'version / version-end' }}>Version</Label>
        <Label sx={{ gridColumn: 'published / published-end' }}>Published date</Label>
        <Label sx={{ gridColumn: 'uploaded / uploaded-end' }}>Uploaded date</Label>
        <Label sx={{ gridColumn: 'expandStatus / expandStatus-end' }}>FCT status</Label>
      </Grid>

      {reports.map((r: IReport, index: number) => (
        <React.Fragment key={index}>
          <ReportItem
            sx={{
              bg: index % 2 === 0 ? Palette.gray03 : Palette.white,
              cursor: 'pointer',
              '&:hover': {
                bg: Palette.bgGray,
              },
            }}
            report={r}
            buttons={[
              {
                icon: 'download2',
                onPress: async () => {
                  await props.onDownload(r)
                },
              },
              {
                icon: 'pencil',
                onPress: () => {
                  props.onEdit(r)
                },
              },
            ]}
          />
        </React.Fragment>
      ))}

      {props.loading && (
        <Flex
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.6,
            bg: 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Updating loading />
        </Flex>
      )}
    </Box>
  )
}
