import * as React from 'react'
import { shallow } from 'enzyme'
import TagMapping from './TagMapping'
import { EnumCompanyTypeSector } from '../../types/enums'

describe('TagMapping', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <TagMapping
        typeTech={EnumCompanyTypeSector.FIN}
        onClickRemove={() => {}}
        mappings={{
          primary: {
            data: [
              {
                id: '1602162955848',
                rowId: '123',
                value: 'retail_banking',
                label: 'Retail Banking',
                endpoint: true,
                description: 'mock',
                parent: [
                  {
                    id: '1602163039764',
                    label: 'Corporate Banking',
                    value: 'corporate_banking',
                    description: 'mock',
                  },
                  {
                    id: '1602162670040',
                    label: 'Corporate Banking',
                    value: 'corporate_banking',
                    description: 'mock',
                  },
                  {
                    id: '1602162616471',
                    label: 'Corporate Banking',
                    value: 'corporate_banking',
                    description: 'mock',
                  },
                  {
                    id: '1602162954943',
                    label: 'Retail Banking',
                    value: 'retail_banking',
                    description: 'mock',
                  },
                ],
              },
            ],
          },
        }}
        title="Fintech"
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
