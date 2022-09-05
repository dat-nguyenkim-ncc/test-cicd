import React, { useState } from 'react'
import { MappedTagData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import { Box, Flex, Grid } from 'theme-ui'
import { Triangle } from '../../..'
import ExpandLabel from './ExpandLabel'
import strings from '../../../../strings'
import {
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumDimensionValue,
} from '../../../../types/enums'

type SummaryTaxonomyProps = {
  label?: string
  data: MappedTagData[]
  isPrimary?: boolean
}

const SummaryTaxonomy = ({ label, data, isPrimary = false }: SummaryTaxonomyProps) => {
  const {
    companyMapping: copy,
    merge: { taxonomyTab },
  } = strings

  const [isExpand, setExpand] = useState<boolean>(true)
  return (
    <Box
      sx={{
        pb: 16,
        px: 2,
        mb: 16,
        borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {label && (
        <ExpandLabel label={label} isExpand={isExpand} onClick={() => setExpand(!isExpand)} />
      )}

      {isExpand &&
        (data && !!data.length ? (
          <Box>
            {taxonomyTab.map(({ value, label: tab }) => {
              if (!!data?.filter(t => t.type === value).length) {
                return (
                  <Box key={value} sx={{ my: 16 }}>
                    <Paragraph sx={{ pt: 2 }} bold>
                      {tab}
                    </Paragraph>
                    <Grid sx={{ mt: 3 }} gap={0} columns={[2, '1fr 4fr']}>
                      <Paragraph sx={{ flex: 1 }} bold>
                        {copy.dimension1ByTypeTech[value as keyof typeof copy.dimension1ByTypeTech]}
                      </Paragraph>
                      <Paragraph sx={{ flex: 1 }} bold>
                        CLUSTER
                      </Paragraph>
                    </Grid>
                    {value === EnumCompanyTypeSector.FIN ? (
                      data
                        ?.filter(t => t.type === value)
                        ?.map((tax, index) => {
                          const sector =
                            tax.dimensionType === EnumDimensionType.SECTOR
                              ? tax
                              : tax.parent.find(
                                  ({ dimension }) => dimension === EnumDimensionValue.SECONDARY
                                )
                          const parent =
                            tax.dimensionType === EnumDimensionType.SECTOR
                              ? null
                              : tax.parent.filter(({ dimension }) => dimension === tax.dimension)
                          return (
                            <Grid key={index} gap={0} columns={[2, '1fr 4fr']}>
                              <Flex sx={{ minWidth: '1fr', ml: 1, mt: 3, alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    borderStyle: 'solid',
                                    borderColor: 'primary',
                                    backgroundColor: 'primary',
                                    width: 5,
                                    height: 5,
                                    borderRadius: '100%',
                                    cursor: 'pointer',
                                  }}
                                ></Box>
                                <Box sx={{ ml: 2 }}>
                                  <Flex>
                                    <Paragraph>{sector?.label}</Paragraph>
                                  </Flex>
                                </Box>
                              </Flex>
                              {parent && (
                                <Flex key={index} sx={{ ml: 1, mt: 3, alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      borderStyle: 'solid',
                                      borderColor: 'primary',
                                      backgroundColor: 'primary',
                                      width: 5,
                                      height: 5,
                                      borderRadius: '100%',
                                      cursor: 'pointer',
                                    }}
                                  ></Box>
                                  <Box sx={{ ml: 2 }}>
                                    <Flex sx={{ mr: 2, alignItems: 'baseline' }}>
                                      {parent
                                        .filter(
                                          ({ dimensionType }) =>
                                            dimensionType === EnumDimensionType.CLUSTER
                                        )
                                        .map(({ label }, index) => (
                                          <Flex
                                            key={index}
                                            sx={{ mr: 2, mt: 1, alignItems: 'baseline' }}
                                          >
                                            <Paragraph sx={{ mr: 2 }}>{label}</Paragraph>
                                            <Triangle />
                                          </Flex>
                                        ))}
                                      <Paragraph>{tax.label || ''}</Paragraph>
                                    </Flex>
                                  </Box>
                                </Flex>
                              )}
                            </Grid>
                          )
                        })
                    ) : (
                      <Grid gap={0} columns={[2, '1fr 4fr']}>
                        <Box sx={{ minWidth: '1fr' }}>
                          {data
                            ?.filter(
                              t => t.type === value && t.dimensionType !== EnumDimensionType.CLUSTER
                            )
                            .map((tax, index) => {
                              return (
                                <Flex key={index} sx={{ ml: 1, mt: 3, alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      borderStyle: 'solid',
                                      borderColor: 'primary',
                                      backgroundColor: 'primary',
                                      width: 5,
                                      height: 5,
                                      borderRadius: '100%',
                                      cursor: 'pointer',
                                    }}
                                  ></Box>
                                  <Box sx={{ ml: 2, alignItems: 'baseline' }}>
                                    <Paragraph sx={{ mt: 1 }}>{tax.label}</Paragraph>
                                  </Box>
                                </Flex>
                              )
                            })}
                        </Box>
                        <Box>
                          {data
                            ?.filter(
                              t => t.type === value && t.dimensionType === EnumDimensionType.CLUSTER
                            )
                            .map((tax, index) => {
                              return (
                                <Flex key={index} sx={{ ml: 1, mt: 3, alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      borderStyle: 'solid',
                                      borderColor: 'primary',
                                      backgroundColor: 'primary',
                                      width: 5,
                                      height: 5,
                                      borderRadius: '100%',
                                      cursor: 'pointer',
                                    }}
                                  ></Box>
                                  <Box sx={{ ml: 2 }}>
                                    <Flex sx={{ mr: 2, alignItems: 'baseline' }}>
                                      {tax.parent &&
                                        tax.parent
                                          .filter(
                                            ({ dimensionType, dimension }) =>
                                              dimensionType === tax.dimensionType && dimension === tax.dimension
                                          )
                                          .map(({ label }, index) => {
                                            return (
                                              <Flex
                                                key={index}
                                                sx={{ mr: 2, mt: 1, alignItems: 'baseline' }}
                                              >
                                                <Paragraph sx={{ mr: 2 }}>{label}</Paragraph>
                                                {index <
                                                  tax.parent.filter(
                                                    ({ dimensionType }) =>
                                                      dimensionType === tax.dimensionType
                                                  ).length && <Triangle />}
                                              </Flex>
                                            )
                                          })}
                                      <Paragraph sx={{ mt: 1 }}>{tax.label}</Paragraph>
                                    </Flex>
                                  </Box>
                                </Flex>
                              )
                            })}
                        </Box>
                      </Grid>
                    )}
                  </Box>
                )
              }
              return null
            })}
          </Box>
        ) : (
          <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA IS MERGED</Paragraph>
        ))}
    </Box>
  )
}

export default SummaryTaxonomy
