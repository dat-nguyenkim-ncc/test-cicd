import * as React from 'react'
import { shallow } from 'enzyme'
import TagGroup from './TagGroup'
import { TagGroupMock } from '../../__mock__'

const tagGroups = TagGroupMock()

describe('TagGroup', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TagGroup
        tagGroupSelected={undefined}
        tagGroupChildrenSelected={[]}
        tagGroups={tagGroups}
        onTagGroupSelect={() => {}}
        onTagGroupChildSelect={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
