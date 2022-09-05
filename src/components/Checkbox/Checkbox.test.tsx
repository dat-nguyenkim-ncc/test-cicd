import * as React from 'react'
import { shallow } from 'enzyme'
import Checkbox from './Checkbox'

describe('Checkbox', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Checkbox checked />)
    expect(wrapper).toMatchSnapshot()
  })
})
