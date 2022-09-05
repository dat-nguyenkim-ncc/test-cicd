import React from 'react'
import { useApolloClient } from '@apollo/client'
import Paragraph, { ParagraphProps } from '../primitives/Paragraph'
import { GET_SIGN_URL_FOR_OTHERS } from '../../pages/CompanyForm/graphql'
import { ENumDataType, EnumSignUrlOperation } from '../../types/enums'
import { onError } from '../../sentry'

export type BucketSignUrlProps = {
  id: string
  dataType: ENumDataType
} & ParagraphProps

const BucketSignUrl: React.FC<BucketSignUrlProps> = ({ id, dataType, children, sx, ...props }) => {
  const client = useApolloClient()
  const [updating, setUpdating] = React.useState<boolean>(false)

  const onDownloadFile = async (id: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: dataType,
        operation: EnumSignUrlOperation.GET,
        ids: [id],
        content_types: [],
      }
      const res = await client.query({
        query: GET_SIGN_URL_FOR_OTHERS,
        variables: { input },
        fetchPolicy: 'network-only',
      })
      if (res.data.getOthersSignUrl) {
        window.open(res.data.getOthersSignUrl[0].signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      onError(error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Paragraph
      sx={{ color: 'primary', mt: 1, cursor: updating ? 'wait' : 'pointer', ...sx }}
      onClick={() => {
        !updating && onDownloadFile(id)
      }}
      bold
      {...props}
    >
      {children || id}
    </Paragraph>
  )
}

export default BucketSignUrl
