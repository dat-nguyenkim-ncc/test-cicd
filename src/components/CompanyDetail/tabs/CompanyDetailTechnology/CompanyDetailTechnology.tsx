import React from 'react'
import { Box } from 'theme-ui'
import { Paragraph } from '../../../primitives'
import { useApolloClient } from '@apollo/client'
import { GET_SIGN_URL_FOR_OTHERS } from '../../../../pages/CompanyForm/graphql'
import { ENumDataType, EnumSignUrlOperation } from '../../../../types/enums'
import { onError } from '../../../../sentry'
import { Technology, TechnologyTypes } from '../../../../pages/CompanyForm/TechnologyForm'
import { TechnologyProvider } from '../../../../pages/CompanyForm/TechnologyProvider'
import { Certification } from '../../../../pages/CompanyForm/CertificationForm'

export type CompanyDetailTechnologyProps = {
  data: {
    technology: Technology[]
    technologyProvider: TechnologyProvider[]
    technologyCertification: Certification[]
  }
}

const CompanyDetailTechnology = ({
  data: { technology, technologyCertification, technologyProvider },
}: CompanyDetailTechnologyProps) => {
  const client = useApolloClient()

  const [updating, setUpdating] = React.useState<boolean>(false)

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: ENumDataType.TECHNOLOGY,
        operation: EnumSignUrlOperation.GET,
        ids: [value],
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

  const allCertificationTypes = technologyCertification.reduce((res, item) => {
    if (!res.includes(item.certification)) {
      return [...res, item.certification]
    }
    return res
  }, [] as string[])

  return (
    <Box mt={6}>
      {TechnologyTypes.map(({ id, text }, index) => {
        return (
          <Box sx={{ mb: 5 }} key={`${text}`}>
            <Paragraph sx={{ mb: 3 }} bold>
              {text}
            </Paragraph>
            {(technology || [])
              .filter(({ technology_type_id }) => technology_type_id === id)
              .map(({ technology_value }) => (
                <Paragraph key={index}>{technology_value || ''}</Paragraph>
              ))}
          </Box>
        )
      })}
      {allCertificationTypes.map(value => {
        const listCertifications = technologyCertification.filter(
          ({ certification }) => certification === value
        )
        if (listCertifications.length) {
          return (
            <>
              <Box sx={{ mb: 5 }} key={`${value}`}>
                <Paragraph sx={{ mb: 3 }} bold>
                  {value}
                </Paragraph>
                {listCertifications.map(({ certification_upload_bucket_key }, index) => (
                  <Paragraph
                    key={`file - ${index}`}
                    sx={{ color: 'primary', mt: 1, cursor: updating ? 'wait' : 'pointer' }}
                    onClick={() => {
                      !updating && onDownloadFile(certification_upload_bucket_key)
                    }}
                    bold
                  >
                    {certification_upload_bucket_key || ''}
                  </Paragraph>
                ))}
              </Box>
            </>
          )
        }
        return <></>
      })}
      <Box sx={{ mb: 5 }} key={`provider`}>
        <Paragraph sx={{ mb: 3 }} bold>
          {'Provider'}
        </Paragraph>
        {technologyProvider.map(({ name }, index) => (
          <Paragraph key={`Provider - ${index}`}>{name || ''}</Paragraph>
        ))}
      </Box>
    </Box>
  )
}

export default CompanyDetailTechnology
