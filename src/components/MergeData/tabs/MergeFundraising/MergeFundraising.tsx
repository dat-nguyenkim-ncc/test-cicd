import React from 'react'
// import { Radio } from '../../..'
import { FundraisingDTOResult } from '../../../../pages/CompanyForm/Fundraising'
import MergeStepLayout from '../../MergeStepLayout'
import RadioFundraising from './RadioFundraising'
import { groupBy } from 'lodash'

type Props = {
  label: string
  data: FundraisingDTOResult[]
  onChange(fundraisings: FundraisingDTOResult[]): void
  saveFundraisings: FundraisingDTOResult[]
}

const MergeFundraising = (props: Props) => {
  const distinctList = Object.values(groupBy(props.data || [], f => f.fundraising_id)).map(
    list => list[0]
  )

  return (
    <MergeStepLayout label={props.label} isEmpty={!(distinctList?.length > 0)}>
      {distinctList.map((item, index) => {
        const listId = props.saveFundraisings.map(f => f.fundraising_id)
        const isChecked = listId.includes(item.fundraising_id)

        return (
          <React.Fragment key={index}>
            <RadioFundraising
              key={index}
              sx={{ mr: 4 }}
              itemProps={{ fundraising: item }}
              selected={isChecked}
              onClick={() => {
                props.onChange(isChecked ? ([] as FundraisingDTOResult[]) : [item])
              }}
              size="small"
            />
          </React.Fragment>
        )
      })}
    </MergeStepLayout>
  )
}

export default MergeFundraising
