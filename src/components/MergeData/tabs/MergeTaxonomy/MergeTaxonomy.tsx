import React, { useState } from 'react'
import { MappedTagData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import strings from '../../../../strings'
import { Box, Flex, Grid } from 'theme-ui'
import {
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumDimensionValue,
} from '../../../../types/enums'
import { Triangle } from '../../..'
import TaxonomyItem from './TaxonomyItem'

type MergeTaxonomyProps = {
  label?: string
  isPrimary?: boolean
  extra: MappedTagData[]
  data: MappedTagData[]
  primary?: MappedTagData[]
  dimensions: MappedTagData[]
  isOutType?: boolean
  setIsOutType?(isOut: boolean): void
  onChange(data: MappedTagData[]): void
}

const subs = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5']
const GRID = '125px 46px repeat(5, 115px 30px)'
const EXTRA_WIDTH = '200px'

const MergeTaxonomy = ({
  label,
  isPrimary,
  extra,
  data,
  primary,
  dimensions = [],
  isOutType,
  setIsOutType,
  onChange,
}: MergeTaxonomyProps) => {
  const {
    companyMapping: copy,
    merge: { taxonomyTab },
  } = strings

  const [currentTab, setCurrentTab] = useState<EnumCompanyTypeSector>(
    isOutType ? EnumCompanyTypeSector.OUT : (taxonomyTab[0].value as EnumCompanyTypeSector)
  )

  const checkDisable = (tab: string) => {
    // not necessary for now
    return false
  }

  return (
    <Box sx={{ px: 60 }}>
      {label && (
        <Paragraph sx={{ fontSize: '20px' }} bold>
          {label}
        </Paragraph>
      )}
      <Flex sx={{ mt: '16px', borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)' }}>
        {(isPrimary ? taxonomyTab : taxonomyTab.slice(0, 3)).map(({ value, label }, index) => {
          const isActive = value === currentTab
          return (
            <Box
              key={index}
              onClick={() => {
                if (!checkDisable(value)) {
                  setCurrentTab(value as EnumCompanyTypeSector)
                  setIsOutType && setIsOutType(value === EnumCompanyTypeSector.OUT)
                }
              }}
            >
              <Paragraph
                sx={{
                  mx: 2,
                  cursor: 'pointer',
                  p: 2,
                  pb: 3,
                  borderBottom: `${isActive ? 'solid 2px' : ''}`,
                  borderColor: 'primary',
                  opacity: `${!checkDisable(value) ? '1' : '0.25'}`,
                }}
                bold={isActive}
              >
                {label}
              </Paragraph>
            </Box>
          )
        })}
      </Flex>
      {currentTab === EnumCompanyTypeSector.OUT ? undefined : !!data.filter(
          ({ type }) => type === currentTab
        ).length ? (
        <Box sx={{ my: 4, px: 2 }}>
          <Grid gap={0} columns={`${EXTRA_WIDTH} auto`}>
            <Paragraph sx={{ flex: 1 }} bold>
              {copy.dimension1ByTypeTech[currentTab as keyof typeof copy.dimension1ByTypeTech]}
            </Paragraph>
            <Grid gap={0} columns={GRID} sx={{ alignItems: 'center', px: 3 }}>
              {subs.map((s, index) => (
                <React.Fragment key={s}>
                  <Paragraph sx={{ flex: 1 }} bold>
                    {copy.headers[s as keyof typeof copy.headers]}
                  </Paragraph>
                  {index < subs.length - 1 && <Triangle />}
                </React.Fragment>
              ))}
            </Grid>
          </Grid>
          {currentTab === EnumCompanyTypeSector.FIN ? (
            <>
              {data
                .filter(
                  ({ type, dimensionType }) =>
                    type === currentTab && dimensionType === EnumDimensionType.CLUSTER
                )
                .map((tax, index) => {
                  return (
                    <Flex key={index} sx={{ mt: 3 }}>
                      <Box sx={{ pr: 3, minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                        <TaxonomyItem
                          key={index}
                          data={
                            tax.parent.find(
                              ({ dimension }) => dimension === EnumDimensionValue.SECONDARY
                            ) || ({} as MappedTagData)
                          }
                          checked={
                            !!dimensions?.find(
                              ({ companyDimensionId }) =>
                                companyDimensionId === tax.companyDimensionId
                            )
                          }
                          disabled={checkDisable(tax.type)}
                          isPrimary={isPrimary}
                          onCheck={b => {
                            let cloneDimensions = [...dimensions]
                            if (isPrimary) {
                              cloneDimensions = []
                            }
                            if (b) {
                              cloneDimensions.push(tax)
                            } else
                              cloneDimensions = cloneDimensions.filter(
                                ({ companyDimensionId }) =>
                                  companyDimensionId !== tax.companyDimensionId
                              )
                            onChange(cloneDimensions)
                          }}
                        ></TaxonomyItem>
                      </Box>
                      <Box>
                        <TaxonomyItem
                          key={index}
                          data={{
                            ...tax,
                            parent: tax.parent.filter(
                              ({ dimension }) => dimension === tax.dimension
                            ),
                          }}
                          checked={
                            !!dimensions?.find(
                              ({ companyDimensionId }) =>
                                companyDimensionId === tax.companyDimensionId
                            )
                          }
                          disabled={checkDisable(tax.type)}
                          isPrimary={isPrimary}
                          onCheck={b => {
                            let cloneDimensions = [...dimensions]
                            if (isPrimary) {
                              cloneDimensions = []
                            }
                            if (b) {
                              cloneDimensions.push(tax)
                            } else
                              cloneDimensions = cloneDimensions.filter(
                                ({ companyDimensionId }) =>
                                  companyDimensionId !== tax.companyDimensionId
                              )
                            onChange(cloneDimensions)
                          }}
                        ></TaxonomyItem>
                      </Box>
                    </Flex>
                  )
                })}
              {data
                .filter(
                  ({ dimensionType, link_id }) =>
                    dimensionType === EnumDimensionType.SECTOR && !link_id
                )
                .map((tax, index) => (
                  <Flex key={index} sx={{ mt: 3 }}>
                    <Box sx={{ pr: 3, minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                      <TaxonomyItem
                        key={index}
                        data={tax}
                        checked={!!dimensions?.find(({ id }) => id === tax.id)}
                        disabled={checkDisable(tax.type)}
                        isPrimary={isPrimary}
                        onCheck={b => {
                          let cloneDimensions = [...dimensions]
                          if (isPrimary) {
                            cloneDimensions = []
                          }
                          if (b) {
                            cloneDimensions.push(tax)
                          } else cloneDimensions = cloneDimensions.filter(({ id }) => id !== tax.id)
                          onChange(cloneDimensions)
                        }}
                      ></TaxonomyItem>
                    </Box>
                  </Flex>
                ))}
            </>
          ) : (
            <Flex sx={{ mt: 3 }}>
              <Box sx={{ pr: 3, minWidth: EXTRA_WIDTH, maxWidth: EXTRA_WIDTH }}>
                {[
                  ...data.filter(
                    ({ type, dimensionType }) =>
                      type === currentTab && dimensionType !== EnumDimensionType.CLUSTER
                  ),
                ].map((tax, index) => {
                  return (
                    <TaxonomyItem
                      key={index}
                      data={{
                        ...tax,
                        parent: tax.parent,
                      }}
                      checked={!!dimensions?.find(({ id }) => id === tax.id)}
                      disabled={checkDisable(tax.type)}
                      isPrimary={isPrimary}
                      onCheck={b => {
                        let cloneDimensions = [...dimensions]
                        if (isPrimary) {
                          cloneDimensions = cloneDimensions.filter(
                            ({ type, dimensionType }) =>
                              tax.type === type && tax.dimensionType !== dimensionType
                          )
                        }
                        if (b) {
                          cloneDimensions.push(tax)
                        } else cloneDimensions = cloneDimensions.filter(({ id }) => id !== tax.id)
                        onChange(cloneDimensions)
                      }}
                    ></TaxonomyItem>
                  )
                })}
              </Box>
              <Box>
                {data
                  .filter(
                    ({ type, dimensionType }) =>
                      type === currentTab && dimensionType === EnumDimensionType.CLUSTER
                  )
                  .map((tax, index) => {
                    return (
                      <TaxonomyItem
                        key={index}
                        data={{
                          ...tax,
                          parent: tax.parent.filter(({ dimension }) => dimension === tax.dimension),
                        }}
                        checked={!!dimensions?.find(({ id }) => id === tax.id)}
                        disabled={checkDisable(tax.type)}
                        isPrimary={isPrimary}
                        onCheck={b => {
                          let cloneDimensions = [...dimensions]
                          if (isPrimary) {
                            cloneDimensions = cloneDimensions.filter(
                              ({ type, dimensionType }) =>
                                tax.type === type && tax.dimensionType !== dimensionType
                            )
                          }
                          if (b) {
                            cloneDimensions.push(tax)
                          } else cloneDimensions = cloneDimensions.filter(({ id }) => id !== tax.id)
                          onChange(cloneDimensions)
                        }}
                      ></TaxonomyItem>
                    )
                  })}
              </Box>
            </Flex>
          )}
        </Box>
      ) : (
        <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA AVAILABLE</Paragraph>
      )}
    </Box>
  )
}

export default MergeTaxonomy
