import { gql } from '@apollo/client'

export default gql`
  mutation($input: AppendTechnologyCertification!) {
    appendNewTechnologyCertification(input: $input)
  }
`
