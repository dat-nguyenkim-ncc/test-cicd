import React, { useMemo } from 'react'
import { Box } from 'theme-ui'
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts'
import { Tooltip as TooltipCustom, Icon } from '../../components'
import { NameType, ValueType } from 'recharts/src/component/DefaultTooltipContent'
import { dataChartItemResult } from '../../pages/HealthCheck/helpers'
import { Palette } from '../../theme'
import { Heading } from '../primitives'

const HIGH_PERCENTAGE = 90
const LOW_PERCENTAGE = 80
const fontFamily = { fontFamily: 'Henderson BCG Sans !important' }

type Props = {
  data: dataChartItemResult
}

const ChartHealthCheck = (props: Props) => {
  const { data } = props

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active) {
      return (
        <>
          <div className="chart-tooltip">
            <div>{label}</div>
            <div style={{ color: Palette.primary, marginTop: 5 }}>{`${payload?.[0].value}%`}</div>
          </div>
          <style>{`
            .chart-tooltip {
              padding: 10px;
              background-color: white;
              border: 1px solid #777777;
            }
          `}</style>
        </>
      )
    }

    return null
  }

  const minDate = data.list[0]?.time
  const maxDate = data.list[data.list.length - 1]?.time
  const averageDate = data.list[Math.floor(data.list.length / 2)]?.time

  const min = Math.min.apply(
    null,
    data.list.map(function (a) {
      return Number(a.value)
    })
  )

  const renderColorPercentGrowth = (percent: string) => {
    return Number(percent) > HIGH_PERCENTAGE
      ? `${Palette.greenBland}`
      : Number(percent) < LOW_PERCENTAGE
      ? `${Palette.redDark}`
      : `${Palette.yellow}`
  }

  const renderRangeXAxis = useMemo(() => [minDate, averageDate, maxDate], [
    minDate,
    averageDate,
    maxDate,
  ])

  return (
    <div
      style={{
        border: `1px solid ${Palette.gray01}`,
        textAlign: 'center',
        width: '20%',
        height: '100%',
      }}
    >
      <Heading
        sx={{
          color: 'white',
          backgroundColor: `${Palette.primary}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50px',
          textTransform: 'uppercase',
          fontSize: '20px',
          marginBottom: '10px',
          fontWeight: 'bold',
          ...fontFamily,
        }}
        as="h3"
      >
        <span style={{ flexGrow: 1 }}>{data.title}</span>
        <Box mr={2} sx={{ flexShrink: 0 }}>
          <TooltipCustom
            content={data.tooltipMessage}
            sx={{
              fontSize: '0.9em',
              maxWidth: '350px',
              lineHeight: '1.5em',
              wordBreak: 'break-word',
            }}
            isShow
          >
            <Icon icon="info" color="white" />
          </TooltipCustom>
        </Box>
      </Heading>
      <Heading
        sx={{
          color: `${renderColorPercentGrowth(data.percentGrowth)}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textTransform: 'uppercase',
          fontSize: '24px',
          margin: '20px 0px',
          ...fontFamily,
        }}
        as="h3"
      >
        {`${data.percentGrowth}%`}
      </Heading>
      <ResponsiveContainer width="100%" minHeight={250}>
        <LineChart data={data.list}>
          <Line
            type="linear"
            dataKey="value"
            stroke={Palette.primary}
            dot={false}
            strokeWidth="3"
          />
          <XAxis
            dataKey="time"
            padding={{ left: 20, right: 30 }}
            stroke={`${Palette.darkGray}`}
            ticks={renderRangeXAxis}
          />
          <YAxis
            stroke={`${Palette.darkGray}`}
            type="number"
            padding={{ bottom: min > 0 ? 10 : 0 }}
            domain={[70, 100]}
            tick={false}
            minTickGap={10}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
      <style>
        {`
          .recharts-surface {
            // padding: 0px 20px;
            transform: translateX(-30px);
          }
      `}
      </style>
    </div>
  )
}

export default ChartHealthCheck

export type dataChartType = {
  title: string
  percentGrowth: string
  list: { time: string; value: number }[]
  index: number
}
