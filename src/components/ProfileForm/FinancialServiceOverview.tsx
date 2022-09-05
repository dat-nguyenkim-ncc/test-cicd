import React from 'react'
import { Box, Flex } from 'theme-ui'
import { ViewInterface } from '../../types'
import { EnumExpandStatusId } from '../../types/enums'
import { Paragraph } from '../primitives'
import { FinanceServiceLicense, FinanceServiceLicenseType } from './FinanceServicesLicenses'

export default ({
  oldState,
  group,
  sx,
}: ViewInterface<{
  oldState: FinanceServiceLicense[]
  group: FinanceServiceLicenseType[]
}>) => {
  return (
    <Box
      sx={{
        bg: 'gray03',
        p: 4,
        borderRadius: '10px',
        width: '100%',
        border: '1px solid',
        borderColor: 'gray01',
        ...(sx || {}),
      }}
    >
      {oldState.map((p, index) => {
        return (
          <React.Fragment key={`view-${index}`}>
            {group.map((g, i) => {
              return (
                <React.Fragment key={`view-${index}-${i}`}>
                  <Flex
                    sx={{
                      pb: i + 1 < group.length ? 2 : 0,
                    }}
                  >
                    <Paragraph sx={{ flex: 1 }} bold>{`${g.profile_type_name}:`}</Paragraph>
                    <Box sx={{ flex: 2 }}>
                      <Paragraph
                        sx={{
                          mb: 1,
                          opacity: p.fctStatusId === +EnumExpandStatusId.FOLLOWING ? 1 : 0.5,
                        }}
                      >
                        {p[g.field]}
                      </Paragraph>
                    </Box>
                  </Flex>
                </React.Fragment>
              )
            })}
            {index + 1 < oldState.length ? (
              <Box key={index} sx={{ borderTop: '1px solid black', m: 4 }}></Box>
            ) : undefined}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
