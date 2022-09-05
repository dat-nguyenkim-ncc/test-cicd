import React from 'react'
import { ChartHealthCheck, Dropdown, Updating } from '../../../components'
import { Section } from '../../../components/primitives'
import {
  dataChartItemResult,
  HealthCheckChartResult,
  CHART_TIME_FRAME_OPTIONS,
  convertChartResult,
} from '../helpers'
import { Box, Flex, Label, SxStyleProp } from 'theme-ui'
import { FormOption } from '../../../types'

type HealthCheckChartProps = {
  chartData: HealthCheckChartResult[]
  chartLoading: boolean
  timeFrameValue: FormOption['value']
  hanldeTimeFrameOptionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  sx?: SxStyleProp | undefined
}

const HealthCheckChart = ({
  chartData,
  chartLoading,
  timeFrameValue,
  hanldeTimeFrameOptionChange,
  sx,
}: HealthCheckChartProps) => {
  return (
    <Section sx={{ ...sx }}>
      {/* Time frame */}
      <Flex sx={{ flexDirection: 'row', mb: 3 }}>
        {/* Offset left auto */}
        <Box sx={{ flex: '1 1 auto' }}> </Box>

        {/* Time frame options */}
        <Flex sx={{ flexWrap: 'nowrap' }}>
          <Label htmlFor="timeFrame" sx={{ pt: 3, pr: 3 }}>
            Time frame
          </Label>
          <Dropdown
            // overide minWidth 150px
            sx={{ minWidth: 'auto', mr: 1 }}
            name="timeFrame"
            value={timeFrameValue}
            onChange={hanldeTimeFrameOptionChange}
            options={CHART_TIME_FRAME_OPTIONS}
          />
        </Flex>
      </Flex>

      {/* Chart */}
      {chartLoading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <Box sx={{ flexDirection: 'row', display: 'flex', gap: '10px' }}>
          {convertChartResult(chartData).map((item: dataChartItemResult, idx: number) => (
            <ChartHealthCheck data={item || []} key={idx} />
          ))}
        </Box>
      )}
    </Section>
  )
}

export default HealthCheckChart
