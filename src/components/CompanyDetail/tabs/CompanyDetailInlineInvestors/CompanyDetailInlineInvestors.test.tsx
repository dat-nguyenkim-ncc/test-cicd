import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailInlineInvestors from './CompanyDetailInlineInvestors'

describe('CompanyDetailInlineInvestors', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<CompanyDetailInlineInvestors />)
    expect(wrapper).toMatchSnapshot()
  })
})
