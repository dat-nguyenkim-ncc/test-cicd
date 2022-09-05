import React from 'react'
import { ResearchReportInput } from './graphql'

type IContext = {
  editReport: (report: ResearchReportInput) => Promise<void>
}

export const ReportManagementContext = React.createContext<IContext>({
  editReport: async r => {},
})
