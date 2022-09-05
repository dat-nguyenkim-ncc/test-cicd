import * as React from 'react'
import { shallow } from 'enzyme'
import Message from './Message'

describe('Message', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Message variant="check" body="Test test" />)
    expect(wrapper).toMatchSnapshot()
  })
})
