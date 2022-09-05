import { gql } from '@apollo/client'

export default gql`
  query GetCompanyManagementData($input: CompanyManagementInput) {
    getCompanyManagementData(input: $input) {
      company_id
      name
      website_url
      description
      long_description
      founded_year
      status
      logo_url
      logo_bucket_url
      contact_email
      phone_number
      company_type
      expand_status_id
      fct_status_id
      facebook_url
      linkedin_url
      twitter_url
      ftes_range
      ftes_exact
      country_name
      countryCode
      city
      region1_name
      region2_name
      region3_name
      priority_source
      lastest_valuation
      company_stage
      category {
        name
        is_primary
      }
      sector {
        name
        is_primary
      }
      value_chain {
        name
        is_primary
      }
      risk {
        name
        is_primary
      }
      cluster {
        name
        is_primary
      }
    }
  }
`
