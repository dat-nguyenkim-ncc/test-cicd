import * as React from 'react'
import { shallow } from 'enzyme'
import TabMenuCategories from './TabMenuCategories'

describe('TabMenuCategories', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TabMenuCategories
        buttons={[
          { label: 'PRIMARY', onClick: () => {}, active: true },
          { label: 'AUXILIARY', onClick: () => {}, active: false },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
