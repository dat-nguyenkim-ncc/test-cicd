import { gql } from '@apollo/client'

export default gql`
  query getAllTagChangeRequests($companyId: Int!, $type: String) {
    getAllTagChangeRequests(companyId: $companyId, type: $type) {
      data {
        dataOverrideId
        rowId
        tagName
        tagGroupName
        tagGroupSource
        fctStatusId
        selfDeclared
        inputSource
        sourceValue
        newValue
        date
        reason
        user
        tagId
      }
    }
  }
`
