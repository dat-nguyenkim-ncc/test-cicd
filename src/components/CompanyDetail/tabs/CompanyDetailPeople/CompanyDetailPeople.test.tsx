import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailPeople from './CompanyDetailPeople'
import { companyPeople } from '../../../../__mock__'
import { MockedProvider } from '@apollo/client/testing'

describe('CompanyDetailPeople', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <MockedProvider addTypename={false}>
        <CompanyDetailPeople data={companyPeople()} />
      </MockedProvider>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
