import * as React from 'react'
import { shallow } from 'enzyme'
import { companyPeople } from '../../../../__mock__'
import CompanyDetailInvestments from './CompanyDetailInvestments'
import { MockedProvider } from '@apollo/client/testing'

describe('CompanyDetailInvestments', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <MockedProvider addTypename={false}>
        <CompanyDetailInvestments data={companyPeople()} />
      </MockedProvider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
