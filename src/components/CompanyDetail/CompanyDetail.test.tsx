import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyDetail from './CompanyDetail'
import { companyFinancials, companyOverview, companyPeople, mappingSummary } from '../../__mock__'

describe('CompanyDetail', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyDetail
        onBack={() => {}}
        mapping={mappingSummary}
        financials={companyFinancials()}
        business={companyPeople()}
        people={companyPeople()}
        overview={companyOverview()}
        setPageCurrent={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
