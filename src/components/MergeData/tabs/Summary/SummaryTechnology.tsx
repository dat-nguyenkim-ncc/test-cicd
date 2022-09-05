import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import ExpandLabel from './ExpandLabel'
import { Technology, TechnologyTypes } from '../../../../pages/CompanyForm/TechnologyForm'
import { TechnologyProvider } from '../../../../pages/CompanyForm/TechnologyProvider'
import { Certification } from '../../../../pages/CompanyForm/CertificationForm'

type SummaryTechnologyProps = {
  label?: string
  technology: Technology[]
  technologyProvider: TechnologyProvider[]
  technologyCertification: Certification[]
}

const SummaryTechnology = ({
  label,
  technology = [],
  technologyCertification = [],
  technologyProvider = [],
}: SummaryTechnologyProps) => {
  const [isExpand, setExpand] = useState<boolean>(true)
  const allCertificationTypes = technologyCertification.reduce((res, item) => {
    if (!res.includes(item.certification)) return [...res, item.certification]
    return res
  }, [] as string[])
  return (
    <Box
      sx={{
        pb: 16,
        mb: 16,
        px: 2,
        borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label && (
        <ExpandLabel label={label} isExpand={isExpand} onClick={() => setExpand(!isExpand)} />
      )}

      {isExpand &&
        (!!technology.length || technologyProvider?.length || technologyCertification?.length ? (
          <>
            {TechnologyTypes.map(({ id, text }, index: number) => {
              const dataOfType = technology.filter(
                ({ technology_type_id }) => technology_type_id === id
              )
              return (
                !!dataOfType.length && (
                  <Box key={`technology - ${index}`} sx={{ mt: 16 }}>
                    <Paragraph bold>{text}</Paragraph>
                    {dataOfType.map((uc, i) => (
                      <Flex key={`technology - ${index} - ${i}`} sx={{ ml: 1, mt: 16 }}>
                        <Box
                          sx={{
                            mt: '5px',
                            mr: 2,
                            borderStyle: 'solid',
                            borderColor: 'primary',
                            backgroundColor: 'primary',
                            width: 5,
                            height: 5,
                            borderRadius: '100%',
                            cursor: 'pointer',
                          }}
                        ></Box>
                        <Paragraph>{uc.technology_value}</Paragraph>
                      </Flex>
                    ))}
                  </Box>
                )
              )
            })}
            {allCertificationTypes.map((value, index: number) => {
              const dataOfType = technologyCertification.filter(
                ({ certification }) => certification === value
              )
              return (
                !!dataOfType.length && (
                  <Box key={`certification - ${index}`} sx={{ mt: 16 }}>
                    <Paragraph bold>{value || ''}</Paragraph>
                    {dataOfType.map((uc, i) => (
                      <Flex key={`certification - ${index} - ${i}`} sx={{ ml: 1, mt: 16 }}>
                        <Box
                          sx={{
                            mt: '5px',
                            mr: 2,
                            borderStyle: 'solid',
                            borderColor: 'primary',
                            backgroundColor: 'primary',
                            width: 5,
                            height: 5,
                            borderRadius: '100%',
                            cursor: 'pointer',
                          }}
                        ></Box>
                        <Paragraph>{uc.certification_upload_bucket_key || 'Empty File'}</Paragraph>
                      </Flex>
                    ))}
                  </Box>
                )
              )
            })}
            {!!technologyProvider.length && (
              <Box key={''} sx={{ mt: 16 }}>
                <Paragraph bold>{`Technology Providers`}</Paragraph>
                {technologyProvider.map((uc, i) => (
                  <Flex key={i} sx={{ ml: 1, mt: 16 }}>
                    <Box
                      sx={{
                        mt: '5px',
                        mr: 2,
                        borderStyle: 'solid',
                        borderColor: 'primary',
                        backgroundColor: 'primary',
                        width: 5,
                        height: 5,
                        borderRadius: '100%',
                        cursor: 'pointer',
                      }}
                    ></Box>
                    <Paragraph>{uc.name}</Paragraph>
                  </Flex>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryTechnology
