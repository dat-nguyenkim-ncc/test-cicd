import * as React from 'react'
import { shallow } from 'enzyme'
import DownloadCompanyData from './DownloadCompanyData'
import { categoryOptions, mappingOptions } from './mock'

describe('DownloadCompanyData', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <DownloadCompanyData
        lastUpdated={new Date().toString()}
        onPressDownload={() => {}}
        categoryOptions={categoryOptions}
        mappingOptions={mappingOptions}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
