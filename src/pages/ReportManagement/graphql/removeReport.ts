import gql from 'graphql-tag'

export type RemoveResearchReportInput = {
  issueNumber: number
  version: string
}
export default gql`
  mutation EditReport($input: RemoveResearchReportInput!) {
    removeResearchReport(input: $input)
  }
`
