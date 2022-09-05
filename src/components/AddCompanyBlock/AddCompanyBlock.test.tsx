import * as React from 'react'
import { shallow } from 'enzyme'
import AddCompanyBlock from './AddCompanyBlock'

describe('AddCompanyBlock', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<AddCompanyBlock onPressForm={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })
})
