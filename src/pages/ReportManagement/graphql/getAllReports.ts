import gql from 'graphql-tag'

export default gql`
  query GetAllReports($input: GetAllReportsInput) {
    getAllReports(input: $input) {
      total
      items {
        issueNumber
        name
        version
        publishedDate
        uploadedDate
        description
        expandStatus
        urlAttachment
      }
    }
  }
`
