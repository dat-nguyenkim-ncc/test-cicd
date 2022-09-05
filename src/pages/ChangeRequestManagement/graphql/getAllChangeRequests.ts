import { gql } from '@apollo/client'

export default gql`
  query GetAllChangeRequests($input: AllChangeRequestsInput!) {
    getAllChangeRequests(input: $input) {
      data {
        companyId
        name
        columnName
        dataOverride {
          companyId
          rowId
          tableName
          columnName
          oldValue
          newValue
          date
          source
          comment
          user
          dataOverrideId
          selfDeclared
          inputSource
          isFile
        }
      }
      total
      totalCR
    }
  }
`
