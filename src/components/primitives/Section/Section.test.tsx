import * as React from 'react'
import { shallow } from 'enzyme'
import Section from './Section'

describe('Section', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Section />)
    expect(wrapper).toMatchSnapshot()
  })
})
