import { gql } from '@apollo/client'

export default gql`
  mutation($input: AppendNewLocationsInput) {
    appendNewLocations(input: $input)
  }
`
