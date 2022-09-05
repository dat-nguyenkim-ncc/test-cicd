import * as React from 'react'
import { shallow } from 'enzyme'
import { companyPeople } from '../../../../__mock__'
import CompanyDetailAcquirees from './CompanyDetailAcquirees'
import { MockedProvider } from '@apollo/client/testing'

describe('CompanyDetailAcquirees', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <MockedProvider addTypename={false}>
        <CompanyDetailAcquirees data={companyPeople()} />
      </MockedProvider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
