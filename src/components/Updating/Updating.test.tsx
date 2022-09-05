import * as React from 'react'
import { shallow } from 'enzyme'
import Updating from './Updating'

describe('Updating', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Updating />)
    expect(wrapper).toMatchSnapshot()
  })
})
