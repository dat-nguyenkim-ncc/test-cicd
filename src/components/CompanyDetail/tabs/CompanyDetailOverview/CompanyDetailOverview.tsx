import React from 'react'
import { Grid, Box, Flex } from 'theme-ui'
import { CompanyOverview } from '../../../../types'
import strings from '../../../../strings'
import CompanyDetailInline from '../CompanyDetailInline'
import { Paragraph } from '../../../primitives'
import { useLazyQuery } from '@apollo/client'
import { getSignUrl } from '../../../../pages/CompanyForm/graphql'
import { EnumExpandStatus } from '../../../../types/enums'
import { transformViewDate } from '../../../../pages/CompanyForm/helpers'
import moment from 'moment'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../../../utils/consts'

export type CompanyDetailOverviewProps = {
  data: CompanyOverview
}

const CompanyDetailOverview = ({ data }: CompanyDetailOverviewProps) => {
  const {
    companyDetail: { overview: copy },
  } = strings

  const mapTitles = {
    id: copy.companyId,
    url: copy.url,
    foundedYear: copy.foundedYear,
    status: copy.status,
    lastFundingType: copy.lastFundingType,
    companyType: copy.companyType,
    closedDate: copy.closedDate,
    otherNames: copy.otherNames,
    // logoUrl: copy.logoUrl,
    contactEmail: copy.contactEmail,
    phoneNumber: copy.phoneNumber,
    categories: copy.categories,
    category_groups: copy.categoryGroups,
    tags: copy.tags,
    industries: copy.industries,
    numberEmployee: copy.numberEmployee,
    revenue: copy.revenue,
    facebook_url: copy.facebookUrl,
    linkedin_url: copy.linkedinUrl,
    twitter_url: copy.twitterUrl,
    ftes_exact: copy.ftesExact,
    ftes_range: copy.ftesRange,
  }

  const [getFileUrl, { loading, data: fileData }] = useLazyQuery(getSignUrl, {
    fetchPolicy: 'network-only',
    onCompleted() {
      const url = fileData?.getSignUrl[0]?.signedUrl
      if (url) {
        window.open(url)
      }
    },
  })

  const downloadFile = (id: string | null) => {
    if (!loading) {
      getFileUrl({
        variables: {
          input: {
            companyIds: [+data.id],
            fileDetails: [{ fileId: id }],
            operation: 'getObject',
          },
        },
      })
    }
  }

  return (
    <Box sx={{ maxWidth: '71%' }}>
      <Grid mt={6} gap={0} columns={'50% 50%'}>
        {Object.keys(mapTitles).map(t => {
          if (!mapTitles[t as keyof typeof mapTitles]) return null

          const title = `${mapTitles[t as keyof typeof mapTitles]}:`
          const value = data[t as keyof typeof data]
          const detail =
            t === 'closedDate'
              ? value
                ? transformViewDate(value?.toString())
                : null
              : value?.toString()

          if (!detail) return null

          return <CompanyDetailInline key={title} title={title} detail={detail} />
        })}
      </Grid>
      {data.description && (
        <Box mt={5}>
          <Paragraph sx={{ mb: 4 }} bold>
            {copy.description}
          </Paragraph>
          <Paragraph>{data.description}</Paragraph>
        </Box>
      )}
      {data.companyLocation && data.companyLocation.length > 0 && (
        <Box mt={5}>
          <Paragraph sx={{ mb: 4 }} bold>
            {copy.location}
          </Paragraph>
          {/* TODO: refactor the duplication here */}
          <Paragraph sx={{ mb: 4 }} bold>
            Headquarters
          </Paragraph>
          {data.companyLocation
            .filter(
              l =>
                l.isHeadQuarter &&
                (l.expandStatus === EnumExpandStatus.FOLLOWING || data.isExternalViewDetail)
            )
            .map((l, index) => {
              let location = l.postalCode ? `${l.postalCode}<br />` : ''
              location += l.location.region ? `${l.location.region}<br />` : ''
              location += l.location.city ? `${l.location.city}, ` : ''
              location += l.location.country ? `${l.location.country}<br />` : ''

              return (
                <Paragraph sx={{ mt: index === 0 ? 0 : 3 }} key={index}>
                  {location}
                </Paragraph>
              )
            })}
          <Paragraph sx={{ mt: 4, mb: 4 }} bold>
            Other Locations
          </Paragraph>
          {data.companyLocation
            .filter(
              l =>
                !l.isHeadQuarter &&
                (l.expandStatus === EnumExpandStatus.FOLLOWING || data.isExternalViewDetail)
            )
            .map((l, index) => {
              let location = l.postalCode ? `${l.postalCode}<br />` : ''
              location += l.location.region ? `${l.location.region}<br />` : ''
              location += l.location.city ? `${l.location.city}, ` : ''
              location += l.location.country ? `${l.location.country}<br />` : ''

              return (
                <Paragraph sx={{ mt: index === 0 ? 0 : 3 }} key={index}>
                  {location}
                </Paragraph>
              )
            })}
        </Box>
      )}
      {data.attachments && data.attachments.length > 0 && (
        <Box mt={5}>
          <Paragraph sx={{ mb: 4 }} bold>
            {copy.attachments}
          </Paragraph>
          {data.attachments
            .slice()
            .filter(el => el.expandStatus === EnumExpandStatus.FOLLOWING)
            .map((el, index) => {
              return (
                <Box key={index} sx={{ bg: '#F0FBF7', my: 3, borderRadius: 10, p: 4 }}>
                  <Flex>
                    <Box
                      onClick={() => {
                        downloadFile(el.url_attachment)
                      }}
                      sx={{ cursor: loading ? 'wait' : 'pointer' }}
                    >
                      <Paragraph sx={{ mb: 1, color: 'primary' }} bold>
                        {((el.name || '').lastIndexOf('.') !== -1
                          ? el.name?.slice(0, el.name.lastIndexOf('.'))
                          : el.name) || ''}
                      </Paragraph>
                      <Paragraph sx={{ mb: 1 }}>{'Uploaded Date: ' + moment(el.date_created).format(DEFAULT_VIEW_DATE_FORMAT)}</Paragraph>
                      {el.type && <Paragraph sx={{ mb: 1 }}>{el.type}</Paragraph>}
                      <Paragraph>{el.description || ''}</Paragraph>
                      {!el.name && !el.description && (
                        <Paragraph sx={{ color: 'primary' }}>{el.url_attachment || ''}</Paragraph>
                      )}
                    </Box>
                  </Flex>
                </Box>
              )
            })}
        </Box>
      )}
    </Box>
  )
}

export default CompanyDetailOverview
