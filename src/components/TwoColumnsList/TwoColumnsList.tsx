import React from 'react'
import { CompanyPeopleData } from '../../pages/CompanyForm/graphql/companyPeople'
import TwoColumnsItem from './TwoColumnsItem'

type Props = {
  list: CompanyPeopleData[]
}

export default function TwoColumnsList(props: Props) {
  return (
    <>
      {props.list.map(item => {
        return (
          <React.Fragment key={item.id}>
            <TwoColumnsItem person={item} />
          </React.Fragment>
        )
      })}
    </>
  )
}
