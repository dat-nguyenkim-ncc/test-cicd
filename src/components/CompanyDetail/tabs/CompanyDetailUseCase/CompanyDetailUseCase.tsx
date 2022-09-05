import React from 'react'
import { Box } from 'theme-ui'
import { CompanyPeople } from '../../../../types'
import { Paragraph } from '../../../primitives'
import { useApolloClient, useQuery } from '@apollo/client'
import {
  GET_COMPANY_USE_CASE,
  GET_SIGN_URL_FOR_OTHERS,
  GET_USE_CASE_TYPE,
  GET_COMPANY_CURRENT_CLIENT,
} from '../../../../pages/CompanyForm/graphql'
import { UseCaseResult } from '../../../UseCaseForm/UseCaseForm'
import { Updating } from '../../..'
import { ENumDataType, EnumExpandStatusId, EnumSignUrlOperation } from '../../../../types/enums'
import { onError } from '../../../../sentry'
import { CurrentClientResult } from '../../../CurrentClientForm/CurrentClientForm'

export type CompanyDetailUseCaseProps = { data: CompanyPeople }

const CompanyDetailUseCase = ({ data }: CompanyDetailUseCaseProps) => {
  const client = useApolloClient()

  const [updating, setUpdating] = React.useState<boolean>(false)

  const { data: allTypes, loading: typeLoading } = useQuery(GET_USE_CASE_TYPE)
  const { data: useCases, loading: ucLoading } = useQuery(GET_COMPANY_USE_CASE, {
    variables: { companyId: +data.companyId, activeOnly: true },
  })

  const { data: currentClient, loading: currentClientLoading } = useQuery(
    GET_COMPANY_CURRENT_CLIENT,
    {
      variables: { companyId: +data.companyId, activeOnly: true },
    }
  )

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: ENumDataType.USE_CASE,
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

  return ucLoading || typeLoading || currentClientLoading ? (
    <Updating loading />
  ) : (
    <Box mt={6}>
      {!!currentClient?.getCompanyCurrentClient.currentClients.length && (
        <Box sx={{ mb: 5 }}>
          <Paragraph sx={{ mb: 3 }} bold>
            {'Current Client'}
          </Paragraph>
          {currentClient?.getCompanyCurrentClient.currentClients.map(
            (item: CurrentClientResult) => {
              return (
                <Box sx={{ bg: 'gray03', mt: 3, px: 4, py: 3, width: '50%', borderRadius: 10 }}>
                  <Paragraph sx={{ py: 1 }} bold>
                    {item.name}
                  </Paragraph>
                  {!!item.logo_bucket_url && (
                    <Paragraph
                      onClick={() => {
                        !updating && onDownloadFile(item.logo_bucket_url as string)
                      }}
                      sx={{ color: 'primary', cursor: updating ? 'wait' : 'pointer', py: 1 }}
                      bold
                    >
                      {item.logo_bucket_url}
                    </Paragraph>
                  )}
                  {!!item.url && <Paragraph sx={{ py: 1 }}>{item.url}</Paragraph>}
                </Box>
              )
            }
          )}
        </Box>
      )}
      {allTypes?.getUseCaseType.map((type: any, idx: number) => {
        const dataTemp: UseCaseResult[] = useCases?.getCompanyUseCase.useCases.filter(
          ({ use_case_type_id, fct_status_id }: UseCaseResult) =>
            use_case_type_id === type.useCaseTypeId &&
            fct_status_id === +EnumExpandStatusId.FOLLOWING
        )
        if (!dataTemp?.length) return null
        return (
          <Box sx={{ mb: 5 }} key={idx}>
            <Paragraph sx={{ mb: 3 }} bold>
              {type.useCaseTypeName}
            </Paragraph>
            {dataTemp.map((item: UseCaseResult, index) => {
              return (
                <Paragraph
                  key={index}
                  sx={
                    !type.isFile
                      ? { mt: 1 }
                      : { color: 'primary', mt: 1, cursor: updating ? 'wait' : 'pointer' }
                  }
                  onClick={() => {
                    type.isFile && !updating && onDownloadFile(item.use_case_value)
                  }}
                  bold={type.isFile}
                >
                  {`${item.use_case_value}${dataTemp.length > index + 1 ? ',' : ''}`}
                </Paragraph>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}

export default CompanyDetailUseCase
