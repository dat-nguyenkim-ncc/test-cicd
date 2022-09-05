import React from 'react'
import MergeStepLayout from '../../MergeStepLayout'
import { UseCaseTypeResult } from '../../../../pages/CompanyForm/UseCaseFormPage'
import { UseCaseResult } from '../../../UseCaseForm/UseCaseForm'
import UseCaseGroup from './UseCaseGroup'
import CurrentClientGroup from './CurrentClientGroup'
import strings from '../../../../strings'
import { CurrentClientResult } from '../../../CurrentClientForm/CurrentClientForm'

type MergeUseCaseProps = {
  label: string
  data: { useCases: UseCaseResult[]; currentClients: CurrentClientResult[] }
  useCaseType: UseCaseTypeResult[]
  useCases: UseCaseResult[]
  currentClients: CurrentClientResult[]
  onChange(data: { useCases: UseCaseResult[]; currentClients: CurrentClientResult[] }): void
}

const MergeUseCase = ({
  label,
  data,
  useCaseType,
  useCases = [],
  currentClients = [],
  onChange,
}: MergeUseCaseProps) => {
  const {
    pages: {
      addCompanyForm: { titles },
    },
  } = strings
  return (
    <MergeStepLayout
      sx={{ px: 6 }}
      label={label}
      isEmpty={![...data.useCases, ...data.currentClients]?.length}
    >
      {!!data.currentClients.length && (
        <CurrentClientGroup
          label={titles.currentClients}
          data={data.currentClients}
          clients={currentClients}
          onChange={(client, isAdd) => {
            let cloneClients = [...currentClients]
            if (isAdd) {
              cloneClients.push(client)
            } else {
              cloneClients = cloneClients.filter(({ client_id }) => client_id !== client.client_id)
            }
            onChange({ useCases, currentClients: cloneClients })
          }}
        />
      )}
      {!!data.useCases.length &&
        useCaseType.map((type: UseCaseTypeResult, index: number) => {
          const filterFn = (item: UseCaseResult) => type.useCaseTypeId === item.use_case_type_id
          const dataOfType = (data.useCases || []).filter(filterFn)
          if (!dataOfType?.length) return null
          return (
            <UseCaseGroup
              key={index}
              label={type.useCaseTypeName}
              data={dataOfType}
              useCases={useCases.filter(filterFn)}
              onChange={(useCase, isAdd) => {
                let cloneUseCases = [...useCases]
                if (!type.isMultiple) {
                  cloneUseCases = cloneUseCases.filter(
                    ({ use_case_type_id }) => use_case_type_id !== useCase.use_case_type_id
                  )
                }
                if (isAdd) {
                  cloneUseCases.push(useCase)
                } else {
                  cloneUseCases = cloneUseCases.filter(
                    ({ use_case_id }) => use_case_id !== useCase.use_case_id
                  )
                }
                onChange({ useCases: cloneUseCases, currentClients })
              }}
              isMultiple={type.isMultiple}
            />
          )
        })}
    </MergeStepLayout>
  )
}

export default MergeUseCase
