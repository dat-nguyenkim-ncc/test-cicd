import { gql } from '@apollo/client'

export default gql`
  query getCompanyOverrideHistory($input: GetCompanyOverrideInput!) {
    getCompanyOverrideHistory(input: $input) {
      oldValue
      newValue
      user
      selfDeclared
      inputSource
      comment
      date
      columnName
      tableName
      companyId
      isFile
    }
  }
`
export const GET_OVERRIDES_BY_COMPANY_ID = gql`
  query getCompanyOverridesByCompanyId($companyId: Int!) {
    getCompanyOverridesByCompanyId(companyId: $companyId) {
      columnName
      tableName
      rowId
      source
      dataOverrideId
      newValue
      selfDeclared
      inputSource
    }
  }
`
