import { gql } from '@apollo/client'

export default gql`
  mutation changeRequestCompanyData($input: [OverridesCompanyDataInput]!, $isAppendData: Boolean) {
    changeRequestCompanyData(input: $input, isAppendData: $isAppendData) {
      data
    }
  }
`
