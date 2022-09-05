import gql from 'graphql-tag'
import { Fragments } from '.'

export default gql`
  query getCompanyNews(
    $companyId: Int!
    $take: Int
    $skip: Int
    $activeOnly: Boolean
    $skipPaging: Boolean = false
    $rowId: String
    $filterInput: NewsFilter
  ) {
    getCompanyNews(
      companyId: $companyId
      take: $take
      skip: $skip
      activeOnly: $activeOnly
      rowId: $rowId
      filterInput: $filterInput
    ) {
      total @skip(if: $skipPaging)
      skip @skip(if: $skipPaging)
      take @skip(if: $skipPaging)
      result @skip(if: $skipPaging) {
        ...News
      }
      hasFollowing
    }
  }
  ${Fragments.news}
`

export const GET_EXTERNAL_COMPANY_NEWS = gql`
  query GetExternalCompanyNews(
    $companyId: String!
    $limit: Int
    $source: String!
    $afterId: String
    $beforeId: String
  ) {
    getExternalCompanyNews(
      companyId: $companyId
      limit: $limit
      source: $source
      afterId: $afterId
      beforeId: $beforeId
    ) {
      total
      result {
        ...News
      }
      hasFollowing
    }
  }
  ${Fragments.news}
`

export const UPDATE_STATUS_NEWS = gql`
  mutation updateStatusNews(
    $newsId: String
    $fctStatusId: String
    $isForAll: Boolean
    $companyId: Int
  ) {
    updateStatusNews(
      newsId: $newsId
      fctStatusId: $fctStatusId
      isForAll: $isForAll
      companyId: $companyId
    )
  }
`
