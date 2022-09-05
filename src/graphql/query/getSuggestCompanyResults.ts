import { gql } from '@apollo/client'

export const GET_SUGGEST_COMPANY_RESULTS = gql`
  query($query: String, $limit: Int) {
    getSuggestCompanyResults(input: { query: $query, limit: $limit }) {
      data {
        company_id
        source
        field
        value
      }
      count
    }
  }
`
export enum SearchReferenceField {
  'name' = 'Name',
  'website_url' = 'Website Url',
  'company_alias' = 'Alias',
}

export type CompanySuggestion = {
  company_id: number
  source: string
  field: keyof typeof SearchReferenceField
  value: string
}
export type SuggestCompanyResponse = {
  getSuggestCompanyResults: {
    count: number
    data: CompanySuggestion[]
  }
}
