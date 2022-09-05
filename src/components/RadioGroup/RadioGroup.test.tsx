import * as React from 'react'
import { shallow } from 'enzyme'
import RadioGroup from './RadioGroup'

describe('RadioGroup', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <RadioGroup
        label="Radio Group"
        name="radio"
        options={[
          { label: 'Enabler', value: 'enabled' },
          { label: 'Disruptor', value: 'disruptor' },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
