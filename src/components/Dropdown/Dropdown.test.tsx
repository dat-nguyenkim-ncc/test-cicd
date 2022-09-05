import * as React from 'react'
import { shallow } from 'enzyme'
import Dropdown from './Dropdown'

const options = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
]

describe('Dropdown', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(<Dropdown onChange={() => {}} name="dropdown" options={options} />)
    expect(wrapper).toMatchSnapshot()
  })
})
