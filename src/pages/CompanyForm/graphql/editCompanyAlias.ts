import { gql } from '@apollo/client'

export default gql`
  mutation editCompanyAlias(
    $companyId: Int!
    $edit_record: EditCompanyAliasInput!
    $isAppendData: Boolean
  ) {
    aliasChangeRequest(
      companyId: $companyId
      edit_record: $edit_record
      isAppendData: $isAppendData
    )
  }
`
export type EditCompanyAliasVariables = {
  isAppendData: boolean
  companyId: number
  edit_record: {
    alias_id: string
    table_name: string
    column_name: string
    old_value: string
    new_value: string
    source: string
    comment: string
  }
}
