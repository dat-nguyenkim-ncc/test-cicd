import * as React from 'react'
import { shallow } from 'enzyme'
import CategoryMapInline from './CategoryMapInline'

describe('CategoryMapInline', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CategoryMapInline category={{ label: 'Category 1', list: ['Subcategory 1'] }} />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
