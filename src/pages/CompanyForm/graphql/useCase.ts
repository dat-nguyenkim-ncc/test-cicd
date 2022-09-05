import { gql } from '@apollo/client'

export const GET_USE_CASE_TYPE = gql`
  query getUseCaseType {
    getUseCaseType {
      useCaseTypeId
      useCaseTypeName
      isMultiple
      isFile
    }
  }
`

export const APPEND_USE_CASE = gql`
  mutation appendUseCase($companyId: Int!, $useCases: [UseCaseInput!]) {
    appendUseCase(companyId: $companyId, useCases: $useCases)
  }
`

export const APPEND_CURRENT_CLIENT = gql`
  mutation appendCurrentClient($companyId: Int!, $currentClients: [CurrentClientInput!]) {
    appendCurrentClient(companyId: $companyId, currentClients: $currentClients)
  }
`

export const GET_COMPANY_USE_CASE = gql`
  query getCompanyUseCase($companyId: Int!, $activeOnly: Boolean) {
    getCompanyUseCase(companyId: $companyId, activeOnly: $activeOnly) {
      useCases {
        company_id
        use_case_id
        use_case_type_id
        use_case_value
        fct_status_id
        self_declared
      }
    }
  }
`
export const GET_COMPANY_CURRENT_CLIENT = gql`
  query getCompanyCurrentClient($companyId: Int!, $activeOnly: Boolean) {
    getCompanyCurrentClient(companyId: $companyId, activeOnly: $activeOnly) {
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
    }
  }
`
export const SEARCH_CURRENT_CLIENT = gql`
  query searchCurrentClient($keyword: String, $limit: Int, $skip: Int) {
    searchCurrentClient(keyword: $keyword, limit: $limit, skip: $skip) {
      client_id
      name
      logo_bucket_url
      url
    }
  }
`
