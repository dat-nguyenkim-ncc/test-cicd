import * as React from 'react'
import { shallow } from 'enzyme'
import UserIcon from './UserIcon'

describe('UserIcon', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<UserIcon onClickLogout={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })
})
