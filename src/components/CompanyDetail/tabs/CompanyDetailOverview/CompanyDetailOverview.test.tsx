import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetailOverview from './CompanyDetailOverview'
import { companyDetails, companyOverview } from '../../../../__mock__'

describe('CompanyDetailOverview', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyDetailOverview data={{ ...companyDetails(), ...companyOverview() }} />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
