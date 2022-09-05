import React from 'react'
import { Paragraph } from '../../../primitives'
import strings from '../../../../strings'
import { Box } from 'theme-ui'
import { DataMerge, MergeCompanyOverridesInput } from '../../MergeData'
import SummaryTaxonomy from './SummaryTaxonomy'
import SummaryTags from './SummaryTags'
import SummaryProfile from './SummaryProfile'
import { EnumCompanyTypeSector } from '../../../../types/enums'
import SummaryFintechType from './SummaryFintechType'
import SummaryOverrides from './SummaryOverrides'
import SummaryLocations from './SummaryLocations'
import { UseCaseTypeResult } from '../../../../pages/CompanyForm/UseCaseFormPage'
import SummaryUseCase from './SummaryUseCase'
import SummaryFundraising from './SummaryFundraising'
import SummaryTechnology from './SummaryTechnology'

type SummaryProps = {
  label?: string
  data: DataMerge
  profileType: any
  useCaseTypes: UseCaseTypeResult[]
  isOutType: boolean
  overrides: MergeCompanyOverridesInput[]
}

const Summary = ({
  label,
  data,
  profileType,
  useCaseTypes,
  isOutType,

  ...props
}: SummaryProps) => {
  const {
    merge: {
      label: { summary },
    },
  } = strings

  return (
    <Box sx={{ px: 60 }}>
      {label && (
        <Paragraph sx={{ fontSize: '20px' }} bold>
          {label}
        </Paragraph>
      )}
      <SummaryTaxonomy
        label={summary.pri}
        isPrimary
        data={
          data.primary?.find(
            ({ type }) =>
              type === EnumCompanyTypeSector.FIN ||
              type === EnumCompanyTypeSector.INS ||
              type === EnumCompanyTypeSector.REG
          ) && !isOutType
            ? data.primary
            : []
        }
      />
      <SummaryTaxonomy
        label={summary.aux}
        data={
          data.auxiliary && !isOutType
            ? data.auxiliary.map(dimension => ({ ...dimension, isPrimary: false }))
            : []
        }
      />
      <SummaryFintechType label={summary.fin} data={data.fintechType} />
      <SummaryTags label={summary.tag} data={data.tags} />
      <SummaryProfile
        label={summary.profile}
        data={{
          profiles: data.profiles || [],
          licenses: data.licenses || [],
        }}
        profileType={profileType}
      />
      <SummaryUseCase
        label={summary.useCase}
        data={{
          useCases: data.useCases || [],
          currentClients: data.currentClients || [],
        }}
        useCaseTypes={useCaseTypes}
      />
      <SummaryFundraising label={summary.fundraising} data={data.fundraisings} />
      <SummaryTechnology
        label={summary.technology}
        technology={data.technology}
        technologyCertification={data.technologyCertification}
        technologyProvider={data.technologyProvider}
      />
      <SummaryLocations label={summary.locations} data={data.locations} />
      <SummaryOverrides label={summary.overrides} data={props.overrides} />
    </Box>
  )
}

export default Summary
