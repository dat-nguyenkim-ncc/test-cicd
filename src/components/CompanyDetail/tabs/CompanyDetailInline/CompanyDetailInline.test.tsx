import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailInline from './CompanyDetailInline'

describe('CompanyDetailInline', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<CompanyDetailInline title="FUNDING TOTAL" detail="Series E+" />)
    expect(wrapper).toMatchSnapshot()
  })
})
