import gql from 'graphql-tag'

export type MergeClustersInput = {
  defaultId: number
  listId: number[]
}

export default gql`
  mutation MergeClusters($input: MergeClustersInput) {
    mergeClusters(input: $input)
  }
`
