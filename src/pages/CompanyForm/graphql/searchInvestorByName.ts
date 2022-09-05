import { gql } from '@apollo/client'

export default gql`
  query searchInvestorByName($name: String, $id: String, $getCR: Boolean) {
    searchInvestorByName(name: $name, id: $id, getCR: $getCR) {
      data {
        investor_id
        external_investor_id
        expand_status_id
        investor_name
        investor_type
        source
        associated_company_id
        children {
          investor_id
          external_investor_id
          source
          investor_name
          associated_company_id
          merged_company_id
          component_company_status
        }
        company_status_id
        company_name
      }
      pendingCR {
        companyId
        name
        columnName
        dataOverride {
          companyId
          rowId
          tableName
          columnName
          oldValue
          newValue
          date
          source
          comment
          user
          dataOverrideId
          selfDeclared
          inputSource
        }
      }
    }
  }
`
