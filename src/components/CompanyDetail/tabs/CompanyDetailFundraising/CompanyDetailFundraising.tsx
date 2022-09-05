import React, { useEffect } from 'react'
import { Box, Flex } from 'theme-ui'
import usePagination from '../../../../hooks/usePagination'
import { useApolloClient, useQuery } from '@apollo/client'
import {
  CompanyFundraisingData,
  GetCompanyFundraisingResult,
  GetCompanyFundraisingVariables,
  GET_COMPANY_FUNDRAISING,
} from '../../../../pages/CompanyForm/graphql/companyFundraising'
import Updating from '../../../Updating'
import strings from '../../../../strings'
import { formattedValue, Value } from '../../../../utils/helper'
import CompanyDetailInline from '../CompanyDetailInline'
import { ENumDataType, EnumSignUrlOperation } from '../../../../types/enums'
import { GET_SIGN_URL_FOR_OTHERS } from '../../../../pages/CompanyForm/graphql'
import { Paragraph } from '../../../primitives'
import { onError } from '../../../../sentry'

const {
  pages: { fundraising: copy },
} = strings

export type CompanyDetailFundraisingProps = {
  data: {
    companyId: number
  }
}

const CompanyDetailFundraising = ({ data }: CompanyDetailFundraisingProps) => {
  const client = useApolloClient()

  const [updating, setUpdating] = React.useState<boolean>(false)

  const { pagination, total, setTotal } = usePagination({
    gotoPageCallback: () => {},
  })

  const { data: fundraisingData, loading } = useQuery<
    GetCompanyFundraisingResult,
    GetCompanyFundraisingVariables
  >(GET_COMPANY_FUNDRAISING, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    skip: !data?.companyId,
    variables: {
      companyId: data?.companyId,
      page: pagination.page,
      size: pagination.pageSize,
      activeOnly: true,
    },
  })

  const onDownloadFile = async (value: string) => {
    try {
      setUpdating(true)
      const input = {
        data_type: ENumDataType.FUNDRAISING,
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

  useEffect(() => {
    if (fundraisingData?.getCompanyFundraising?.total !== total)
      setTotal(fundraisingData?.getCompanyFundraising?.total || 0)
  }, [fundraisingData, total, setTotal])

  const list: CompanyFundraisingData[] = fundraisingData?.getCompanyFundraising?.result || []

  if (loading) return <Updating loading />
  return (
    <Box sx={{ mt: 6, maxWidth: '100%' }}>
      <>
        {list.map(item => {
          return (
            <Box key={item.id} sx={{ mb: 3 }}>
              <RoundInfo info={item} updating={updating} onDownload={onDownloadFile} />
            </Box>
          )
        })}
      </>
      {/* <Pagination /> */}
    </Box>
  )
}

export default CompanyDetailFundraising

const RoundInfo = ({
  info,
  updating,
  onDownload,
}: {
  info: CompanyFundraisingData
  updating: boolean
  onDownload: (v: string) => void
}) => {
  return (
    <Box>
      {[
        {
          name: copy.fields.isFundraising,
          value: info.isFundraising,
          format: (v: Value) => (!!v ? 'Yes' : 'No'),
        },
        { name: copy.fields.proceedsUtilization, value: info.proceedsUtilization },
        { name: copy.fields.investorRelationsContact, value: info.investorRelationsContact },
        { name: copy.fields.pitchDeckBucketKey, value: info.pitchDeckBucketKey },
      ].map((item, index) => {
        if (item.name === copy.fields.pitchDeckBucketKey) {
          return (
            <Flex key={item.name + index} sx={{ pr: 2, mb: 4 }}>
              <Paragraph bold sx={{ mr: 1 }}>
                {`${item.name}:`}
              </Paragraph>
              <Paragraph
                sx={{
                  maxWidth: 200,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'primary',
                  cursor: updating ? 'wait' : 'pointer',
                }}
                onClick={() => onDownload(String(item.value))}
              >
                {item.value}
              </Paragraph>
            </Flex>
          )
        }
        return (
          <CompanyDetailInline
            key={item.name + index}
            title={item.name + ': '}
            detail={formattedValue(item.value, item.format)}
            sx={{ maxWidth: 450 }}
          />
        )
      })}
    </Box>
  )
}
