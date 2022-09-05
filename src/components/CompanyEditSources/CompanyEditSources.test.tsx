import * as React from 'react'
import { shallow } from 'enzyme'
import CompanyEditSources from './CompanyEditSources'
import { companyDetails, companySources } from '../../__mock__'

describe('CompanyEditSources', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <CompanyEditSources
        data={companyDetails()}
        sources={companySources}
        onClickBack={() => {}}
        onClickSave={() => {}}
        onRemoveSource={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
