import * as React from 'react'
import { shallow } from 'enzyme'
import ButtonText from './ButtonText'

describe('ButtonText', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<ButtonText onPress={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })
})
