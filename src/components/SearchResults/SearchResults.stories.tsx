import React from 'react'
import { Box } from 'theme-ui'
import { Story, Meta } from '@storybook/react/types-6-0'

import SearchResults, {
  CompanyToCreate,
  CreateNewCompanyType,
  SearchResultsProps,
  SourcePriority,
} from './SearchResults'
import { BrowserRouter } from 'react-router-dom'
import { data } from './__mock__'
import {
  MergeCompanyOverridesInput,
  OverridesConflicts,
  OverridesConflictsValueWithUId,
  ResolveMergeOverridesConflicts,
} from '../MergeData/MergeData'
import { OverrideVisibilityRequest } from '../../types'
import { HasPendingCQField } from '../../pages/CompanyForm/CompanyForm'

export default {
  title: 'Search/SearchResults',
  component: SearchResults,
} as Meta

const Template: Story<SearchResultsProps> = args => (
  <Box sx={{ p: 5, width: '100%', backgroundColor: 'gray03' }}>
    <BrowserRouter>
      <SearchResults {...args} />
    </BrowserRouter>
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  onAggregate: (searchState: any) => {
    console.log(searchState)
  },
  onPressForm: () => {},
  onCreateNewCompany: (companiesToCreate: CompanyToCreate[]) => {
    console.log(companiesToCreate)
  },
  ...data,
} as SearchResultsProps

export const NoInternalResults = Template.bind({})
NoInternalResults.args = {
  onAggregate: (searchState: any) => {
    console.log(searchState)
  },
  onCreateNewCompany: (companiesToCreate: CompanyToCreate[]) => {
    console.log(companiesToCreate)
  },
  onPressForm: () => {},
  getCompanyChangeRequests: (id: number) => {
    return new Promise<HasPendingCQField[]>(resolve => resolve([]))
  },
  onMergeCompany: () => {},
  internal: [],
  external: data.external,
  getInternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  getExternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  onAddSourceToExistingCompanyClick: (
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[]
  ) => {},
  isSelected: (field: string, item: OverridesConflictsValueWithUId) => true,
  mergeResolveOverridesConflicts: (data: ResolveMergeOverridesConflicts) => {},
  getAllOverrideVisibility: (input: OverrideVisibilityRequest) => {
    return new Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]>(resolve => resolve([]))
  },
  sourcePriority: [],
} as SearchResultsProps

export const NoExternalResults = Template.bind({})
NoExternalResults.args = {
  onAggregate: (searchState: any) => {
    console.log(searchState)
  },
  onCreateNewCompany: (companiesToCreate: CompanyToCreate[]) => {
    console.log(companiesToCreate)
  },
  onPressForm: () => {},
  onMergeCompany: () => {},
  external: [],
  internal: data.internal,
  getInternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  getExternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  onAddSourceToExistingCompanyClick: (
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[]
  ) => {},
  isSelected: (field: string, item: OverridesConflictsValueWithUId) => true,
  mergeResolveOverridesConflicts: (data: ResolveMergeOverridesConflicts) => {},
  getAllOverrideVisibility: (input: OverrideVisibilityRequest) => {
    return new Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]>(resolve => resolve([]))
  },
  sourcePriority: [],
  getCompanyChangeRequests: (id: number) => {
    return new Promise<HasPendingCQField[]>(resolve => resolve([]))
  },
} as SearchResultsProps

export const NoResults = Template.bind({})
NoResults.args = {
  onAggregate: (searchState: any) => {
    console.log(searchState)
  },
  onCreateNewCompany: (companiesToCreate: CompanyToCreate[]) => {
    console.log(companiesToCreate)
  },
  onPressForm: () => {},
  onMergeCompany: () => {},
  internal: [],
  external: [],
  getInternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  getExternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  onAddSourceToExistingCompanyClick: (
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[]
  ) => {},
  isSelected: (field: string, item: OverridesConflictsValueWithUId) => true,
  mergeResolveOverridesConflicts: (data: ResolveMergeOverridesConflicts) => {},
  getAllOverrideVisibility: (input: OverrideVisibilityRequest) => {
    return new Promise<OverridesConflicts<OverridesConflictsValueWithUId>[]>(resolve => resolve([]))
  },
  sourcePriority: [],
  getCompanyChangeRequests: (id: number) => {
    return new Promise<HasPendingCQField[]>(resolve => resolve([]))
  },
} as SearchResultsProps

export const TooManyResults = Template.bind({})
TooManyResults.args = {
  onAggregate: (searchState: any) => {
    console.log(searchState)
  },
  onCreateNewCompany: (companiesToCreate: CompanyToCreate[]) => {
    console.log(companiesToCreate)
  },
  onPressForm: () => {},
  internal: new Array(10).fill({
    ...data.internal[0],
  }),
  external: new Array(101).fill({
    ...data.external[0],
  }),
  getInternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  getExternalCompaniesDetails: (internalCompanies: CreateNewCompanyType[]) => {},
  onAddSourceToExistingCompanyClick: (
    externalCompanies: CompanyToCreate[],
    internalCompanies: CompanyToCreate[],
    override: MergeCompanyOverridesInput[]
  ) => {},
  sourcePriority: [] as SourcePriority[],
} as SearchResultsProps
