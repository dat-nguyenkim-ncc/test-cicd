import { useQuery } from '@apollo/client'
import React, { ChangeEvent, useState } from 'react'
import { Updating } from '../../components'
import { Heading } from '../../components/primitives'
import { GET_HEALTH_CHECK_TABLE, GET_HEALTH_CHECK_CHART } from './graphql'
import strings from '../../strings'
import {
  HealthCheckChartResult,
  HealthCheckTableResult,
  TABLE_TIME_FRAME_OPTIONS,
  CHART_TIME_FRAME_OPTIONS,
} from './helpers'
import { ErrorModal } from '../../components/ErrorModal'
import HealthCheckTable from './HealthCheckTable'
import HealthCheckChart from './HealthCheckChart'
import { FormOption } from '../../types'
import { Box } from 'theme-ui'

const CHART_TIME_FRAME_OPTION_ALL = CHART_TIME_FRAME_OPTIONS[
  CHART_TIME_FRAME_OPTIONS.length - 1 // last option is 'All'
].value

const HealthCheck = () => {
  const { healthCheck } = strings

  const [tableTimeFrame, setTableTimeFrame] = useState<FormOption['value']>(
    TABLE_TIME_FRAME_OPTIONS[0].value
  )

  const [chartTimeFrame, setChartTimeFrame] = useState<FormOption['value']>(
    CHART_TIME_FRAME_OPTIONS[0].value
  )

  const [tableResult, setTableResult] = useState<HealthCheckTableResult[]>([])
  const [chartResult, setChartResult] = useState<HealthCheckChartResult[]>([])

  const [tableErrorMessage, setTableErrorMessage] = useState<string>('')
  const [chartErrorMessage, setChartErrorMessage] = useState<string>('')

  // Get data for health check table
  const {
    data: tableData,
    error: tableError,
    loading: tableLoading,
    refetch: tableRefetch,
  } = useQuery(GET_HEALTH_CHECK_TABLE, {
    variables: {
      timeFrame: tableTimeFrame,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setTableResult(tableData.getHealthCheckTable)
    },
    onError() {
      setTableErrorMessage(tableError?.message || '')
    },
  })

  // Get data for health check chart
  const {
    data: chartData,
    error: chartError,
    loading: chartLoading,
    refetch: chartRefetch,
  } = useQuery(GET_HEALTH_CHECK_CHART, {
    variables: {
      // 'Dropdown' component does not recognize '' value
      timeFrame: chartTimeFrame !== CHART_TIME_FRAME_OPTION_ALL ? chartTimeFrame : '',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted() {
      setChartResult(chartData.getHealthCheckChart)
    },
    onError() {
      setChartErrorMessage(chartError?.message || '')
    },
  })

  const handleTableTimeFrameOptionChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setTableTimeFrame(event.currentTarget.value)

  const hanldeChartTimeFrameOptionChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setChartTimeFrame(event.currentTarget.value)

  return (
    <Box sx={{
      // Offset margin auto by 'Grid' component in 'GlobalLayout.tsx'.
      // Should remove or update this sx style if this component is
      // not the children of 'Grid' component in 'GlobalLayout.tsx'.
      width: '100vw',
      maxWidth: '100vw',
      mx: [0, 0, 0, 'calc((-100vw + 1024px)/2)'],
      px: [0, 3, 5, 7],
    }}>
      <Heading as="h2">{healthCheck.title}</Heading>

      {chartLoading && tableLoading ? (
        <Updating sx={{ py: 7 }} loading />
      ) : (
        <>
          <HealthCheckChart
            sx={{ mt: 6, pt: 5, width: '100%', maxWidth: '100%' }}
            chartData={chartResult}
            chartLoading={chartLoading}
            timeFrameValue={chartTimeFrame}
            hanldeTimeFrameOptionChange={hanldeChartTimeFrameOptionChange}
          />

          <HealthCheckTable
            sx={{ mt: 7, pt: 5, width: '100%', maxWidth: '100%' }}
            tableData={tableResult}
            tableLoading={tableLoading}
            timeFrameValue={tableTimeFrame}
            hanldeTimeFrameOptionChange={handleTableTimeFrameOptionChange}
          />
        </>
      )}

      {(Boolean(tableErrorMessage) || Boolean(chartErrorMessage)) && (
        <ErrorModal
          title={'Error'}
          message={tableErrorMessage || chartErrorMessage}
          onOK={() => {
            if (tableErrorMessage) {
              setTableErrorMessage('')
              tableRefetch()
            }

            if (chartErrorMessage) {
              setChartErrorMessage('')
              chartRefetch()
            }
          }}
        />
      )}
    </Box>
  )
}

export default HealthCheck
