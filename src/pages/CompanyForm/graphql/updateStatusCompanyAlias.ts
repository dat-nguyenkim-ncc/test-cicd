import { gql } from '@apollo/client'

export default gql`
  mutation($input: UpdateAliasStatusInput!) {
    updateStatusCompanyAlias(input: $input)
  }
`
