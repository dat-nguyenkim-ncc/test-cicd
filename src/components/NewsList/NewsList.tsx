import React from 'react'
import { NewsModel } from '../../pages/CompanyForm/NewsForm'
import NewsItem, { TypeShow } from './NewsItem'

type Props = {
  data: NewsModel[]
  switchAction?(item: NewsModel): void
  switchDisable?: boolean
  isEdit?: boolean
}
export default function NewsList(props: Props) {
  return (
    <>
      {props.data.map(item => {
        return (
          <NewsItem
            key={item.id}
            valueData={item}
            switchAction={() => {
              props.switchAction && props.switchAction(item)
            }}
            switchDisable={props.switchDisable}
            sx={{ marginY: 5 }}
            typeShow={TypeShow.TypeA}
            isEdit={props.isEdit}
          />
        )
      })}
    </>
  )
}
