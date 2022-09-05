import gql from 'graphql-tag'

export default gql`
  mutation getReport($input: RemoveResearchReportInput!) {
    getResearchReport(input: $input) {
      issueNumber
      name
      version
      publishedDate
      description
      expandStatus
      urlAttachment
      uploadedDate
      companiesMention {
        companyId
        directionMention
      }
    }
  }
`
