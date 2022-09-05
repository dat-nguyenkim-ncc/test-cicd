import React from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Box } from 'theme-ui'
import { Paragraph } from '../../../../../primitives'
import {
  CHART_THREADS,
  CompanyNewsChartResult,
  formatNegativeNumberToString,
  formatSentimentChartDate,
  GRAY_COLOR,
  isNullOrUndefined,
  NEGATIVE_COLOR,
  POSITIVE_COLOR,
  xAxisTicksFactory,
  yAxisTicksFactory,
} from './helpers'

type Props = { companyNewsChartRes: CompanyNewsChartResult }

function SentimentChart({ companyNewsChartRes }: Props) {
  if (!companyNewsChartRes?.sentimentChartData)
    return <Paragraph center>SENTIMENT CHART IS NOT AVAILABLE</Paragraph>

  const sentimentChartData = formatSentimentChartDate(companyNewsChartRes?.sentimentChartData)
  const yAxisTicks = yAxisTicksFactory(sentimentChartData)
  return (
    <Box sx={{ mt: 5 }}>
      <Box sx={{ textAlign: 'center', color: '#444', whiteSpace: 'pre-wrap' }}>
        <b>
          {!isNullOrUndefined(companyNewsChartRes.thirtyDaysAverage) &&
            `30 days average = ${formatNegativeNumberToString(
              companyNewsChartRes.thirtyDaysAverage
            )}\t\t`}

          {!isNullOrUndefined(companyNewsChartRes.trend) &&
            `Trend = ${formatNegativeNumberToString(companyNewsChartRes.trend)}`}
        </b>
      </Box>

      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart
          data={sentimentChartData}
          barGap={-8}
          barCategoryGap={2}
          margin={{ top: 36, bottom: 36, left: 24, right: 12 }}
        >
          <CartesianGrid strokeDasharray="10 0" vertical={false} />
          <XAxis
            name="Date"
            dataKey="date"
            tickMargin={12}
            ticks={xAxisTicksFactory(sentimentChartData)}
            height={60}
          />
          <YAxis
            tickMargin={16}
            axisLine={false}
            domain={[yAxisTicks[0], yAxisTicks[yAxisTicks.length - 1]]}
            ticks={yAxisTicks}
            type="number"
            tickSize={0}
            tickCount={7}
          >
            {/* Left title */}
            <Label
              style={{ textAnchor: 'middle', fill: '#444' }}
              position="insideLeft"
              offset={-15}
              angle={-90}
            >
              {CHART_THREADS.sentimentScore}
            </Label>
          </YAxis>

          {/* margin right for show full date lable */}
          <YAxis yAxisId="right" orientation="right" tickMargin={48} axisLine={false} />

          <Tooltip />
          <Legend
            payload={[
              {
                value: CHART_THREADS.sentimentScore,
                type: 'circle',
                id: CHART_THREADS.sentimentScore,
                color: POSITIVE_COLOR,
              },
              {
                value: CHART_THREADS.sevenDaysMovingAverage,
                type: 'circle',
                id: CHART_THREADS.sevenDaysMovingAverage,
                color: GRAY_COLOR,
              },
            ]}
          />

          {/* sum positive */}
          <Bar dataKey="sumPositive" name={CHART_THREADS.sumPositive} fill={POSITIVE_COLOR} />

          {/* sum negative */}
          <Bar dataKey="sumNegative" name={CHART_THREADS.sumNegative} fill={NEGATIVE_COLOR} />

          {/* 7 days average */}
          <Line
            type="monotone"
            dataKey="sevenDaysAverage"
            name={CHART_THREADS.sevenDaysAverage}
            stroke={GRAY_COLOR}
            fill={GRAY_COLOR}
            dot={false}
            strokeWidth={3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default SentimentChart
