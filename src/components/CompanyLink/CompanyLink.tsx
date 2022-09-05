import React from 'react'
import { Box, Text, Link } from 'theme-ui'
import { CompanyLogo, Icon } from '..'
import { ViewInterface } from '../../types'
import { Routes } from '../../types/enums'
import { convertURL, isURL } from '../../utils'

type Props = ViewInterface<{
  company: {
    company_id: number
    name: string
    logo_bucket_url?: string
    website_url?: string
  }
}>

const CompanyLink = ({ company, sx }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <Text
        sx={{
          flex: 1,
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: 14,
          '&:hover': { color: 'primary' },
        }}
        onClick={() =>
          window.open(
            Routes.COMPANY.replace(':id', `${company.company_id}`),
            '_blank',
            'noopener,noreferrer'
          )
        }
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& img': { width: '25px', height: '25px', borderRadius: '4px' },
          }}
        >
          <CompanyLogo src={company.logo_bucket_url}></CompanyLogo>
          <Text>{`${company.name}`}</Text>
        </Box>
      </Text>
      {isURL(company.website_url || '') ? (
        <Link
          sx={{ cursor: 'pointer', ml: 2, mt: 1 }}
          href={convertURL(company.website_url || '')}
          target="_blank"
        >
          <Icon icon="link" color="primary" />
        </Link>
      ) : null}
    </Box>
  )
}

export default CompanyLink
