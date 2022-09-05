import * as React from 'react'
import { shallow } from 'enzyme'
import SearchResultBlock from './SearchResultBlock'
import { companyDetails } from '../../__mock__'

describe('SearchResultBlock', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <SearchResultBlock
        onChange={() => {}}
        type="internal"
        list={[
          {
            companyDetails: companyDetails(),
            source: { label: 'Source: XPTO' },
          },
        ]}
        state={{}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
