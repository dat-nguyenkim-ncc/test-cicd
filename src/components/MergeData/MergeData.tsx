import React, { useState } from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Heading, Paragraph } from '../primitives'
import { Button, Icon, Updating } from '../../components'
import { useQuery } from '@apollo/client'
import { getProfileType, GET_USE_CASE_TYPE } from '../../pages/CompanyForm/graphql'
import { MappedTagData, MergeLocationData, SearchResultItem, TagData } from '../../types'
import { EnumCompanyTypeSector, EnumDimensionType, EnumMergeStep } from '../../types/enums'
import strings from '../../strings'
import MergeTaxonomy from './tabs/MergeTaxonomy'
import MergeTags from './tabs/MergeTags'
import MergeProfile from './tabs/MergeProfile'
import Summary from './tabs/Summary'
import { ProfileEditType } from '../ProfileForm'
import MergeFintechType from './tabs/MergeFintechType'
import MergeOverrides from './tabs/MergeOverrides'
import MergeLocations from './tabs/MergeLocations/MergeLocations'
import MergeUseCase from './tabs/MergeUseCase'
import { UseCaseResult } from '../UseCaseForm/UseCaseForm'
import MergeFundraising from './tabs/MergeFundraising/MergeFundraising'
import { FundraisingDTOResult } from '../../pages/CompanyForm/Fundraising'
import MergeTechnology from './tabs/MergeTechnology/MergeTechnology'
import { Technology } from '../../pages/CompanyForm/TechnologyForm'
import { Certification } from '../../pages/CompanyForm/CertificationForm'
import { TechnologyProvider } from '../../pages/CompanyForm/TechnologyProvider'
import { CurrentClientResult } from '../CurrentClientForm/CurrentClientForm'
import { LicensesResult } from '../../pages/Merge'

type MergeDataProps = {
  loading: boolean
  dataMerge: DataMerge
  companies: SearchResultItem[]
  isOutType: boolean
  extraData: MappedTagData[]
  companiesData: any
  setIsOutType(isOut: boolean): void
  setDataMerge(data: DataMerge): void
  onCancel(): void
  onFinish(): void
  mergeOverridesFn: {
    isSelected(field: string, value: OverridesConflictsValueWithUId): boolean
    mergeResolveOverridesConflicts(data: ResolveMergeOverridesConflicts): void
    data: MergeCompanyOverridesInput[]
  }
}

export type OverridesConflictsValue = {
  value: string | null
  companyId: number
  dataOverrideId?: number
  createNewHistoryTree?: Boolean
  targetId?: String
  isDefaultOverride?: Boolean
  originValue?: String
  user?: string
  dateTime?: string
  headquarterLocation?: HeadquarterConflictValue
}

export type HeadquarterConflictValue = {
  country: OverridesConflictsValue
  city: OverridesConflictsValue
}

export type OverridesConflictsValueWithUId = OverridesConflictsValue & {
  uid: string
}

export type OverridesConflicts<T> = {
  field: string
  values: Array<T>
}

export type ResolveMergeOverridesConflicts = Record<string, OverridesConflictsValueWithUId>

export type MergeCompanyOverridesInput = {
  field: string
} & OverridesConflictsValue

export type DataMerge = {
  primary: MappedTagData[]
  auxiliary: MappedTagData[]
  fintechType: string[]
  tags: TagData[]
  profiles: ProfileEditType[]
  licenses: LicensesResult[]
  useCases: UseCaseResult[]
  currentClients: CurrentClientResult[]
  fundraisings: FundraisingDTOResult[]
  overrides: OverridesConflicts<OverridesConflictsValueWithUId>[]
  locations: MergeLocationData[]
  technology: Technology[]
  technologyCertification: Certification[]
  technologyProvider: TechnologyProvider[]
}
const steps = [
  { step: EnumMergeStep.PRIMARY, title: 'Primary Taxonomy' },
  { step: EnumMergeStep.AUXILIARY, title: 'Auxiliary Taxonomy' },
  { step: EnumMergeStep.FINTECH_TYPE, title: 'Fintech Type' },
  { step: EnumMergeStep.TAGS, title: 'Tags' },
  { step: EnumMergeStep.PROFILE, title: 'Company Profile' },
  { step: EnumMergeStep.USE_CASE, title: 'Use Case' },
  { step: EnumMergeStep.FUNDRAISING, title: 'Fundraising' },
  { step: EnumMergeStep.TECHNOLOGY, title: 'Technology' },
  { step: EnumMergeStep.LOCATION, title: 'Locations' },
  { step: EnumMergeStep.OVERRIDES, title: 'Company Overrides' },
  { step: EnumMergeStep.SUMMARY, title: 'Summary' },
]
const MergeData = ({
  loading,
  dataMerge,
  companies,
  isOutType,
  extraData,
  companiesData,
  setIsOutType,
  setDataMerge,
  onCancel,
  onFinish,
  ...props
}: MergeDataProps) => {
  const {
    merge: { label },
  } = strings

  const { mergeResolveOverridesConflicts, isSelected } = props.mergeOverridesFn

  const [currentStep, setCurrentStep] = useState<number>(EnumMergeStep.PRIMARY)

  // GRAPHQL
  const { data: profileType, loading: getProfileLoading } = useQuery(getProfileType)
  const { data: useCaseType, loading: UCTypeLoading } = useQuery(GET_USE_CASE_TYPE)

  const priInsValueChain = dataMerge.primary?.find(
    ({ type, dimensionType }) =>
      type === EnumCompanyTypeSector.INS && dimensionType === EnumDimensionType.VALUE_CHAIN
  )

  const priInsCluster = dataMerge.primary?.find(
    ({ type, dimensionType }) =>
      type === EnumCompanyTypeSector.INS && dimensionType === EnumDimensionType.CLUSTER
  )

  const defaultType = (dataMerge.primary || [])[0]?.type

  const disableNextStep =
    loading ||
    (!isOutType &&
      !(
        (!!defaultType && defaultType !== EnumCompanyTypeSector.INS) ||
        (defaultType === EnumCompanyTypeSector.INS && !!priInsCluster && !!priInsValueChain)
      ))

  return (
    <>
      {getProfileLoading || UCTypeLoading ? (
        <Updating loading />
      ) : (
        <Box sx={{ height: '100%', width: '100%' }}>
          <Heading center as="h4">
            Merge Data
          </Heading>
          <Flex sx={{ justifyContent: 'center', mt: '16px' }}>
            <Paragraph sx={{ fontSize: '16px' }}>Merge data of</Paragraph>
            <Paragraph
              sx={{ ml: 1, fontSize: '16px' }}
              bold
            >{`${companies.length} companies`}</Paragraph>
          </Flex>
          <Grid
            sx={{
              py: '16px',
              px: 4,
              mt: 4,
              borderTop: 'solid 1px rgba(0, 0, 0, 0.1)',
              borderBottom: 'solid 1px rgba(0, 0, 0, 0.1)',
              width: '100%',
              justifyContent: 'space-between',
            }}
            columns={`repeat(auto-fill, minmax(120px, 1fr))`}
            gap={0}
          >
            {steps.map(({ step, title }) => {
              const isActive = currentStep === step
              return (
                <Flex key={step} sx={{ alignItems: 'center', my: 1 }}>
                  {step < currentStep ? (
                    <Icon
                      icon={'tick'}
                      background={'primary'}
                      color="white"
                      sx={{ minHeight: 36, minWidth: 37, mr: 2 }}
                    />
                  ) : (
                    <Paragraph
                      sx={{
                        mr: 2,
                        p: 2,
                        minHeight: 36,
                        minWidth: 37,
                        textAlign: 'center',
                        color: `${isActive ? 'primary' : 'darkGray'}`,
                        border: 'solid 1px',
                        borderColor: `${isActive ? 'primary' : 'gray05'}`,
                        borderRadius: '50%',
                        backgroundColor: `${isActive ? '' : 'gray05'}`,
                      }}
                    >{`${step}`}</Paragraph>
                  )}
                  <Paragraph sx={{ color: `${isActive ? 'primary' : 'black'}` }}>{title}</Paragraph>
                </Flex>
              )
            })}
          </Grid>
          <Box sx={{ pt: 4, height: '60%', overflowY: 'auto' }}>
            {currentStep === EnumMergeStep.PRIMARY && (
              <MergeTaxonomy
                label={label.primary}
                isPrimary
                extra={extraData}
                data={
                  companiesData?.getDataMergeCompany.dimensions?.mapping?.filter(
                    (d: MappedTagData) => d.isPrimary
                  ) || ([] as MappedTagData[])
                }
                dimensions={dataMerge.primary}
                isOutType={isOutType}
                setIsOutType={setIsOutType}
                onChange={primary => {
                  setDataMerge({
                    ...dataMerge,
                    primary,
                    auxiliary: dataMerge.auxiliary?.filter(
                      ({ id }) =>
                        !primary.find(tax => tax.id === id || !!tax.parent.find(p => p.id === id))
                    ),
                  })
                }}
              />
            )}
            {currentStep === EnumMergeStep.AUXILIARY && (
              <MergeTaxonomy
                label={label.auxiliary}
                extra={[
                  ...extraData.filter(
                    ({ id }: { id: string }) =>
                      !dataMerge.primary?.find(
                        ({ id: idx, parent }) => !!parent?.find(p => p.id === id) || id === idx
                      )
                  ),
                  ...(companiesData?.getDataMergeCompany.dimensions?.mapping?.filter(
                    (d: MappedTagData) =>
                      !dataMerge.primary?.find(({ id }) => d.id === id) &&
                      !extraData?.find(({ id }) => d.id === id) &&
                      (!d.dimensionType || d.dimensionType === EnumDimensionType.SECTOR)
                  ) || ([] as MappedTagData[])),
                ]}
                data={companiesData?.getDataMergeCompany.dimensions?.mapping?.reduce(
                  (acc: MappedTagData[], cur: MappedTagData) => {
                    if (
                      ![...acc, ...dataMerge.primary].some(
                        d =>
                          d.id === cur.id &&
                          d.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id ===
                            cur.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id
                      )
                    ) {
                      acc.push(cur)
                    }
                    return acc
                  },
                  [] as MappedTagData[]
                )}
                primary={dataMerge.primary}
                dimensions={dataMerge.auxiliary}
                onChange={auxiliary => {
                  setDataMerge({ ...dataMerge, auxiliary })
                }}
              />
            )}
            {currentStep === EnumMergeStep.FINTECH_TYPE && (
              <MergeFintechType
                label={label.fintechType}
                data={dataMerge.fintechType}
                onChange={fintechType => {
                  setDataMerge({ ...dataMerge, fintechType })
                }}
              />
            )}
            {currentStep === EnumMergeStep.TAGS && (
              <MergeTags
                label={label.tag}
                data={companiesData?.getDataMergeCompany.dimensions?.tags}
                tags={dataMerge.tags}
                onChange={tags => {
                  setDataMerge({ ...dataMerge, tags })
                }}
              />
            )}
            {currentStep === EnumMergeStep.PROFILE && (
              <MergeProfile
                label={label.profile}
                data={{
                  profiles: companiesData?.getDataMergeCompany.profiles || [],
                  licenses: companiesData?.getDataMergeCompany.financialLicenses || [],
                }}
                profileType={profileType.getProfileType}
                profiles={dataMerge.profiles}
                licenses={dataMerge.licenses}
                onChange={data => {
                  setDataMerge({ ...dataMerge, ...data })
                }}
              />
            )}
            {currentStep === EnumMergeStep.USE_CASE && (
              <MergeUseCase
                label={label.useCase}
                data={{
                  useCases: companiesData?.getDataMergeCompany.useCases || [],
                  currentClients: companiesData?.getDataMergeCompany.currentClients || [],
                }}
                useCaseType={useCaseType?.getUseCaseType || []}
                useCases={dataMerge.useCases}
                currentClients={dataMerge.currentClients}
                onChange={data => {
                  setDataMerge({ ...dataMerge, ...data })
                }}
              />
            )}
            {currentStep === EnumMergeStep.FUNDRAISING && (
              <MergeFundraising
                label={label.fundraising}
                data={companiesData?.getDataMergeCompany.fundraisings}
                saveFundraisings={dataMerge?.fundraisings || ([] as FundraisingDTOResult[])}
                onChange={fundraisings => {
                  setDataMerge({ ...dataMerge, fundraisings })
                }}
              />
            )}
            {currentStep === EnumMergeStep.TECHNOLOGY && (
              <MergeTechnology
                label={label.technology}
                technologyData={{
                  technology: companiesData?.getDataMergeCompany.technology,
                  technologyCertification:
                    companiesData?.getDataMergeCompany.technologyCertification,
                  technologyProvider: companiesData?.getDataMergeCompany.technologyProvider,
                }}
                data={{
                  technology: dataMerge.technology || [],
                  technologyCertification: dataMerge.technologyCertification || [],
                  technologyProvider: dataMerge.technologyProvider || [],
                }}
                onChange={technology => {
                  setDataMerge({ ...dataMerge, ...technology })
                }}
              />
            )}
            {currentStep === EnumMergeStep.LOCATION && (
              <MergeLocations
                label={label.location}
                data={dataMerge.locations}
                onChange={location => {
                  setDataMerge({
                    ...dataMerge,
                    locations: dataMerge.locations.map(l => ({
                      ...l,
                      isRemove: (l.id === location.id && !l.isRemove) || l.id !== location.id,
                    })),
                  })
                }}
              />
            )}
            {currentStep === EnumMergeStep.OVERRIDES && (
              <MergeOverrides
                label={label.overrides}
                data={dataMerge.overrides}
                isSelected={isSelected}
                onSelect={(field: string, item: OverridesConflictsValueWithUId) => {
                  mergeResolveOverridesConflicts({ [field]: item })
                }}
              />
            )}
            {currentStep === EnumMergeStep.SUMMARY && (
              <Summary
                data={dataMerge}
                profileType={profileType.getProfileType}
                useCaseTypes={useCaseType?.getUseCaseType || []}
                isOutType={isOutType}
                overrides={props.mergeOverridesFn.data}
              />
            )}
          </Box>
          <Flex
            sx={{
              justifyContent: 'flex-end',
              paddingX: 40,
            }}
          >
            <Button
              disabled={loading}
              onPress={() => onCancel()}
              sx={{
                ml: '10px',
                height: '40px',
                width: '85px',
                backgroundColor: 'transparent',
                color: 'darkGray',
              }}
              label="Cancel"
            ></Button>
            {currentStep > 1 && (
              <Button
                disabled={loading}
                onPress={() =>
                  setCurrentStep(currentStep - (isOutType && currentStep === 3 ? 2 : 1))
                }
                sx={{
                  ml: '10px',
                  height: '40px',
                  width: '85px',
                  backgroundColor: 'transparent',
                  color: 'darkGray',
                  border: 'solid 1px',
                  borderColor: 'darkGray',
                }}
                label="Back"
              ></Button>
            )}
            <Button
              disabled={disableNextStep}
              onPress={() => {
                if (currentStep === steps.length) {
                  onFinish()
                  return
                }
                setCurrentStep(currentStep + (isOutType && currentStep === 1 ? 2 : 1))
              }}
              sx={{ ml: '10px', height: '40px', width: '85px' }}
              label={currentStep === steps.length ? 'Finish' : 'Next'}
            ></Button>
          </Flex>
        </Box>
      )}
    </>
  )
}

export default MergeData
