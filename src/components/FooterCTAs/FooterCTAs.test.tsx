import * as React from 'react'
import { shallow } from 'enzyme'
import FooterCTAs from './FooterCTAs'

describe('FooterCTAs', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <FooterCTAs
        buttons={[
          {
            label: 'Button 1',
            onClick: () => {},
          },
          {
            label: 'Button 2',
            onClick: () => {},
          },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
