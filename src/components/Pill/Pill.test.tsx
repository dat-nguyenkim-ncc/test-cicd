import * as React from 'react'
import { shallow } from 'enzyme'
import Pill from './Pill'

describe('Pill', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Pill variant="primary" />)
    expect(wrapper).toMatchSnapshot()
  })
})
