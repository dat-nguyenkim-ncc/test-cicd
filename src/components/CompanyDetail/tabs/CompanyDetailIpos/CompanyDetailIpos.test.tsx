import * as React from 'react'
import { shallow } from 'enzyme'
import { companyIpos } from '../../../../__mock__'
import CompanyDetailIpos from './CompanyDetailIpos'

describe('CompanyDetailIpos', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyDetailIpos data={{ ipoRounds: companyIpos(), isExternalViewDetail: true }} />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
