import * as React from 'react'
import { shallow } from 'enzyme'
import UploadDocumentation from './UploadDocumentation'

describe('UploadDocumentation', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <UploadDocumentation
        files={[
          {
            fileId: '',
            file: {} as File,
            name: 'file',
            description: 'description',
            type: '',
            magicBytes: '',
          },
        ]}
        onChangeFile={() => {}}
        setErrorAttachment={() => {}}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
