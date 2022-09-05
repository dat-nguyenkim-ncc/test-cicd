import React, { useState } from 'react'
import ReactSpeedometer from 'react-d3-speedometer'
import { Flex } from 'theme-ui'
import { Switch } from '../'
import { Palette } from '../../theme'
import {
  CompanyNewsChartResult,
  NEGATIVE_COLOR,
  POSITIVE_COLOR,
} from '../CompanyDetail/tabs/CompanyDetailNews/components'
import { Paragraph } from '../primitives'

export type ChartDataOverViewProps = {
  companyNewsChartRes: CompanyNewsChartResult | undefined
}

const ChartDataOverView = ({ companyNewsChartRes }: ChartDataOverViewProps) => {
  const [isThirtyDays, setIsThirtyDays] = useState<boolean>(false)

  if (!companyNewsChartRes?.thirtyDaysAverage && !companyNewsChartRes?.thirtyDaysToSixtyDaysAverge)
    return null

  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <ReactSpeedometer
        width={255}
        height={170}
        needleHeightRatio={0.6}
        maxValue={1}
        minValue={-1}
        value={
          (!isThirtyDays
            ? companyNewsChartRes?.thirtyDaysAverage
            : companyNewsChartRes?.thirtyDaysToSixtyDaysAverge) || 0
        }
        segments={500}
        ringWidth={20}
        needleTransitionDuration={1000}
        needleColor={Palette.primary}
        startColor={NEGATIVE_COLOR}
        endColor={POSITIVE_COLOR}
        textColor={'#444'}
        maxSegmentLabels={2}
      />
      <Flex sx={{ alignItems: 'center', mb: 20, width: '100%' }}>
        <Paragraph sx={{ mr: 2, fontSize: 10, flex: 1, textAlign: 'end' }} color="#444" bold={true}>
          30-day Average
        </Paragraph>
        <Switch
          css={{ width: 40 }}
          onToggle={() => setIsThirtyDays(!isThirtyDays)}
          checked={isThirtyDays}
        />
        <Paragraph sx={{ ml: 2, fontSize: 10, flex: 1 }} color="#444" bold={true}>
          30-day to 60-day Average
        </Paragraph>
      </Flex>
    </Flex>
  )
}

export default ChartDataOverView
