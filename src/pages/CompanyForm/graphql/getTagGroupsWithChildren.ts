import { gql } from '@apollo/client'

export default gql`
  query GetTagGroups($sources: [EnumTagGroupSource]) {
    getTagGroups(sources: $sources) {
      id
      label
      isPriority
      children {
        label
        id
        shownOnBanksy
      }
    }
  }
`
