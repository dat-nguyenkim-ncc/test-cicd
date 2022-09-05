import * as React from 'react'
import { shallow } from 'enzyme'
import TextField from './TextField'

describe('TextField', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<TextField onChange={() => {}} name="company" />)
    expect(wrapper).toMatchSnapshot()
  })
})
