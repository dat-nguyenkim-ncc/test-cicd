import * as React from 'react'
import { shallow } from 'enzyme'
import SideSummary from './SideSummary'
import { EnumCompanyTypeSector } from '../../types/enums'

describe('SideSummary', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <SideSummary
        content={[
          {
            title: 'CATEGORIES',
            items: [
              { label: 'Fintech', parent: ['Fintech Parent'] },
              { label: 'Retail Accounts' },
              { label: 'Accounts & Savings' },
              { label: 'Digital Banking' },
            ],
            type: EnumCompanyTypeSector.FIN,
            dimension: 1,
          },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
