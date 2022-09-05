import gql from 'graphql-tag'

export default gql`
  query GetCompaniesByIssueNumber($issueNumber: String!) {
    getCompaniesByIssueNumber(issueNumber: $issueNumber) {
      issueNumber
      name
      version
      publishedDate
      description
      expandStatus
      urlAttachment
      uploadedDate
      companies {
        companyId
        directMention
        issueNumber
        version
      }
    }
  }
`
