import strings from '../../strings'
import { ViewHistoryProps } from './CompanyForm'
import React, { useState } from 'react'
import CompanyFormsSectionLayout from '../../layouts/CompanyFormsSectionLayout'
import { FooterCTAs } from '../../components'
import { Routes } from '../../types/enums'
import { useHistory } from 'react-router'
import TechnologySubForm from './TechnologyForm'
import CertificationForm from './CertificationForm'
import { Heading } from '../../components/primitives'
import TechnologyProviderForm from './TechnologyProvider'
import { Box } from 'theme-ui'

export type TechnologyProps = {
  companyId: number
  onCancel(): void
  info?: React.ReactElement
  setError(err: Error): void
  setIsLoading?(isLoading: boolean): void
} & ViewHistoryProps

const TechnologyTotalForm = (props: TechnologyProps) => {
  const { companyId } = props
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const history = useHistory()

  const [technologyLoading, setTechnologyLoading] = useState(false)
  const [certificationLoading, setCertificationLoading] = useState(false)
  const [technologyProviderLoading, setTechnologyProviderLoading] = useState(false)

  const totalLoading = technologyLoading && certificationLoading && technologyProviderLoading

  return (
    <>
      <CompanyFormsSectionLayout title={copy.titles.technology} isLoading={totalLoading}>
        <Heading as="h3" sx={{ mb: 20 }}>
          {copy.titles.technology}
        </Heading>
        <TechnologySubForm {...props} setIsLoading={setTechnologyLoading}></TechnologySubForm>
        <Box sx={{ height: 50 }}></Box>
        <Heading as="h3">{copy.titles.technologyCertification}</Heading>
        <CertificationForm {...props} setIsLoading={setCertificationLoading}></CertificationForm>
        <Box sx={{ height: 50 }}></Box>
        <Heading as="h3">{copy.titles.technologyProvider}</Heading>
        <TechnologyProviderForm
          {...props}
          setIsLoading={setTechnologyProviderLoading}
        ></TechnologyProviderForm>
      </CompanyFormsSectionLayout>
      <FooterCTAs
        buttons={[
          {
            label: copy.buttons.backToCompanyRecord,
            variant: 'outlineWhite',
            onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
          },
        ]}
      />
    </>
  )
}
export default TechnologyTotalForm
