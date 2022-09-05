import * as React from 'react'
import { shallow } from 'enzyme'
import { companyAcquisitions } from '../../../../__mock__'
import CompanyDetailAcquisitions from './CompanyDetailAcquisitions'

describe('CompanyDetailBusiness', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyDetailAcquisitions
        data={{ acquisitionRounds: companyAcquisitions(), isExternalViewDetail: true }}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
