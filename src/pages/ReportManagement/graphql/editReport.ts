import gql from 'graphql-tag'

export default gql`
  mutation EditReport($input: EditResearchReportInput!) {
    editResearchReport(input: $input)
  }
`
