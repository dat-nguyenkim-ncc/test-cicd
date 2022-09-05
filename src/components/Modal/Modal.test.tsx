import * as React from 'react'
import { shallow } from 'enzyme'
import Modal from './Modal'

describe('Modal', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <Modal
        body="This company will be added to the internal database"
        buttons={[{ label: 'Confirm', type: 'primary', action: () => {} }]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
