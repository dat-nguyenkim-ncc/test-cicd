import { gql } from '@apollo/client'

export default gql`
  query GetGeography {
    getGeography {
      region {
        name
      }
      region1 {
        name
        parent
      }
      region2 {
        name
        parent
        parent1
      }
      countries {
        name
        parent
        parent1
        parent2
      }
    }
  }
`
