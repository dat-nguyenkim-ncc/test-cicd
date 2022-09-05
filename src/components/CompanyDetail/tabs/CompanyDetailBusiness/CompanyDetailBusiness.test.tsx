import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailBusiness from './CompanyDetailBusiness'
import { companyPeople } from '../../../../__mock__'
import { MockedProvider } from '@apollo/client/testing'

describe('CompanyDetailBusiness', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <MockedProvider addTypename={false}>
        <CompanyDetailBusiness data={companyPeople()} />
      </MockedProvider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
