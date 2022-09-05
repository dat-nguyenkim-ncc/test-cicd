import moment from 'moment'
import { SENTIMENT_CHART_DATE_FORMAT } from '../../../../../../utils/consts'

export type CompanyNewsChartResult = {
  trend: number
  thirtyDaysAverage: number
  thirtyDaysToSixtyDaysAverge: number
  sentimentChartData: SentimentChartData[]
}

export type SentimentChartData = {
  date: string
  sevenDaysAverage: number
  sumPositive: number
  sumNegative: number
}

export function formatSentimentChartDate(
  sentimentChartData: SentimentChartData[]
): SentimentChartData[] {
  if (!sentimentChartData) return []
  return sentimentChartData.map((sentimentChartItem: SentimentChartData) => ({
    ...sentimentChartItem,

    // fortmat date for sentimentChartItem
    date: moment(sentimentChartItem.date).utc().format(SENTIMENT_CHART_DATE_FORMAT),
  }))
}

export function xAxisTicksFactory(
  sentimentChartData: SentimentChartData[],
  X_AXIS_TICK_COUNT: number = 10
) {
  if (!sentimentChartData) return []
  const SENTIMENT_CHART_DATA_LENGTH = sentimentChartData.length
  const xAxisTicks = []
  for (let index = 1; index < SENTIMENT_CHART_DATA_LENGTH - 1; index += X_AXIS_TICK_COUNT) {
    xAxisTicks.push(sentimentChartData[SENTIMENT_CHART_DATA_LENGTH - index].date)
  }
  xAxisTicks.push(sentimentChartData[0].date)
  return xAxisTicks
}

export function yAxisTicksFactory(sentimentChartData: SentimentChartData[]) {
  let max: number = 0
  sentimentChartData.forEach((sentimentChartItem: SentimentChartData) => {
    const sumPositive = Math.abs(Number(sentimentChartItem.sumPositive))
    const sumNegative = Math.abs(Number(sentimentChartItem.sumNegative))
    const maxSum = sumPositive > sumNegative ? sumPositive : sumNegative
    maxSum > max && (max = maxSum)
  })

  // for case all data is zero, max = 1
  max = max !== 0 ? (max *= 1.1) : 1 // max = 110% of max (110% = 1.1)

  // for precision of ticks
  const fixedPoint = max > 5 ? 1 : 2

  const tick = Number(max.toFixed(fixedPoint)) // 3/3 of max tick
  const tick1 = Number((tick * 2) / 3).toFixed(fixedPoint) // 2/3 of max tick
  const tick2 = Number((tick * 1) / 3).toFixed(fixedPoint) // 1/3 of max tick

  return [-tick, -tick1, -tick2, 0, +tick2, +tick1, +tick]
}

export function isNullOrUndefined(value: any) {
  return value === null || value === undefined
}

export function formatNegativeNumberToString(negativeNumber: number): string {
  if (isNullOrUndefined(negativeNumber)) return ''
  return negativeNumber.toString().replace('-', '- ')
}

export const POSITIVE_COLOR = '#62cd82'
export const NEGATIVE_COLOR = '#e71c57'
export const GRAY_COLOR = '#828f9e'

export const CHART_THREADS = {
  sentimentScore: 'Sentiment Score',
  sevenDaysMovingAverage: '7 Days Moving Average',
  sevenDaysAverage: '7 Days Average',
  sumPositive: 'Sum Positive',
  sumNegative: 'Sum Negative',
}
