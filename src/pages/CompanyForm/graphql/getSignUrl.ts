import { gql } from '@apollo/client'

export default gql`
  query getSignUrl($input: SignUrlInput!) {
    getSignUrl(input: $input) {
      fileId
      signedUrl
    }
  }
`

export const GET_SIGN_URL_FOR_COMPANY_LOGO = gql`
  query GetSignedUrlForCompanyLogo($input: GetSignedUrlForLogo) {
    getSignedUrlForCompanyLogo(input: $input)
  }
`

export const GET_SIGN_URL_FOR_PEOPLE_IMAGE = gql`
  query GetSignedUrlForPeopleImage($input: GetSignedUrlForPeopleImage) {
    getSignedUrlForPeopleImage(input: $input)
  }
`

export const GET_SIGN_URL_FOR_OTHERS = gql`
  query getOthersSignUrl($input: OthersSignUrlInput) {
    getOthersSignUrl(input: $input) {
      fileId
      signedUrl
    }
  }
`

export type GetSignedUrlForLogoInput = {
  companyId: number
  contentType: string
  hashedImage: string
}
