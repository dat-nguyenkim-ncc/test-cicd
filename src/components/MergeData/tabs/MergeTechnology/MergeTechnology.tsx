import React from 'react'
import MergeStepLayout from '../../MergeStepLayout'
import { Technology, TechnologyTypes } from '../../../../pages/CompanyForm/TechnologyForm'
import { Certification } from '../../../../pages/CompanyForm/CertificationForm'
import { TechnologyProvider } from '../../../../pages/CompanyForm/TechnologyProvider'
import TechnologyGroup from './TechnologyGroup'
import TechnologyCertificationGroup from './TechnologyCertification'
import TechnologyProviderGroup from './TechnologyProvider'
import Paragraph from '../../../primitives/Paragraph'

type TechnologyProps = {
  technology: Technology[]
  technologyCertification: Certification[]
  technologyProvider: TechnologyProvider[]
}

type MergeTechnologyProps = {
  label: string
  data: TechnologyProps
  technologyData: TechnologyProps
  onChange(data: TechnologyProps): void
}

const MergeTechnology = ({
  label,
  data,
  technologyData = {
    technology: [],
    technologyCertification: [],
    technologyProvider: [],
  },
  onChange,
}: MergeTechnologyProps) => {
  const allCertificationTypes = technologyData.technologyCertification.reduce((res, item) => {
    if (!res.includes(item.certification)) return [...res, item.certification]
    return res
  }, [] as string[])
  return (
    <MergeStepLayout
      sx={{ px: 6 }}
      label={label}
      isEmpty={
        !technologyData.technology?.length &&
        !technologyData.technologyCertification?.length &&
        !technologyData.technologyProvider?.length
      }
    >
      <Paragraph sx={{ fontSize: '15px', mb: 2 }} bold>
        {`Technology`}
      </Paragraph>
      {TechnologyTypes.map(({ id, text }, index: number) => {
        const filterFn = (item: Technology) => id === item.technology_type_id
        const dataOfType = technologyData.technology.filter(filterFn)
        if (!dataOfType?.length) return null
        return (
          <TechnologyGroup
            data={dataOfType}
            label={text}
            isMultiple={false}
            technology={data.technology.filter(filterFn)}
            key={`technology-${index}`}
            onChange={(technology: Technology, isAdd: boolean) => {
              let cloneUseCases = [...data.technology].filter(
                ({ technology_type_id }) => technology_type_id !== technology.technology_type_id
              )
              if (isAdd) {
                cloneUseCases.push(technology)
              } else {
                cloneUseCases = cloneUseCases.filter(
                  ({ technology_id }) => technology_id !== technology.technology_id
                )
              }
              onChange({ ...data, technology: cloneUseCases })
            }}
          />
        )
      })}
      <Paragraph sx={{ fontSize: '15px', mb: 2, mt: 4 }} bold>
        {`Technology Certification`}
      </Paragraph>
      {allCertificationTypes.map((value, index: number) => {
        const filterFn = (item: Certification) => value === item.certification
        const dataOfType = technologyData.technologyCertification.filter(filterFn)
        if (!dataOfType?.length) return null
        return (
          <TechnologyCertificationGroup
            data={dataOfType}
            label={value}
            isMultiple={true}
            technology={data.technologyCertification.filter(filterFn)}
            key={`technologyCertification-${index}`}
            onChange={(technology: Certification, isAdd: boolean) => {
              let cloneUseCases = [...data.technologyCertification]
              if (isAdd) {
                cloneUseCases.push(technology)
              } else {
                cloneUseCases = cloneUseCases.filter(
                  ({ certification_id }) => certification_id !== technology.certification_id
                )
              }
              onChange({ ...data, technologyCertification: cloneUseCases })
            }}
          />
        )
      })}
      <Paragraph sx={{ fontSize: '15px', mb: 2, mt: 4 }} bold>
        {`Technology Provider`}
      </Paragraph>
      {!!technologyData.technologyProvider.length && (
        <TechnologyProviderGroup
          data={technologyData.technologyProvider}
          isMultiple={true}
          technology={data.technologyProvider}
          key={`technologyProvider`}
          onChange={(technology: TechnologyProvider, isAdd: boolean) => {
            let cloneUseCases = [...data.technologyProvider]
            if (isAdd) {
              cloneUseCases.push(technology)
            } else {
              cloneUseCases = cloneUseCases.filter(
                ({ company_technology_provider_id }) =>
                  company_technology_provider_id !== technology.company_technology_provider_id
              )
            }
            onChange({ ...data, technologyProvider: cloneUseCases })
          }}
        />
      )}
    </MergeStepLayout>
  )
}

export default MergeTechnology
