import * as React from 'react'
import { shallow } from 'enzyme'
import AggregatedSource from './AggregatedSource'
import { companyDetails, companySources } from '../../__mock__'

describe('AggregatedSource', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <AggregatedSource
        onCheck={(id: string) => {}}
        company={companyDetails()}
        sources={companySources}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
