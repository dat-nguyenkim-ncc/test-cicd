import { gql } from '@apollo/client'

export default gql`
  query getCompanyTagMapping($tags: [Int]!) {
    getCompanyTagMapping(tags: $tags)
  }
`
