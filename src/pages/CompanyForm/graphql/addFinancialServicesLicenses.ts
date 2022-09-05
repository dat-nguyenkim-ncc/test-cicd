import { gql } from '@apollo/client'

export default gql`
  mutation addFinancialServicesLicenses($input: AppendNewFinancialServicesLicenses!) {
    appendNewFinancialServicesLicenses(input: $input)
  }
`
