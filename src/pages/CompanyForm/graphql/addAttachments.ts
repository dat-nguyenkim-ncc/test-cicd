import { gql } from '@apollo/client'

export default gql`
  mutation addAttachments($input: [AttachmentInput!]!) {
    addAttachments(input: $input)
  }
`
export const GET_COMPANY_ATTACHMENTS = gql`
  query($companyId: Int!) {
    getCompanyAttachments(companyId: $companyId) {
      url_attachment
      name
      description
      type
      expandStatus
      date_created
      selfDeclared
    }
  }
`
