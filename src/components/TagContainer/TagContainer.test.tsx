import * as React from 'react'
import { shallow } from 'enzyme'
import TagContainer from './TagContainer'
import { ListRandomTags } from '../../__mock__'

describe('TagContainer', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TagContainer
        selected={[]}
        openedTags={[]}
        title="FinTech"
        onSelect={id => {}}
        onOpen={id => {}}
        tags={ListRandomTags()}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
