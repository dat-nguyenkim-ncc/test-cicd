import * as React from 'react'
import { shallow } from 'enzyme'
import Header from './Header'

describe('Header', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <Header
        active="edit"
        onClickLogout={() => {}}
        onClickHeader={() => {}}
        links={[
          <span key="edit">Edit Global Taxonomy</span>,
          <span>Add new company</span>,
          <span>Add new entries</span>,
          <span>Download company data</span>,
        ]}
        menus={[
          {
            title: 'Management',
            menu: [<span>Company Management</span>, <span>Change Request Management</span>],
          },
        ]}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
