import * as React from 'react'
import { shallow } from 'enzyme'
import SearchResults, { CompanyToCreate, CreateNewCompanyType } from './SearchResults'
import {
  OverridesConflicts,
  OverridesConflictsValueWithUId,
  OverrideVisibilityRequest,
} from '../../types'
import { HasPendingCQField } from '../../pages/CompanyForm/CompanyForm'

describe('SearchResults', () => {
  test('matches snapshot', () => {
    const wrapper = shallow(
      <SearchResults
        onAggregate={() => {}}
        onCreateNewCompany={companiesToCreate => {
          console.log(companiesToCreate)
        }}
        onPressForm={() => {}}
        onMergeCompany={() => {}}
        internal={[]}
        external={[]}
        getInternalCompaniesDetails={(internalCompanies: CreateNewCompanyType[]) => {}}
        getExternalCompaniesDetails={(internalCompanies: CreateNewCompanyType[]) => {}}
        onAddSourceToExistingCompanyClick={(
          externalCompanies: CompanyToCreate[],
          internalCompanies: CompanyToCreate[]
        ) => {}}
        getAllOverrideVisibility={(input: OverrideVisibilityRequest) => {
          return new Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]>(resolve =>
            resolve([])
          )
        }}
        sourcePriority={[]}
        getCompanyChangeRequests={(id: number) => {
          return new Promise<HasPendingCQField[]>(resolve => resolve([]))
        }}
      />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
