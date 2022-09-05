import { gql } from '@apollo/client'

export type UpdateMappingInput = {
  companyIds: number[]
  updateSectors: number[]
  sectorId: number
  movingClusters: number[]
}

export default gql`
  mutation UpdateMapping($input: UpdateMappingInput) {
    updateMapping(input: $input)
  }
`
