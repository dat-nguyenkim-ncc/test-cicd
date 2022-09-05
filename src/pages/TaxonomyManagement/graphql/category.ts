import gql from 'graphql-tag'
import { EnumCompanyTypeSector } from '../../../types/enums'

export const GET_CATEGORY = gql`
  query($id: Int!) {
    getCategory(id: $id) {
      id
      name
      description
    }
  }
`

export const EDIT_CATEGORY = gql`
  mutation($input: EditCategoryInput!) {
    editCategory(input: $input)
  }
`

export type EditCategoryInput = {
  id: number
  description: string
}

export const CATEGORY_ID = {
  [EnumCompanyTypeSector.FIN]: 1,
  [EnumCompanyTypeSector.INS]: 2,
  [EnumCompanyTypeSector.REG]: 3,
  [EnumCompanyTypeSector.OUT]: 4,
}

export type Category = {
  id: number
  name: string
  description: string
}
