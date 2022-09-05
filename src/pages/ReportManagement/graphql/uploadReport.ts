import gql from 'graphql-tag'
import { ResearchReportCompanyIdsInput, ResearchReportFile } from '../../../types'

export type ResearchReportInput = {
  issueNumber: string
  name: string
  version?: string
  publishedDate: string
  description: string
  expandStatus?: number
}

export type UploadResearchReportInput = {
  report: ResearchReportInput
  reportFiles: ResearchReportFile[]
  companyIds: ResearchReportCompanyIdsInput[]
}

export type EditResearchReportInput = Pick<UploadResearchReportInput, 'report'> & {
  companyIds: ResearchReportCompanyIdsInput[] | null
}

export default gql`
  mutation UploadReport($input: UploadResearchReportInput!) {
    uploadResearchReport(input: $input)
  }
`
