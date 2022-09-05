import gql from 'graphql-tag'

export default gql`
  query($input: ResearchReportGetSignUrlInput!) {
    researchReportGetSignUrl(input: $input) {
      fileId
      signedUrl
    }
  }
`
