import React from 'react'
import { MergeLocationData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import SummaryLayout from './SummaryLayout'

type Props = {
  label: string
  data: MergeLocationData[]
}

const SummaryLocations = (props: Props) => {
  const validData = props.data?.filter(i => !i.hidden)

  return (
    <SummaryLayout label={props.label} isEmpty={validData?.length <= 1}>
      {props.data
        .filter(i => !i.hidden)
        .map((item, index) => {
          const text = [item.location.region, item.location.country, item.location.city].join(', ')
          return (
            <React.Fragment key={index}>
              <Paragraph sx={{ pt: 3, textDecoration: item.isRemove ? 'line-through' : undefined }}>
                {text}
              </Paragraph>
            </React.Fragment>
          )
        })}
    </SummaryLayout>
  )
}

export default SummaryLocations
