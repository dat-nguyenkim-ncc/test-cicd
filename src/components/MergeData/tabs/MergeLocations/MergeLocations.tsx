import React from 'react'
import { Flex } from 'theme-ui'
import { Checkbox } from '../../..'
import { MergeLocationData } from '../../../../types'
import MergeStepLayout from '../../MergeStepLayout'

type Props = {
  label: string
  data: MergeLocationData[]
  onChange(location: MergeLocationData): void
}

const MergeLocations = (props: Props) => {
  const validData = props.data?.filter(i => !i.hidden)

  return (
    <MergeStepLayout label={props.label} isEmpty={validData?.length <= 1}>
      {validData.map((item, index) => {
        const text = [item.location.region, item.location.city, item.location.country].join(', ')

        return (
          <React.Fragment key={index}>
            <Flex sx={{ alignItems: 'center', py: 12, gap: 3 }}>
              <Checkbox
                square={true}
                label={text}
                onPress={() => {
                  props.onChange(item)
                }}
                checked={!item.isRemove}
              />
            </Flex>
          </React.Fragment>
        )
      })}
    </MergeStepLayout>
  )
}

export default MergeLocations
