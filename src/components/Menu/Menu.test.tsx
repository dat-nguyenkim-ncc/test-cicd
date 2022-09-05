import * as React from 'react'
import { shallow } from 'enzyme'
import Menu from './Menu'

describe('Menu', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <Menu
        links={[
          <span>Edit Global Taxonomy</span>,
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
