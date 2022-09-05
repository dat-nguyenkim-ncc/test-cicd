import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailFinancials from './CompanyDetailFinancials'
import { companyFinancials } from '../../../../__mock__'

describe('CompanyDetailFinancials', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<CompanyDetailFinancials data={companyFinancials()} />)
    expect(wrapper).toMatchSnapshot()
  })
})
