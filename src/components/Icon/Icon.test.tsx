import * as React from 'react'
import { shallow } from 'enzyme'
import Icon from './Icon'

describe('Icon', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Icon icon="download" />)
    expect(wrapper).toMatchSnapshot()
  })
})
