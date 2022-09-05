import * as React from 'react'
import { shallow } from 'enzyme'
import SectorTag from './Tag'
import { TagData } from '../../types'

describe('SectorTag', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <SectorTag
        onOpen={(tag: TagData) => {}}
        onCheck={(tag: TagData) => {}}
        tag={{
          id: '1',
          rowId: '2',
          parent: [],
          label: 'Retail Banking',
          value: 'retail_banking',
          description: 'mock',
        }}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
