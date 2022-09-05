import { gql } from '@apollo/client'
import { Fragments } from '../../CompanyForm/graphql'

export default gql`
  query getOverrideVisibility($input: OverrideVisibilityInput) {
    getOverrideVisibility(input: $input) {
      ...OverrideVisibility
    }
  }

  ${Fragments.overrideVisibility}
`
