import * as React from 'react'
import { shallow } from 'enzyme'
import ShowText from './ShowText'

describe('ShowText', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<ShowText value="Lorem ipsum dolot si amet" max={10} />)
    expect(wrapper).toMatchSnapshot()
  })
})
