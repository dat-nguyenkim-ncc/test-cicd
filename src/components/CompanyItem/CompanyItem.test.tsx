import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyItem from './CompanyItem'
import { companyDetails } from '../../__mock__'

describe('CompanyItem', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyItem
        type="internal"
        companyDetails={companyDetails()}
        source={{ label: 'Source A-PXS' }}
        checked
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
