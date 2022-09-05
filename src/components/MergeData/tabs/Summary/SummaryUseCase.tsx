import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import ExpandLabel from './ExpandLabel'
import { UseCaseResult } from '../../../UseCaseForm/UseCaseForm'
import { UseCaseTypeResult } from '../../../../pages/CompanyForm/UseCaseFormPage'
import { CurrentClientResult } from '../../../CurrentClientForm/CurrentClientForm'
import strings from '../../../../strings'

type SummaryUseCaseProps = {
  label?: string
  data: { useCases: UseCaseResult[]; currentClients: CurrentClientResult[] }
  useCaseTypes: UseCaseTypeResult[]
}

const SummaryUseCase = ({ label, data, useCaseTypes }: SummaryUseCaseProps) => {
  const {
    pages: {
      addCompanyForm: { titles },
    },
  } = strings

  const [isExpand, setExpand] = useState<boolean>(true)

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
        (data && !![...data.useCases, ...data.currentClients].length ? (
          <>
            {!!data.currentClients.length && (
              <Box sx={{ mt: 16 }}>
                <Paragraph bold>{titles.currentClients}</Paragraph>
                {data.currentClients.map((c, i) => (
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
                    <Paragraph>{`${c.name}${c.url ? ` (${c.url})` : ''}`}</Paragraph>
                  </Flex>
                ))}
              </Box>
            )}
            {useCaseTypes.map((type: UseCaseTypeResult, index: number) => {
              const dataOfType = data.useCases.filter(
                ({ use_case_type_id }) => use_case_type_id === type.useCaseTypeId
              )
              return (
                !!dataOfType.length && (
                  <Box key={index} sx={{ mt: 16 }}>
                    <Paragraph bold>{type.useCaseTypeName}</Paragraph>
                    {dataOfType.map((uc, i) => (
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
                        <Paragraph>{uc.use_case_value}</Paragraph>
                      </Flex>
                    ))}
                  </Box>
                )
              )
            })}
          </>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryUseCase
