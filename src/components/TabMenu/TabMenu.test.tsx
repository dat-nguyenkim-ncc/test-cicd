import * as React from 'react'
import { shallow } from 'enzyme'
import TabMenu from './TabMenu'

describe('TabMenu', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TabMenu
        buttons={[
          { active: true, label: 'Test 1', to: '/' },
          { label: 'Test 2', to: '/' },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
