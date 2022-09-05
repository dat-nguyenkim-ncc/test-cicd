import * as React from 'react'
import { shallow } from 'enzyme'
import Radio from './Radio'

describe('Radio', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Radio value={'radio'} selected label="Radio" />)
    expect(wrapper).toMatchSnapshot()
  })
})
