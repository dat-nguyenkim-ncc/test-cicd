import * as React from 'react'
import { shallow } from 'enzyme'
import TagsSection from './TagsSection'
import { ListRandomTags } from '../../__mock__'
import { TagData } from '../../types'
import { EnumCompanyTypeSector, EnumDimensionType } from '../../types/enums'

describe('TagsSection', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TagsSection
        selected={[] as TagData[]}
        type={EnumCompanyTypeSector.FIN}
        openedTags={{ parent: [] as any, tags: [] as TagData[] }}
        dimension={EnumDimensionType.SECTOR}
        onOpenTags={() => {}}
        onSelectTags={() => {}}
        tags={ListRandomTags()}
        onClickUndo={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
