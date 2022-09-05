import { gql } from '@apollo/client'
import { UseCaseResult } from '../../../components/UseCaseForm/UseCaseForm'
import {
  MappingCompanyDimensions,
  OverridesConflicts,
  OverridesConflictsValue,
  ProfileDetails,
} from '../../../types'
import { FundraisingDTOResult } from '../../CompanyForm/Fundraising'
import { Certification } from '../../CompanyForm/CertificationForm'
import Fragments from '../../CompanyForm/graphql/fragments'
import { SharedCompanyLocation } from '../../CompanyForm/helpers'
import { Technology } from '../../CompanyForm/TechnologyForm'
import { TechnologyProvider } from '../../CompanyForm/TechnologyProvider'
import { CurrentClientResult } from '../../../components/CurrentClientForm/CurrentClientForm'

export default gql`
  query getDataMergeCompany($companies: [CompanyMergeInput]!) {
    getDataMergeCompany(companies: $companies) {
      dimensions {
        categories {
          id
          name
          isPrimary
          companyId
        }
        mapping {
          ...Taxonomy
          parent {
            ...Taxonomy
          }
        }
        extra {
          ...Taxonomy
        }
        tags {
          id
          label
          source
          parent {
            id
            label
          }
        }
        fintechType {
          id
          label
        }
      }
      profiles {
        profile_id
        company_id
        profile_type_id
        profile_value
        expand_status_id
        profile_type_name
      }
      useCases {
        company_id
        use_case_id
        use_case_type_id
        use_case_value
        fct_status_id
      }
      currentClients {
        company_id
        company_client_id
        client_id
        name
        logo_bucket_url
        url
        fct_status_id
        self_declared
      }

      fundraisings {
        fundraising_id
        pitch_deck_bucket_key
        fundraising
        proceeds_utilization
        investor_relations_contact
      }
      overrides {
        ...OverrideVisibility
      }
      headquarterLocations {
        ...CompanyLocation
      }
      canBeMerged
      technology {
        ...CompanyTechnology
      }
      technologyProvider {
        ...CompanyTechnologyProvider
      }
      technologyCertification {
        ...CompanyTechnologyCertification
      }
      financialLicenses {
        license_jurisdiction
        license_type
        fctStatusId
        selfDeclared
        id
        company_id
      }
      isMultipleFeedly
    }
  }
  ${Fragments.taxonomy}
  ${Fragments.companyLocation}
  ${Fragments.overrideVisibility}
  ${Fragments.companyTechnology}
  ${Fragments.companyTechnologyProvider}
  ${Fragments.companyTechnologyCertification}
`

export type GetDataMergeCompanyResult = {
  dimensions: MappingCompanyDimensions
  profiles: ProfileDetails[]
  financialLicenses: any[]
  useCases: UseCaseResult[]
  currentClients: CurrentClientResult[]
  fundraisings: FundraisingDTOResult[]
  overrides: OverridesConflicts<OverridesConflictsValue>[]
  headquarterLocations: SharedCompanyLocation[]
  canBeMerged: boolean
  technology: Technology[]
  technologyCertification: Certification[]
  technologyProvider: TechnologyProvider[]
  isMultipleFeedly: boolean
}
